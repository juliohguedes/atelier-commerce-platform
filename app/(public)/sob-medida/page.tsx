import { CustomOrderForm } from "@/components/forms/custom-order-form";
import { Container } from "@/components/ui/container";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ProfileRow {
 full_name: string | null;
 whatsapp: string | null;
}

function readUserMetadataString(
 metadata: Record<string, unknown>,
 keys: string[]
): string {
 for (const key of keys) {
 const value = metadata[key];
 if (typeof value === "string" && value.trim().length > 0) {
 return value.trim();
 }
 }

 return "";
}

async function getInitialCustomOrderContact() {
 if (!isSupabaseConfigured) {
 return null;
 }

 try {
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return null;
 }

 const metadata =
 user.user_metadata && typeof user.user_metadata === "object"
 ? (user.user_metadata as Record<string, unknown>)
 : {};
 const { data: profile } = await supabase
 .from("profiles")
 .select("full_name,whatsapp")
 .eq("id", user.id)
 .maybeSingle<ProfileRow>();

 const fullName =
 profile?.full_name ?? readUserMetadataString(metadata, ["full_name", "name"]) ?? "";

 return {
 fullName,
 email: user.email ?? "",
 contact: profile?.whatsapp ?? "",
 hasSavedContact: Boolean(profile?.whatsapp)
 };
 } catch {
 return null;
 }
}

export default async function TailoredPage() {
 const initialContact = await getInitialCustomOrderContact();

 return (
 <div className="relative overflow-hidden py-14 md:py-20">
 <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(191,161,90,0.18),transparent_58%),linear-gradient(180deg,rgba(18,15,10,0.98),rgba(18,15,10,0.92))]" />

 <Container className="space-y-10">
 <header className="space-y-4">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Atelier Digital</p>
 <h1 className="section-title max-w-3xl">Encomenda de peça personalizada</h1>
 <p className="max-w-3xl text-muted-foreground">
 Defina seu briefing completo, envie referências, veja o pré-orçamento e acompanhe o
 status da solicitação com protocolo. Todo o fluxo foi estruturado para atendimento
 online com continuidade via WhatsApp.
 </p>
 </header>

 <CustomOrderForm initialContact={initialContact} />
 </Container>
 </div>
 );
}
