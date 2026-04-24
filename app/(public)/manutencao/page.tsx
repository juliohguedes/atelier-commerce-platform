import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface MaintenanceModeRow {
 enabled: boolean;
 message: string;
 starts_at: string | null;
 ends_at: string | null;
}

interface BrandContactRow {
 support_email: string | null;
 support_whatsapp: string | null;
}

export default async function MaintenancePage() {
 let message = "Sistema em manutenção programada.";
 let supportEmail: string | null = null;
 let supportWhatsapp: string | null = null;

 if (isSupabaseConfigured) {
 try {
 const supabase = await createSupabaseServerClient();

 const [maintenanceResponse, brandResponse] = await Promise.all([
 supabase
 .from("maintenance_mode")
 .select("enabled,message,starts_at,ends_at")
 .eq("id", 1)
 .maybeSingle<MaintenanceModeRow>(),
 supabase
 .from("brand_settings")
 .select("support_email,support_whatsapp")
 .eq("singleton_key", true)
 .maybeSingle<BrandContactRow>()
 ]);

 if (maintenanceResponse.data?.message) {
 message = maintenanceResponse.data.message;
 }

 supportEmail = brandResponse.data?.support_email ?? null;
 supportWhatsapp = brandResponse.data?.support_whatsapp ?? null;
 } catch {
 message = "Sistema em manutenção programada.";
 }
 }

 return (
 <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center py-12">
 <Card className="w-full border-gold-500/20 bg-card/80">
 <CardHeader className="space-y-2 text-center">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Modo manutenção</p>
 <CardTitle className="text-4xl">Voltamos em instantes</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4 text-center">
 <p className="text-sm text-muted-foreground">{message}</p>
 <p className="text-sm text-muted-foreground">
 Os acessos internos liberados pelo admin continuam disponíveis durante a janela
 técnica.
 </p>
 {supportEmail || supportWhatsapp ? (
 <div className="rounded-xl border border-border/70 bg-card/40 p-4 text-sm text-muted-foreground">
 {supportEmail ? <p>E-mail de suporte: {supportEmail}</p> : null}
 {supportWhatsapp ? <p>WhatsApp: {supportWhatsapp}</p> : null}
 </div>
 ) : null}
 </CardContent>
 </Card>
 </section>
 );
}
