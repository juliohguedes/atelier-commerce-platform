import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background py-16 sm:py-24">
      <Container className="max-w-3xl">
        <section className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-soft sm:p-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-gold-400">
              Erro 404
            </p>
            <h1 className="text-4xl sm:text-5xl">Pagina nao encontrada</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              O endereco acessado nao existe mais, foi alterado ou ainda nao esta
              disponivel nesta demonstracao.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              className={cn(buttonVariants({ variant: "default" }), "justify-center")}
              href={ROUTES.public.home}
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao inicio
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
              href={ROUTES.public.shop}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ir para a loja
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "ghost" }), "justify-center")}
              href={ROUTES.public.contact}
            >
              <Search className="mr-2 h-4 w-4" />
              Falar com a marca
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
