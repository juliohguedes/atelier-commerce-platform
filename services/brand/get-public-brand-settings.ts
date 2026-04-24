import { BRAND_CONFIG } from "@/lib/constants/brand";
import { homeLocationInfo } from "@/lib/constants/homepage";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PublicBrandSettings {
 brandName: string;
 supportEmail: string;
 supportWhatsapp: string;
 addressText: string;
 businessHours: string;
 maintenanceBanner: string | null;
}

interface PublicBrandSettingsRow {
 brand_name: string | null;
 support_email: string | null;
 support_whatsapp: string | null;
 address_text: string | null;
 business_hours: string | null;
 maintenance_banner: string | null;
}

function buildFallback(): PublicBrandSettings {
 return {
 brandName: BRAND_CONFIG.companyName,
 supportEmail: BRAND_CONFIG.contactEmail,
 supportWhatsapp: BRAND_CONFIG.contactPhone,
 addressText: BRAND_CONFIG.showroomAddress,
 businessHours: homeLocationInfo.openingHours,
 maintenanceBanner: null
 };
}

export async function getPublicBrandSettings(): Promise<PublicBrandSettings> {
 const fallback = buildFallback();

 if (!isSupabaseConfigured) {
 return fallback;
 }

 try {
 const supabase = await createSupabaseServerClient();
 const { data, error } = await supabase
 .from("brand_settings")
 .select(
 "brand_name,support_email,support_whatsapp,address_text,business_hours,maintenance_banner"
 )
 .eq("singleton_key", true)
 .maybeSingle<PublicBrandSettingsRow>();

 if (error || !data) {
 return fallback;
 }

 return {
 brandName: data.brand_name?.trim() || fallback.brandName,
 supportEmail: data.support_email?.trim() || fallback.supportEmail,
 supportWhatsapp: data.support_whatsapp?.trim() || fallback.supportWhatsapp,
 addressText: data.address_text?.trim() || fallback.addressText,
 businessHours: data.business_hours?.trim() || fallback.businessHours,
 maintenanceBanner: data.maintenance_banner?.trim() || null
 };
 } catch {
 return fallback;
 }
}
