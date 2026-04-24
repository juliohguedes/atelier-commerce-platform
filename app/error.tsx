"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background py-16 sm:py-24">
      <Container className="max-w-3xl">
        <section className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-soft sm:p-10">
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-sm uppercase tracking-[0.24em] text-gold-400">
              Falha inesperada
            </p>
            <h1 className="text-4xl sm:text-5xl">Algo saiu do esperado</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Encontramos um erro ao carregar esta area. Voce pode tentar novamente
              agora ou voltar para uma rota segura do projeto.
            </p>
            {error.digest ? (
              <p className="text-xs text-muted-foreground">
                Referencia tecnica: <code>{error.digest}</code>
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className={cn(buttonVariants({ variant: "default" }))}
              onClick={reset}
              type="button"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Tentar novamente
            </button>
            <Link className={cn(buttonVariants({ variant: "outline" }))} href={ROUTES.public.home}>
              <Home className="mr-2 h-4 w-4" />
              Ir para o inicio
            </Link>
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href={ROUTES.public.shop}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Abrir loja
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
