import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export const hasSupabaseAdminAccess = Boolean(
  isSupabaseConfigured && env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabaseAdminAccessMessage =
  "Configuracao admin do Supabase ausente. Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.";

export function createSupabaseAdminClient(): SupabaseClient {
  if (!hasSupabaseAdminAccess) {
    throw new Error(supabaseAdminAccessMessage);
  }

  if (!adminClient) {
    adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return adminClient;
}
