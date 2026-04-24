import type { Route } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

interface SignInPageProps {
 searchParams: Promise<{
 reset?: string;
 }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
 const params = await searchParams;
 const hasPasswordReset = params.reset === "success";

 return (
 <div className="mx-auto w-full max-w-md">
 <div className="mb-6 space-y-2 text-center">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Acesso</p>
 <h1 className="text-4xl">Bem-vindo(a)</h1>
 <p className="text-sm text-muted-foreground">
 Entre para acompanhar pedidos, personalizações e áreas internas.
 </p>
 </div>

 <div className="mb-4 rounded-md border border-border/70 bg-card/50 p-3 text-xs text-muted-foreground">
 <p className="mb-2 font-medium text-foreground">Entradas separadas por setor:</p>
 <div className="flex flex-wrap gap-2">
 <Link className="rounded border border-border px-2 py-1 hover:border-gold-500/60 hover:text-gold-400" href={"/entrar/admin" as Route}>
 Admin
 </Link>
 <Link className="rounded border border-border px-2 py-1 hover:border-gold-500/60 hover:text-gold-400" href={"/entrar/financeiro" as Route}>
 Financeiro
 </Link>
 <Link className="rounded border border-border px-2 py-1 hover:border-gold-500/60 hover:text-gold-400" href={"/entrar/vendas-estoque" as Route}>
 Vendas e estoque
 </Link>
 </div>
 </div>

 {hasPasswordReset ? (
 <p className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-500">
 Senha redefinida com sucesso. Entre com sua nova senha.
 </p>
 ) : null}

 <LoginForm />
 </div>
 );
}

