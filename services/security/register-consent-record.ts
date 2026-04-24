import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConsentSlug } from "@/lib/constants/compliance";

interface RegisterConsentRecordInput {
 writer: SupabaseClient;
 userId?: string | null;
 email?: string | null;
 consentSlug: ConsentSlug;
 consentVersion: string;
 contextTable?: string | null;
 contextId?: string | null;
 acceptedAt?: string;
 metadata?: Record<string, unknown>;
}

export async function registerConsentRecord(
 input: RegisterConsentRecordInput
): Promise<void> {
 const { error } = await input.writer.from("consent_records").insert({
 user_id: input.userId ?? null,
 email: input.email ?? null,
 consent_slug: input.consentSlug,
 consent_version: input.consentVersion,
 accepted: true,
 accepted_at: input.acceptedAt ?? new Date().toISOString(),
 context_table: input.contextTable ?? null,
 context_id: input.contextId ?? null,
 metadata: input.metadata ?? {}
 });

 if (error) {
 throw new Error("Não foi possível registrar o consentimento.");
 }
}
