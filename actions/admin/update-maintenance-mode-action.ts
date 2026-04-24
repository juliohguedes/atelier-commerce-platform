"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminMaintenanceModeSchema,
 type AdminMaintenanceModeInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateMaintenanceModeResult {
 success: boolean;
 message: string;
}

export async function updateMaintenanceModeAction(
 input: AdminMaintenanceModeInput
): Promise<UpdateMaintenanceModeResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = adminMaintenanceModeSchema.parse(input);
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
 message: "Somente admin pode atualizar o modo manutenção."
 };
 }

 const { data: currentMaintenanceMode } = await supabase
 .from("maintenance_mode")
 .select("*")
 .eq("id", 1)
 .maybeSingle();

 await createSystemBackup({
 writer: supabase,
 contextArea: "admin",
 entityTable: "maintenance_mode",
 entityId: "1",
 backupReason: "before_maintenance_mode_update",
 snapshot: {
 maintenance_mode: currentMaintenanceMode ?? null
 },
 createdBy: user.id
 });

 const { error } = await supabase
 .from("maintenance_mode")
 .update({
 enabled: payload.enabled,
 message: payload.message,
 allow_roles: payload.allowRoles,
 starts_at: payload.startsAt ? new Date(payload.startsAt).toISOString() : null,
 ends_at: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
 updated_by: user.id,
 updated_at: new Date().toISOString()
 })
 .eq("id", 1);

 if (error) {
 return {
 success: false,
 message: "Não foi possível atualizar o modo manutenção."
 };
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.update_maintenance_mode",
 entity_table: "maintenance_mode",
 entity_id: "1",
 metadata: {
 enabled: payload.enabled,
 allow_roles: payload.allowRoles,
 starts_at: payload.startsAt ?? null,
 ends_at: payload.endsAt ?? null
 }
 });

 revalidatePath(ROUTES.private.admin);
 revalidatePath(ROUTES.public.home);
 revalidatePath(ROUTES.public.signIn);

 return {
 success: true,
 message: "Modo manutenção atualizado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao atualizar o modo manutenção."
 };
 }
}
