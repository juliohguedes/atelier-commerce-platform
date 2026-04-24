"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordRecoveryWhatsAppAction } from "@/actions/auth/request-password-recovery-whatsapp-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
 passwordRecoverySchema,
 type PasswordRecoveryInput
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
 const [isPending, setIsPending] = useState(false);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);

 const form = useForm<PasswordRecoveryInput>({
 resolver: zodResolver(passwordRecoverySchema),
 defaultValues: {
 email: ""
 }
 });

 const onSubmit = form.handleSubmit(async (values) => {
 setErrorMessage(null);
 setSuccessMessage(null);
 setIsPending(true);

 try {
 const supabase = createSupabaseBrowserClient();
 const callbackUrl = new URL(ROUTES.auth.callback, window.location.origin);
 callbackUrl.searchParams.set("next", ROUTES.public.resetPassword);

 const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
 redirectTo: callbackUrl.toString()
 });

 if (error) {
 setErrorMessage("Não foi possível iniciar a recuperação. Tente novamente.");
 return;
 }

 await requestPasswordRecoveryWhatsAppAction(values);

 setSuccessMessage(
 "Se este e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha e prepararemos um apoio complementar por WhatsApp quando houver cadastro."
 );
 form.reset();
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao solicitar recuperação."
 );
 } finally {
 setIsPending(false);
 }
 });

 return (
 <Card className="w-full max-w-md">
 <CardHeader>
 <CardTitle>Recuperar senha</CardTitle>
 <CardDescription>
 Enviaremos um link por e-mail para redefinição segura da sua conta.
 </CardDescription>
 </CardHeader>

 <CardContent>
 <form className="space-y-4" onSubmit={onSubmit}>
 <div className="space-y-2">
 <label className="text-sm font-medium" htmlFor="email">
 E-mail
 </label>
 <Input
 autoComplete="email"
 id="email"
 placeholder="voce@empresa.com.br"
 type="email"
 {...form.register("email")}
 />
 {form.formState.errors.email ? (
 <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
 ) : null}
 </div>

 <p className="text-xs text-muted-foreground">
 Se existir WhatsApp vinculado ao cadastro, a plataforma também registra um envio
 complementar por adapter mockado.
 </p>

 {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
 {successMessage ? <p className="text-sm text-green-500">{successMessage}</p> : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Enviando..." : "Enviar link de recuperação"}
 </Button>

 <p className="text-center text-sm text-muted-foreground">
 Lembrou a senha?{" "}
 <Link className="text-gold-400 transition-colors hover:text-gold-500" href={ROUTES.public.signIn}>
 Voltar para login
 </Link>
 </p>
 </form>
 </CardContent>
 </Card>
 );
}
