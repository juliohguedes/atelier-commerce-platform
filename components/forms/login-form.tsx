"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { requestInternalAccessCodeAction } from "@/actions/auth/request-internal-access-code-action";
import { startInternalSignInAction } from "@/actions/auth/start-internal-sign-in-action";
import { verifyInternalAccessCodeAction } from "@/actions/auth/verify-internal-access-code-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import type { InternalUserRole } from "@/types/auth";

interface LoginFormProps {
 badge?: string;
 title?: string;
 description?: string;
 defaultNextPath?: Route;
 hideSignUpLink?: boolean;
 hideGoogleSignIn?: boolean;
 expectedInternalRole?: InternalUserRole;
}

export function LoginForm({
 badge,
 title = "Entrar na conta",
 description = "Acesse seu espaco para pedidos, produção sob medida e acompanhamento.",
 defaultNextPath,
 hideSignUpLink = false,
 hideGoogleSignIn = false,
 expectedInternalRole
}: LoginFormProps = {}) {
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const [isPasswordSignInPending, setIsPasswordSignInPending] = useState(false);
 const [isGoogleSignInPending, setIsGoogleSignInPending] = useState(false);
 const [isCodeVerificationPending, setIsCodeVerificationPending] = useState(false);
 const [isResendPending, setIsResendPending] = useState(false);
 const [verificationCode, setVerificationCode] = useState("");
 const [awaitingInternalCode, setAwaitingInternalCode] = useState(false);
 const [maskedDestination, setMaskedDestination] = useState<string | null>(null);
 const router = useRouter();
 const searchParams = useSearchParams();

 const form = useForm<SignInInput>({
 resolver: zodResolver(signInSchema),
 defaultValues: {
 email: "",
 password: ""
 }
 });

 const redirectedFrom = searchParams.get("redirectedFrom");
 const nextPath = redirectedFrom || defaultNextPath || ROUTES.private.dashboard;
 const isPending =
 isPasswordSignInPending ||
 isGoogleSignInPending ||
 isCodeVerificationPending ||
 isResendPending;

 const onSubmit = form.handleSubmit(async (values) => {
 setErrorMessage(null);
 setSuccessMessage(null);
 setIsPasswordSignInPending(true);

 try {
 if (expectedInternalRole) {
 const result = await startInternalSignInAction({
 ...values,
 expectedRole: expectedInternalRole
 });

 if (!result.success) {
 setErrorMessage(result.message);
 return;
 }

 setAwaitingInternalCode(true);
 setMaskedDestination(result.maskedDestination ?? null);
 setSuccessMessage(
 `Codigo enviado para ${result.maskedDestination ?? "o e-mail do setor"}.`
 );
 return;
 }

 const supabase = createSupabaseBrowserClient();
 const { error } = await supabase.auth.signInWithPassword({
 email: values.email,
 password: values.password
 });

 if (error) {
 setErrorMessage("Não foi possível entrar. Verifique suas credenciais.");
 return;
 }

 router.push(nextPath as Route);
 router.refresh();
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao autenticar. Tente novamente."
 );
 } finally {
 setIsPasswordSignInPending(false);
 }
 });

 async function handleGoogleSignIn() {
 setErrorMessage(null);
 setIsGoogleSignInPending(true);

 try {
 const supabase = createSupabaseBrowserClient();
 const callbackUrl = new URL(ROUTES.auth.callback, window.location.origin);
 callbackUrl.searchParams.set("next", nextPath);

 const { error } = await supabase.auth.signInWithOAuth({
 provider: "google",
 options: {
 redirectTo: callbackUrl.toString()
 }
 });

 if (error) {
 setErrorMessage("Não foi possível iniciar o login com Google.");
 }
 } catch (error) {
 setErrorMessage(
 error instanceof Error
 ? error.message
 : "Falha inesperada ao iniciar login social."
 );
 } finally {
 setIsGoogleSignInPending(false);
 }
 }

 async function handleVerifyInternalCode() {
 if (!expectedInternalRole) {
 return;
 }

 setErrorMessage(null);
 setSuccessMessage(null);
 setIsCodeVerificationPending(true);

 try {
 const result = await verifyInternalAccessCodeAction({
 code: verificationCode,
 expectedRole: expectedInternalRole
 });

 if (!result.success) {
 setErrorMessage(result.message);
 return;
 }

 router.push(nextPath as Route);
 router.refresh();
 } catch (error) {
 setErrorMessage(
 error instanceof Error ? error.message : "Falha inesperada ao validar o codigo."
 );
 } finally {
 setIsCodeVerificationPending(false);
 }
 }

 async function handleResendInternalCode() {
 if (!expectedInternalRole) {
 return;
 }

 setErrorMessage(null);
 setSuccessMessage(null);
 setIsResendPending(true);

 try {
 const result = await requestInternalAccessCodeAction({
 expectedRole: expectedInternalRole
 });

 if (!result.success) {
 setErrorMessage(result.message);
 return;
 }

 setMaskedDestination(result.maskedDestination ?? null);
 setSuccessMessage(
 `Novo codigo enviado para ${result.maskedDestination ?? "o e-mail do setor"}.`
 );
 } catch (error) {
 setErrorMessage(
 error instanceof Error ? error.message : "Falha inesperada ao reenviar o codigo."
 );
 } finally {
 setIsResendPending(false);
 }
 }

 return (
 <Card className="w-full max-w-md">
 <CardHeader>
 {badge ? (
 <p className="text-xs uppercase tracking-[0.18em] text-gold-400">{badge}</p>
 ) : null}
 <CardTitle>{title}</CardTitle>
 <CardDescription>{description}</CardDescription>
 </CardHeader>

 <CardContent className="space-y-4">
 {!hideGoogleSignIn ? (
 <>
 <Button
 className="w-full"
 disabled={isPending}
 onClick={handleGoogleSignIn}
 type="button"
 variant="outline"
 >
 {isGoogleSignInPending ? "Conectando..." : "Entrar com Google"}
 </Button>

 <div className="relative text-center text-xs text-muted-foreground">
 <span className="relative z-10 bg-card px-2">ou continue com e-mail</span>
 <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border" />
 </div>
 </>
 ) : null}

 {!awaitingInternalCode ? (
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

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="text-sm font-medium" htmlFor="password">
 Senha
 </label>
 <Link
 className="text-xs text-gold-400 transition-colors hover:text-gold-500"
 href={ROUTES.public.forgotPassword}
 >
 Esqueci minha senha
 </Link>
 </div>
 <Input
 autoComplete="current-password"
 id="password"
 placeholder="********"
 type="password"
 {...form.register("password")}
 />
 {form.formState.errors.password ? (
 <p className="text-sm text-destructive">
 {form.formState.errors.password.message}
 </p>
 ) : null}
 </div>

 {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
 {successMessage ? <p className="text-sm text-green-500">{successMessage}</p> : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPasswordSignInPending
 ? expectedInternalRole
 ? "Verificando setor..."
 : "Entrando..."
 : expectedInternalRole
 ? "Entrar e receber codigo"
 : "Entrar"}
 </Button>
 </form>
 ) : (
 <div className="space-y-4 rounded-lg border border-border/70 p-4">
 <div className="space-y-1">
 <p className="text-sm font-medium">Codigo de confirmação</p>
 <p className="text-xs text-muted-foreground">
 Digite o codigo enviado para {maskedDestination ?? "o e-mail do setor"}.
 </p>
 </div>

 <Input
 autoComplete="one-time-code"
 inputMode="numeric"
 maxLength={6}
 placeholder="000000"
 value={verificationCode}
 onChange={(event) =>
 setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
 }
 />

 {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
 {successMessage ? <p className="text-sm text-green-500">{successMessage}</p> : null}

 <div className="flex gap-3">
 <Button
 className="flex-1"
 disabled={isPending || verificationCode.length !== 6}
 onClick={handleVerifyInternalCode}
 type="button"
 >
 {isCodeVerificationPending ? "Validando..." : "Validar codigo"}
 </Button>
 <Button
 className="flex-1"
 disabled={isPending}
 onClick={handleResendInternalCode}
 type="button"
 variant="outline"
 >
 {isResendPending ? "Reenviando..." : "Reenviar"}
 </Button>
 </div>
 </div>
 )}

 {!hideSignUpLink ? (
 <p className="text-center text-sm text-muted-foreground">
 Ainda nao tem conta?{" "}
 <Link
 className="text-gold-400 transition-colors hover:text-gold-500"
 href={ROUTES.public.signUp}
 >
 Criar cadastro
 </Link>
 </p>
 ) : (
 <p className="text-center text-xs text-muted-foreground">
 {expectedInternalRole
 ? "Acesso interno protegido por senha e codigo enviado por e-mail."
 : "Se o seu setor ainda não tiver acesso, solicite a criação ao admin interno."}
 </p>
 )}
 </CardContent>
 </Card>
 );
}
