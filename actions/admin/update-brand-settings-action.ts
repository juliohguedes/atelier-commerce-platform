"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminBrandSettingsSchema,
 type AdminBrandSettingsInput
} from "@/lib/validations/admin-panel";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateAdminBrandSettingsResult {
 success: boolean;
 message: string;
}

export async function updateAdminBrandSettingsAction(
 input: AdminBrandSettingsInput
): Promise<UpdateAdminBrandSettingsResult> {
 try {
 const payload = adminBrandSettingsSchema.parse(input);
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
 message: "Apenas admin pode editar configurações gerais da marca."
 };
 }

 const { data: currentBrandSettings } = await supabase
 .from("brand_settings")
 .select("*")
 .eq("singleton_key", true)
 .maybeSingle();

 await createSystemBackup({
 writer: supabase,
 contextArea: "admin",
 entityTable: "brand_settings",
 entityId: "singleton",
 backupReason: "before_brand_settings_update",
 snapshot: {
 brand_settings: currentBrandSettings ?? null
 },
 createdBy: user.id
 });

 const { error } = await supabase
 .from("brand_settings")
 .update({
 brand_name: payload.brandName,
 support_whatsapp: payload.supportWhatsapp ?? null,
 support_email: payload.supportEmail ?? null,
 address_text: payload.addressText ?? null,
 business_hours: payload.businessHours ?? null,
 instagram_url: payload.instagramUrl ?? null,
 facebook_url: payload.facebookUrl ?? null,
 tiktok_url: payload.tiktokUrl ?? null,
 legal_document_cnpj: payload.cnpj ?? null,
 maintenance_banner: payload.maintenanceBanner ?? null
 })
 .eq("singleton_key", true);

 if (error) {
 return {
 success: false,
 message: "Não foi possível salvar as configurações da marca."
 };
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.update_brand_settings",
 entity_table: "brand_settings",
 entity_id: "singleton",
 metadata: {
 updated_fields: Object.keys(payload)
 }
 });

 revalidatePath(ROUTES.public.home);
 revalidatePath(ROUTES.private.admin);

 return {
 success: true,
 message: "Configurações gerais da marca atualizadas com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao atualizar configurações da marca."
 };
 }
}
