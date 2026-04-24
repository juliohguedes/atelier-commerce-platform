"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import "./globals.css";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground">
        <main className="min-h-screen px-6 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card/70 p-8 shadow-soft sm:p-10">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-sm uppercase tracking-[0.24em] text-gold-400">
                Erro global
              </p>
              <h1 className="text-4xl sm:text-5xl">
                O projeto encontrou uma falha critica
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Esta e uma camada de seguranca para evitar tela branca em caso de
                falha estrutural. Voce pode tentar recarregar o fluxo ou voltar para
                a pagina inicial.
              </p>
              {error.digest ? (
                <p className="text-xs text-muted-foreground">
                  Referencia tecnica: <code>{error.digest}</code>
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold-400"
                onClick={reset}
                type="button"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar novamente
              </button>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:border-gold-500 hover:text-gold-400"
                href={ROUTES.public.home}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao inicio
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
