"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { COMPLIANCE_VERSIONS } from "@/lib/constants/compliance";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clientSignUpSchema, type ClientSignUpInput } from "@/lib/validations/auth";
import { formatPhoneBR } from "@/lib/validations/br";

function buildCallbackUrl(nextPath: string): string {
 const callbackUrl = new URL(ROUTES.auth.callback, window.location.origin);
 callbackUrl.searchParams.set("next", nextPath);
 return callbackUrl.toString();
}

export function RegisterClientForm() {
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const [isEmailSignUpPending, setIsEmailSignUpPending] = useState(false);
 const [isGoogleSignUpPending, setIsGoogleSignUpPending] = useState(false);
 const router = useRouter();

 const form = useForm<ClientSignUpInput>({
 resolver: zodResolver(clientSignUpSchema),
 defaultValues: {
 fullName: "",
 email: "",
 password: "",
 confirmPassword: "",
 contact: "",
 acceptedTerms: false,
 acceptedPrivacyPolicy: false
 }
 });

 const isPending = isEmailSignUpPending || isGoogleSignUpPending;

 const onSubmit = form.handleSubmit(async (values) => {
 setIsEmailSignUpPending(true);
 setErrorMessage(null);
 setSuccessMessage(null);

 try {
 const parsed = clientSignUpSchema.parse(values);
 const nowIso = new Date().toISOString();
 const supabase = createSupabaseBrowserClient();
 const { data, error } = await supabase.auth.signUp({
 email: parsed.email,
 password: parsed.password,
 options: {
 emailRedirectTo: buildCallbackUrl(ROUTES.private.client),
 data: {
 full_name: parsed.fullName,
 whatsapp: parsed.contact,
 preferred_locale: "pt-BR",
 accepted_terms: parsed.acceptedTerms,
 accepted_privacy_policy: parsed.acceptedPrivacyPolicy,
 terms_version: COMPLIANCE_VERSIONS.termsAndConditions,
 privacy_policy_version: COMPLIANCE_VERSIONS.privacyPolicy,
 terms_accepted_at: nowIso,
 privacy_policy_accepted_at: nowIso
 }
 }
 });

 if (error) {
 setErrorMessage("Não foi possível concluir o cadastro. Revise os dados e tente novamente.");
 return;
 }

 if (data.session) {
 router.push(ROUTES.private.client as Route);
 router.refresh();
 return;
 }

 setSuccessMessage(
 "Cadastro realizado. Enviamos um link para seu e-mail para confirmar a conta."
 );
 form.reset({
 fullName: "",
 email: "",
 password: "",
 confirmPassword: "",
 contact: "",
 acceptedTerms: false,
 acceptedPrivacyPolicy: false
 });
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao concluir cadastro. Tente novamente."
 );
 } finally {
 setIsEmailSignUpPending(false);
 }
 });

 async function handleGoogleSignUp() {
 setErrorMessage(null);
 setSuccessMessage(null);
 setIsGoogleSignUpPending(true);

 try {
 const supabase = createSupabaseBrowserClient();
 const { error } = await supabase.auth.signInWithOAuth({
 provider: "google",
 options: {
 redirectTo: buildCallbackUrl(ROUTES.private.client)
 }
 });

 if (error) {
 setErrorMessage("Não foi possível iniciar o cadastro com Google.");
 }
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao iniciar cadastro social."
 );
 } finally {
 setIsGoogleSignUpPending(false);
 }
 }

 return (
 <Card className="w-full max-w-4xl">
 <CardHeader>
 <CardTitle>Criar conta de cliente</CardTitle>
 <CardDescription>
 Cadastre-se com menos etapas agora e deixe endereço e CPF para os momentos em que eles
 realmente forem necessarios.
 </CardDescription>
 </CardHeader>

 <CardContent>
 <div className="space-y-4">
 <Button
 className="w-full"
 disabled={isPending}
 onClick={handleGoogleSignUp}
 type="button"
 variant="outline"
 >
 {isGoogleSignUpPending ? "Conectando..." : "Criar conta com Google"}
 </Button>

 <div className="relative text-center text-xs text-muted-foreground">
 <span className="relative z-10 bg-card px-2">ou finalize com e-mail e senha</span>
 <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border" />
 </div>

 <form className="space-y-6" onSubmit={onSubmit}>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Nome completo</label>
 <Input placeholder="Seu nome completo" {...form.register("fullName")} />
 {form.formState.errors.fullName ? (
 <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">E-mail</label>
 <Input placeholder="voce@empresa.com.br" type="email" {...form.register("email")} />
 {form.formState.errors.email ? (
 <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Informe seu contato</label>
 <Controller
 control={form.control}
 name="contact"
 render={({ field }) => (
 <Input
 inputMode="numeric"
 placeholder="(11) 99999-9999"
 value={field.value ?? ""}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatPhoneBR(event.target.value))}
 />
 )}
 />
 {form.formState.errors.contact ? (
 <p className="text-xs text-destructive">{form.formState.errors.contact.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Senha</label>
 <Input
 autoComplete="new-password"
 placeholder="No mínimo 8 caracteres"
 type="password"
 {...form.register("password")}
 />
 {form.formState.errors.password ? (
 <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Confirmar senha</label>
 <Input
 autoComplete="new-password"
 placeholder="Repita a senha"
 type="password"
 {...form.register("confirmPassword")}
 />
 {form.formState.errors.confirmPassword ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.confirmPassword.message}
 </p>
 ) : null}
 </div>
 </div>

 {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
 {successMessage ? <p className="text-sm text-green-500">{successMessage}</p> : null}

 <div className="space-y-3">
 <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm">
 <input className="mt-1" type="checkbox" {...form.register("acceptedTerms")} />
 <span>
 Concordo com os termos e condições da marca para cadastro e atendimento.
 </span>
 </label>
 {form.formState.errors.acceptedTerms ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.acceptedTerms.message}
 </p>
 ) : null}

 <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm">
 <input
 className="mt-1"
 type="checkbox"
 {...form.register("acceptedPrivacyPolicy")}
 />
 <span>
 Li e aceito a política de privacidade para tratamento dos meus dados.
 </span>
 </label>
 {form.formState.errors.acceptedPrivacyPolicy ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.acceptedPrivacyPolicy.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isEmailSignUpPending ? "Finalizando cadastro..." : "Criar conta"}
 </Button>
 <p className="text-center text-sm text-muted-foreground">
 Ja possui conta?{" "}
 <Link
 className="text-gold-400 transition-colors hover:text-gold-500"
 href={ROUTES.public.signIn}
 >
 Entrar agora
 </Link>
 </p>
 </div>
 </form>
 </div>
 </CardContent>
 </Card>
 );
}
