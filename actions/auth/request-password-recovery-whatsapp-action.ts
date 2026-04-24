"use server";

import { createHash, randomInt } from "crypto";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { passwordRecoverySchema, type PasswordRecoveryInput } from "@/lib/validations/auth";
import { passwordRecoveryService } from "@/services/auth/password-recovery-service";

interface RequestPasswordRecoveryWhatsAppResult {
 success: boolean;
 message: string;
}

interface ProfileRecoveryRow {
 id: string;
 email: string | null;
 whatsapp: string | null;
}

function hashRecoveryCode(code: string): string {
 return createHash("sha256").update(code).digest("hex");
}

export async function requestPasswordRecoveryWhatsAppAction(
 input: PasswordRecoveryInput
): Promise<RequestPasswordRecoveryWhatsAppResult> {
 if (!isSupabaseConfigured || !env.SUPABASE_SERVICE_ROLE_KEY) {
 return {
 success: false,
 message: "Recuperação complementar por WhatsApp indisponivel sem credenciais admin."
 };
 }

 try {
 const payload = passwordRecoverySchema.parse(input);
 const admin = createSupabaseAdminClient();
 const normalizedEmail = payload.email.trim().toLowerCase();

 const { data: profile } = await admin
 .from("profiles")
 .select("id,email,whatsapp")
 .eq("email", normalizedEmail)
 .maybeSingle<ProfileRecoveryRow>();

 if (!profile?.whatsapp || !profile.email) {
 return {
 success: true,
 message: "Nenhum WhatsApp complementar precisou ser acionado."
 };
 }

 const recoveryCode = randomInt(100000, 1000000).toString();
 const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

 await admin.from("auth_recovery_requests").insert({
 user_id: profile.id,
 channel: "whatsapp",
 destination: profile.whatsapp,
 status: "sent",
 token_hash: hashRecoveryCode(recoveryCode),
 expires_at: expiresAt,
 metadata: {
 email: profile.email,
 provider: "mock_whatsapp_recovery"
 }
 });

 await passwordRecoveryService.requestWhatsAppRecovery({
 email: profile.email,
 whatsapp: profile.whatsapp,
 recoveryCode,
 expiresAt
 });

 return {
 success: true,
 message: "Fluxo complementar por WhatsApp preparado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao preparar recuperação via WhatsApp."
 };
 }
}
