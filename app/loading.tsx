import { Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background py-16 sm:py-24">
      <Container className="max-w-3xl">
        <section className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-soft sm:p-10">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-gold-400">
                Carregando experiencia
              </p>
              <h1 className="text-3xl sm:text-4xl">{BRAND_CONFIG.companyName}</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Estamos preparando a pagina com seguranca para voce. Isso costuma
                levar apenas alguns instantes.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="h-3 w-full rounded-full bg-muted/70" />
            <div className="h-3 w-5/6 rounded-full bg-muted/60" />
            <div className="h-3 w-2/3 rounded-full bg-muted/50" />
          </div>
        </section>
      </Container>
    </main>
  );
}
