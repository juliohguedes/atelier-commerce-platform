"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminAuxiliaryContentFormSchema,
 siteAuxiliaryContentSchema,
 type AdminAuxiliaryContentFormInput
} from "@/lib/validations/site-content";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateSiteAuxiliaryContentResult {
 success: boolean;
 message: string;
}

function parseJsonBlock<T>(label: string, value: string): T {
 try {
 return JSON.parse(value) as T;
 } catch {
 throw new Error(`O bloco ${label} precisa estar em JSON valido.`);
 }
}

export async function updateSiteAuxiliaryContentAction(
 input: AdminAuxiliaryContentFormInput
): Promise<UpdateSiteAuxiliaryContentResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = adminAuxiliaryContentFormSchema.parse(input);
 const contentCandidate = {
 galleryPieces: parseJsonBlock("galeria de peças", payload.galleryJson),
 featuredCollections: parseJsonBlock("coleções em destaque", payload.collectionsJson),
 testimonials: parseJsonBlock("depoimentos", payload.testimonialsJson),
 faqItems: parseJsonBlock("FAQ", payload.faqJson),
 legalSections: parseJsonBlock("termos e política", payload.legalJson),
 locationInfo: parseJsonBlock("mapa e localização", payload.locationJson)
 };

 const content = siteAuxiliaryContentSchema.parse(contentCandidate);
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
 message: "Somente admin pode atualizar as áreas auxiliares."
 };
 }

 const { data: currentAuxiliaryContent } = await supabase
 .from("site_auxiliary_content")
 .select("*")
 .eq("singleton_key", true)
 .maybeSingle();

 await createSystemBackup({
 writer: supabase,
 contextArea: "admin",
 entityTable: "site_auxiliary_content",
 entityId: "singleton",
 backupReason: "before_site_auxiliary_update",
 snapshot: {
 site_auxiliary_content: currentAuxiliaryContent ?? null
 },
 createdBy: user.id
 });

 const { error } = await supabase.from("site_auxiliary_content").upsert(
 {
 singleton_key: true,
 gallery_pieces: content.galleryPieces,
 featured_collections: content.featuredCollections,
 testimonials: content.testimonials,
 faq_items: content.faqItems,
 legal_sections: content.legalSections,
 location_info: content.locationInfo
 },
 {
 onConflict: "singleton_key"
 }
 );

 if (error) {
 return {
 success: false,
 message: "Não foi possível salvar as áreas auxiliares do site."
 };
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.update_site_auxiliary_content",
 entity_table: "site_auxiliary_content",
 entity_id: "singleton",
 metadata: {
 gallery_count: content.galleryPieces.length,
 collections_count: content.featuredCollections.length,
 testimonials_count: content.testimonials.length,
 faq_count: content.faqItems.length,
 legal_count: content.legalSections.length
 }
 });

 revalidatePath(ROUTES.public.home);
 revalidatePath(ROUTES.public.contact);
 revalidatePath(ROUTES.private.admin);
 revalidatePath(ROUTES.private.adminAuxiliary);
 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message: "Áreas auxiliares atualizadas com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao atualizar as áreas auxiliares."
 };
 }
}
