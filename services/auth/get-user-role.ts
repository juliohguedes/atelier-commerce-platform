import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseUserRole, type UserRole } from "@/types/auth";

export async function getUserRole(userId: string): Promise<UserRole> {
 const supabase = await createSupabaseServerClient();

 const { data: roleRow, error: roleError } = await supabase
 .from("user_roles")
 .select("role")
 .eq("user_id", userId)
 .eq("is_active", true)
 .order("is_primary", { ascending: false })
 .order("created_at", { ascending: true })
 .limit(1)
 .maybeSingle();

 if (!roleError && roleRow?.role) {
 return parseUserRole(roleRow.role);
 }

 const { data: legacyProfile } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", userId)
 .maybeSingle();

 return parseUserRole(legacyProfile?.role);
}
