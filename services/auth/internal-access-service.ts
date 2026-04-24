import { createHash, randomInt, randomUUID } from "crypto";
import { createEmailAdapter } from "@/adapters/email/create-email-adapter";
import {
 INTERNAL_ACCESS_AUDIT_EVENTS,
 INTERNAL_ACCESS_MAX_ATTEMPTS
} from "@/lib/constants/security";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { maskEmail } from "@/lib/utils";
import type { InternalUserRole } from "@/types/auth";

interface InternalAccessChallengeRow {
 id: string;
 destination_email: string;
 role: InternalUserRole;
 code_hash: string;
 attempts: number;
 expires_at: string;
 status: "pending" | "verified" | "expired" | "revoked";
 session_token: string | null;
 session_expires_at: string | null;
}

export interface InternalAccessChallengeResult {
 expiresAt: string;
 maskedDestination: string;
}

export interface InternalAccessVerificationResult {
 sessionToken: string;
 sessionExpiresAt: string;
}

function hashCode(code: string): string {
 return createHash("sha256").update(code).digest("hex");
}

function createCode(): string {
 return randomInt(100000, 1000000).toString();
}

export async function createInternalAccessChallenge(input: {
 userId: string;
 role: InternalUserRole;
 email: string;
}): Promise<InternalAccessChallengeResult> {
 const supabase = await createSupabaseServerClient();
 const code = createCode();
 const now = new Date();
 const expiresAt = new Date(
 now.getTime() + env.INTERNAL_ACCESS_CODE_TTL_MINUTES * 60 * 1000
 ).toISOString();

 await supabase
 .from("internal_access_challenges")
 .update({
 status: "revoked",
 revoked_at: now.toISOString()
 })
 .eq("user_id", input.userId)
 .eq("role", input.role)
 .eq("status", "pending");

 const { error } = await supabase.from("internal_access_challenges").insert({
 user_id: input.userId,
 role: input.role,
 destination_email: input.email.trim().toLowerCase(),
 code_hash: hashCode(code),
 expires_at: expiresAt,
 attempts: 0,
 status: "pending"
 });

 if (error) {
 throw new Error("Não foi possível gerar o codigo de acesso interno.");
 }

 await createEmailAdapter().sendTransactionalEmail({
 to: input.email,
 subject: "Codigo de acesso interno",
 text: `Seu codigo de acesso interno e ${code}. Ele expira em ${env.INTERNAL_ACCESS_CODE_TTL_MINUTES} minutos.`,
 html: `<p>Seu codigo de acesso interno e <strong>${code}</strong>.</p><p>Ele expira em ${env.INTERNAL_ACCESS_CODE_TTL_MINUTES} minutos.</p>`,
 metadata: {
 channel: "internal_access",
 role: input.role
 }
 });

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: input.userId,
 actor_role: input.role,
 event_name: INTERNAL_ACCESS_AUDIT_EVENTS.requestCode,
 entity_table: "internal_access_challenges",
 entity_id: input.userId,
 metadata: {
 role: input.role,
 destination: maskEmail(input.email),
 expires_at: expiresAt
 }
 });

 return {
 expiresAt,
 maskedDestination: maskEmail(input.email)
 };
}

export async function verifyInternalAccessChallenge(input: {
 userId: string;
 role: InternalUserRole;
 code: string;
}): Promise<InternalAccessVerificationResult> {
 const supabase = await createSupabaseServerClient();
 const { data: challenge } = await supabase
 .from("internal_access_challenges")
 .select(
 "id,destination_email,role,code_hash,attempts,expires_at,status,session_token,session_expires_at"
 )
 .eq("user_id", input.userId)
 .eq("role", input.role)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle<InternalAccessChallengeRow>();

 if (!challenge || challenge.status !== "pending") {
 throw new Error("Solicite um novo codigo de acesso para continuar.");
 }

 if (new Date(challenge.expires_at).getTime() < Date.now()) {
 await supabase
 .from("internal_access_challenges")
 .update({
 status: "expired"
 })
 .eq("id", challenge.id);

 throw new Error("O codigo expirou. Solicite um novo envio.");
 }

 if (challenge.code_hash !== hashCode(input.code)) {
 const attempts = Number(challenge.attempts ?? 0) + 1;
 await supabase
 .from("internal_access_challenges")
 .update({
 attempts,
 status: attempts >= INTERNAL_ACCESS_MAX_ATTEMPTS ? "revoked" : challenge.status,
 revoked_at: attempts >= INTERNAL_ACCESS_MAX_ATTEMPTS ? new Date().toISOString() : null
 })
 .eq("id", challenge.id);

 throw new Error(
 attempts >= INTERNAL_ACCESS_MAX_ATTEMPTS
 ? "Número máximo de tentativas atingido. Solicite um novo codigo."
 : "Codigo invalido."
 );
 }

 const sessionToken = randomUUID();
 const sessionExpiresAt = new Date(
 Date.now() + env.INTERNAL_ACCESS_SESSION_HOURS * 60 * 60 * 1000
 ).toISOString();

 const { error } = await supabase
 .from("internal_access_challenges")
 .update({
 status: "verified",
 verified_at: new Date().toISOString(),
 session_token: sessionToken,
 session_expires_at: sessionExpiresAt
 })
 .eq("id", challenge.id);

 if (error) {
 throw new Error("Não foi possível validar o acesso interno.");
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: input.userId,
 actor_role: input.role,
 event_name: INTERNAL_ACCESS_AUDIT_EVENTS.verifyCode,
 entity_table: "internal_access_challenges",
 entity_id: challenge.id,
 metadata: {
 role: input.role,
 session_expires_at: sessionExpiresAt,
 destination: maskEmail(challenge.destination_email)
 }
 });

 return {
 sessionToken,
 sessionExpiresAt
 };
}
