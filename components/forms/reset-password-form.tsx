"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export function ResetPasswordForm() {
 const [isPending, setIsPending] = useState(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const router = useRouter();

 const form = useForm<ResetPasswordInput>({
 resolver: zodResolver(resetPasswordSchema),
 defaultValues: {
 password: "",
 confirmPassword: ""
 }
 });

 const onSubmit = form.handleSubmit(async (values) => {
 setErrorMessage(null);
 setSuccessMessage(null);
 setIsPending(true);

 try {
 const supabase = createSupabaseBrowserClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 setErrorMessage(
 "Sessão de recuperação invalida ou expirada. Solicite um novo link."
 );
 return;
 }

 const { error } = await supabase.auth.updateUser({
 password: values.password
 });

 if (error) {
 setErrorMessage("Não foi possível redefinir a senha. Tente novamente.");
 return;
 }

 setSuccessMessage("Senha atualizada com sucesso. Você será redirecionada para o login.");
 await supabase.auth.signOut();
 router.push(`${ROUTES.public.signIn}?reset=success` as Route);
 router.refresh();
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao redefinir senha."
 );
 } finally {
 setIsPending(false);
 }
 });

 return (
 <Card className="w-full max-w-md">
 <CardHeader>
 <CardTitle>Definir nova senha</CardTitle>
 <CardDescription>
 Escolha uma nova senha para voltar a acessar sua conta com seguranca.
 </CardDescription>
 </CardHeader>

 <CardContent>
 <form className="space-y-4" onSubmit={onSubmit}>
 <div className="space-y-2">
 <label className="text-sm font-medium" htmlFor="password">
 Nova senha
 </label>
 <Input
 autoComplete="new-password"
 id="password"
 placeholder="No mínimo 8 caracteres"
 type="password"
 {...form.register("password")}
 />
 {form.formState.errors.password ? (
 <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium" htmlFor="confirm-password">
 Confirmar senha
 </label>
 <Input
 autoComplete="new-password"
 id="confirm-password"
 placeholder="Repita sua nova senha"
 type="password"
 {...form.register("confirmPassword")}
 />
 {form.formState.errors.confirmPassword ? (
 <p className="text-sm text-destructive">
 {form.formState.errors.confirmPassword.message}
 </p>
 ) : null}
 </div>

 {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
 {successMessage ? <p className="text-sm text-green-500">{successMessage}</p> : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Atualizando..." : "Salvar nova senha"}
 </Button>

 <p className="text-center text-sm text-muted-foreground">
 <Link className="text-gold-400 transition-colors hover:text-gold-500" href={ROUTES.public.signIn}>
 Voltar para login
 </Link>
 </p>
 </form>
 </CardContent>
 </Card>
 );
}
