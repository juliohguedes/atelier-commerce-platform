"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminInternalAccessSchema,
 type AdminInternalAccessInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";
import type { InternalSectorRole } from "@/types/internal-panels";

interface ManageInternalAccessResult {
 success: boolean;
 message: string;
}

interface ProfileRow {
 id: string;
 full_name: string | null;
 email: string | null;
}

interface UserRoleRow {
 id: number;
 user_id: string;
 role: InternalSectorRole;
 is_primary: boolean;
 is_active: boolean;
}

export async function manageInternalAccessAction(
 input: AdminInternalAccessInput
): Promise<ManageInternalAccessResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = adminInternalAccessSchema.parse(input);
 const normalizedEmail = payload.email.trim().toLowerCase();
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

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
 message: "Somente admin pode criar ou ajustar acessos internos."
 };
 }

 const adminClient = env.SUPABASE_SERVICE_ROLE_KEY ? createSupabaseAdminClient() : null;
 const writer = adminClient ?? sessionClient;

 let targetUserId: string | null = null;
 let invitationSent = false;

 const { data: existingProfile } = await writer
 .from("profiles")
 .select("id,full_name,email")
 .eq("email", normalizedEmail)
 .maybeSingle<ProfileRow>();

 if (existingProfile) {
 targetUserId = existingProfile.id;
 }

 if (!targetUserId && adminClient) {
 const inviteResponse = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
 data: {
 full_name: payload.fullName
 },
 redirectTo: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.public.signIn}`
 });

 if (inviteResponse.error || !inviteResponse.data.user) {
 return {
 success: false,
 message:
 inviteResponse.error?.message ?? "Não foi possível enviar o convite de acesso interno."
 };
 }

 targetUserId = inviteResponse.data.user.id;
 invitationSent = true;

 await adminClient.from("profiles").upsert({
 id: targetUserId,
 full_name: payload.fullName,
 email: normalizedEmail
 });
 }

 if (!targetUserId) {
 return {
 success: false,
 message:
 "Não foi encontrado um cadastro existente com esse e-mail. Configure SUPABASE_SERVICE_ROLE_KEY para permitir convites automaticos."
 };
 }

 if (payload.isPrimary) {
 await writer.from("user_roles").update({ is_primary: false }).eq("user_id", targetUserId);
 }

 const { data: existingRole } = await writer
 .from("user_roles")
 .select("id,user_id,role,is_primary,is_active")
 .eq("user_id", targetUserId)
 .eq("role", payload.role)
 .maybeSingle<UserRoleRow>();

 await createSystemBackup({
 writer: writer,
 contextArea: "admin",
 entityTable: "user_roles",
 entityId: targetUserId,
 backupReason: "before_internal_access_update",
 snapshot: {
 profile: existingProfile ?? null,
 role: existingRole ?? null
 },
 createdBy: user.id
 });

 await writer
 .from("profiles")
 .update({
 full_name: payload.fullName,
 email: normalizedEmail
 })
 .eq("id", targetUserId);

 if (existingRole) {
 await writer
 .from("user_roles")
 .update({
 is_primary: payload.isPrimary,
 is_active: true,
 granted_by: user.id
 })
 .eq("id", existingRole.id);
 } else {
 await writer.from("user_roles").insert({
 user_id: targetUserId,
 role: payload.role,
 is_primary: payload.isPrimary,
 is_active: true,
 granted_by: user.id
 });
 }

 await writer.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.manage_internal_access",
 entity_table: "user_roles",
 entity_id: targetUserId,
 metadata: {
 access_email: normalizedEmail,
 access_role: payload.role,
 is_primary: payload.isPrimary,
 invitation_sent: invitationSent
 }
 });

 revalidatePath(ROUTES.private.admin);

 return {
 success: true,
 message: invitationSent
 ? "Acesso interno criado e convite enviado com sucesso."
 : "Acesso interno atualizado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao gerenciar o acesso interno."
 };
 }
}
