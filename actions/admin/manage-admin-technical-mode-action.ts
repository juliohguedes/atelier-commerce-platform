"use server";

import { revalidatePath } from "next/cache";
import { adminTechnicalAuditEventName } from "@/lib/constants/internal-panels";
import { ROUTES } from "@/lib/constants/routes";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminTechnicalDraftSchema,
 type AdminTechnicalDraftInput
} from "@/lib/validations/admin-panel";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface ManageAdminTechnicalModeResult {
 success: boolean;
 message: string;
}

interface BrandTechnicalRow {
 technical_draft_payload: Record<string, unknown> | null;
 technical_draft_owner: string | null;
 technical_published_payload: Record<string, unknown> | null;
 technical_previous_payload: Record<string, unknown> | null;
 technical_published_version: number;
}

function parseJsonPayload(payloadJson: string | undefined): Record<string, unknown> | null {
 if (!payloadJson || payloadJson.trim().length === 0) {
 return null;
 }

 const parsed = JSON.parse(payloadJson) as unknown;

 if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
 throw new Error("Payload técnico precisa ser um objeto JSON valido.");
 }

 return parsed as Record<string, unknown>;
}

export async function manageAdminTechnicalModeAction(
 input: AdminTechnicalDraftInput
): Promise<ManageAdminTechnicalModeResult> {
 try {
 const payload = adminTechnicalDraftSchema.parse(input);

 if (!env.INTERNAL_ADMIN_TECHNICAL_PASSWORD) {
 return {
 success: false,
 message:
 "Senha do modo técnico não configurada. Defina INTERNAL_ADMIN_TECHNICAL_PASSWORD."
 };
 }

 if (payload.unlockPassword !== env.INTERNAL_ADMIN_TECHNICAL_PASSWORD) {
 return {
 success: false,
 message: "Senha do modo técnico invalida."
 };
 }

 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Autenticação obrigatória."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== "admin") {
 return {
 success: false,
 message: "Apenas admin pode operar o modo técnico."
 };
 }

 const { data: technicalRow } = await supabase
 .from("brand_settings")
 .select(
 "technical_draft_payload,technical_draft_owner,technical_published_payload,technical_previous_payload,technical_published_version"
 )
 .eq("singleton_key", true)
 .maybeSingle<BrandTechnicalRow>();

 if (!technicalRow) {
 return {
 success: false,
 message: "Configuração técnica da marca não encontrada."
 };
 }

 const parsedPayload =
 payload.mode === "restore_last_published"
 ? null
 : parseJsonPayload(payload.payloadJson);

 await createSystemBackup({
 writer: supabase,
 contextArea: "admin",
 entityTable: "brand_settings",
 entityId: "singleton",
 backupReason: `before_technical_mode_${payload.mode}`,
 snapshot: {
 technical_row: technicalRow
 },
 createdBy: user.id
 });

 if (payload.mode === "save_draft") {
 if (!parsedPayload) {
 return {
 success: false,
 message: "Informe um payload JSON para salvar como rascunho técnico."
 };
 }

 const { error } = await supabase
 .from("brand_settings")
 .update({
 technical_draft_payload: parsedPayload,
 technical_draft_owner: user.id
 })
 .eq("singleton_key", true);

 if (error) {
 return {
 success: false,
 message: "Não foi possível salvar o rascunho técnico."
 };
 }
 }

 if (payload.mode === "publish") {
 const nextPayload = parsedPayload ?? technicalRow.technical_draft_payload;

 if (!nextPayload) {
 return {
 success: false,
 message: "Não existe rascunho técnico para publicar."
 };
 }

 const { error } = await supabase
 .from("brand_settings")
 .update({
 technical_previous_payload: technicalRow.technical_published_payload ?? {},
 technical_published_payload: nextPayload,
 technical_published_version: Number(technicalRow.technical_published_version ?? 0) + 1,
 technical_last_published_at: new Date().toISOString(),
 technical_last_published_by: user.id
 })
 .eq("singleton_key", true);

 if (error) {
 return {
 success: false,
 message: "Não foi possível publicar o modo técnico."
 };
 }
 }

 if (payload.mode === "restore_last_published") {
 const backupPayload = technicalRow.technical_previous_payload;

 if (!backupPayload) {
 return {
 success: false,
 message: "Não existe versão anterior para restaurar."
 };
 }

 const { error } = await supabase
 .from("brand_settings")
 .update({
 technical_published_payload: backupPayload,
 technical_last_published_at: new Date().toISOString(),
 technical_last_published_by: user.id
 })
 .eq("singleton_key", true);

 if (error) {
 return {
 success: false,
 message: "Não foi possível restaurar a ultima versão publicada."
 };
 }
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: adminTechnicalAuditEventName,
 entity_table: "brand_settings",
 entity_id: "singleton",
 metadata: {
 operation_mode: payload.mode,
 operation_note: payload.operationNote ?? null,
 unlocked_by_user_id: user.id,
 executed_at: new Date().toISOString()
 }
 });

 revalidatePath(ROUTES.private.admin);

 return {
 success: true,
 message:
 payload.mode === "save_draft"
 ? "Rascunho técnico salvo com sucesso."
 : payload.mode === "publish"
 ? "Publicação técnica concluída com backup da versão anterior."
 : "Ultima versão publicada restaurada com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao processar modo técnico."
 };
 }
}

