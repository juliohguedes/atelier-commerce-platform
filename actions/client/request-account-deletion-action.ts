"use server";

import { revalidatePath } from "next/cache";
import { COMPLIANCE_VERSIONS, CONSENT_SLUGS } from "@/lib/constants/compliance";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 accountDeletionRequestSchema,
 type AccountDeletionRequestInput
} from "@/lib/validations/client-area";
import { queueClientNotifications } from "@/services/client-area/queue-client-notifications";
import { registerConsentRecord } from "@/services/security/register-consent-record";

interface RequestAccountDeletionActionResult {
 success: boolean;
 message: string;
}

interface ExistingDeletionRequestRow {
 id: string;
 status: "pending" | "in_review" | "approved" | "rejected" | "completed";
}

export async function requestAccountDeletionAction(
 input: AccountDeletionRequestInput
): Promise<RequestAccountDeletionActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para exclusão de conta."
 };
 }

 try {
 const payload = accountDeletionRequestSchema.parse(input);
 const supabase = await createSupabaseServerClient();

 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Sua sessão expirou. Faca login novamente."
 };
 }

 const { data: existingRequest } = await supabase
 .from("account_deletion_requests")
 .select("id,status")
 .eq("user_id", user.id)
 .in("status", ["pending", "in_review"])
 .order("requested_at", { ascending: false })
 .limit(1)
 .maybeSingle<ExistingDeletionRequestRow>();

 if (existingRequest) {
 return {
 success: true,
 message: "Já existe uma solicitação de exclusão em andamento para sua conta."
 };
 }

 const { error: insertError } = await supabase
 .from("account_deletion_requests")
 .insert({
 user_id: user.id,
 reason: payload.reason,
 status: "pending"
 });

 if (insertError) {
 return {
 success: false,
 message: "Não foi possível registrar sua solicitação de exclusão agora."
 };
 }

 await registerConsentRecord({
 writer: supabase,
 userId: user.id,
 email: user.email ?? null,
 consentSlug: CONSENT_SLUGS.accountDeletionRequest,
 consentVersion: COMPLIANCE_VERSIONS.accountDeletionFlow,
 contextTable: "account_deletion_requests",
 contextId: user.id,
 metadata: {
 reason: payload.reason
 }
 });

 try {
 await queueClientNotifications({
 userId: user.id,
 channels: ["in_app", "email"],
 title: "Solicitação de exclusão registrada",
 body: "Recebemos sua solicitação. Nossa equipe fara a análise e retornara em breve.",
 payload: {
 action: "account_deletion_request"
 }
 });
 } catch {
 // ignore notification enqueue errors to avoid blocking the main flow
 }

 revalidatePath(ROUTES.private.clientAccount);

 return {
 success: true,
 message: "Solicitação enviada com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao solicitar exclusão da conta."
 };
 }
}
