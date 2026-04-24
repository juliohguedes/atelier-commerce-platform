import {
 homeCollections,
 homeFaqItems,
 homeLegalSections,
 homeLocationInfo,
 homePieces,
 homeTestimonials
} from "@/lib/constants/homepage";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 siteAuxiliaryContentSchema,
 type SiteAuxiliaryContent
} from "@/lib/validations/site-content";

interface SiteAuxiliaryContentRow {
 gallery_pieces: unknown;
 featured_collections: unknown;
 testimonials: unknown;
 faq_items: unknown;
 legal_sections: unknown;
 location_info: unknown;
}

export function buildDefaultSiteAuxiliaryContent(): SiteAuxiliaryContent {
 return {
 galleryPieces: homePieces,
 featuredCollections: homeCollections,
 testimonials: homeTestimonials,
 faqItems: homeFaqItems,
 legalSections: homeLegalSections,
 locationInfo: homeLocationInfo
 };
}

export async function getSiteAuxiliaryContent(): Promise<SiteAuxiliaryContent> {
 const fallback = buildDefaultSiteAuxiliaryContent();

 if (!isSupabaseConfigured) {
 return fallback;
 }

 try {
 const supabase = await createSupabaseServerClient();
 const { data, error } = await supabase
 .from("site_auxiliary_content")
 .select(
 "gallery_pieces,featured_collections,testimonials,faq_items,legal_sections,location_info"
 )
 .eq("singleton_key", true)
 .maybeSingle<SiteAuxiliaryContentRow>();

 if (error || !data) {
 return fallback;
 }

 const parsed = siteAuxiliaryContentSchema.safeParse({
 galleryPieces: data.gallery_pieces,
 featuredCollections: data.featured_collections,
 testimonials: data.testimonials,
 faqItems: data.faq_items,
 legalSections: data.legal_sections,
 locationInfo: data.location_info
 });

 return parsed.success ? parsed.data : fallback;
 } catch {
 return fallback;
 }
}
