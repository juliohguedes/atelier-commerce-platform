import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onlyDigits } from "@/lib/validations/br";

function resolveNextPath(rawNext: string | null): string {
 if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
 return ROUTES.private.dashboard;
 }

 return rawNext;
}

function readMetadataString(
 metadata: Record<string, unknown>,
 keys: string[]
): string | null {
 for (const key of keys) {
 const value = metadata[key];
 if (typeof value === "string" && value.trim().length > 0) {
 return value.trim();
 }
 }

 return null;
}

async function syncProfileFromOAuthSession(
 supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return;
 }

 const metadata =
 user.user_metadata && typeof user.user_metadata === "object"
 ? (user.user_metadata as Record<string, unknown>)
 : {};
 const { data: existingProfile } = await supabase
 .from("profiles")
 .select("full_name,whatsapp")
 .eq("id", user.id)
 .maybeSingle<{ full_name: string | null; whatsapp: string | null }>();

 const fullName =
 readMetadataString(metadata, ["full_name", "name"]) ?? existingProfile?.full_name ?? user.email?.split("@")[0] ?? "Cliente";
 const contact =
 existingProfile?.whatsapp ?? (() => {
 const rawContact = readMetadataString(metadata, ["whatsapp", "phone", "phone_number"]);
 if (!rawContact) {
 return null;
 }

 const normalized = onlyDigits(rawContact);
 return normalized.length >= 10 ? normalized : null;
 })();

 await supabase.from("profiles").upsert(
 {
 id: user.id,
 full_name: fullName,
 email: user.email ?? null,
 whatsapp: contact,
 preferred_locale: "pt-BR"
 },
 {
 onConflict: "id"
 }
 );
}

export async function GET(request: Request) {
 const requestUrl = new URL(request.url);
 const code = requestUrl.searchParams.get("code");
 const nextPath = resolveNextPath(requestUrl.searchParams.get("next"));

 if (code) {
 const supabase = await createSupabaseServerClient();
 const { error } = await supabase.auth.exchangeCodeForSession(code);

 if (error) {
 return NextResponse.redirect(new URL(ROUTES.public.signIn, requestUrl.origin));
 }

 await syncProfileFromOAuthSession(supabase);
 }

 const redirectUrl = new URL(nextPath, requestUrl.origin);
 return NextResponse.redirect(redirectUrl);
}
