"use server";

import { internalSectorSignInSchema, type InternalSectorSignInInput } from "@/lib/validations/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInternalAccessChallenge } from "@/services/auth/internal-access-service";
import { getUserRole } from "@/services/auth/get-user-role";

interface StartInternalSignInResult {
 success: boolean;
 message: string;
 maskedDestination?: string;
}

export async function startInternalSignInAction(
 input: InternalSectorSignInInput
): Promise<StartInternalSignInResult> {
 try {
 const payload = internalSectorSignInSchema.parse(input);
 const supabase = await createSupabaseServerClient();

 const { error } = await supabase.auth.signInWithPassword({
 email: payload.email,
 password: payload.password
 });

 if (error) {
 return {
 success: false,
 message: "Não foi possível entrar. Verifique suas credenciais."
 };
 }

 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Sua autenticação não foi concluída."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== payload.expectedRole) {
 await supabase.auth.signOut();

 return {
 success: false,
 message: "Este acesso interno não corresponde ao setor informado."
 };
 }

 const challenge = await createInternalAccessChallenge({
 userId: user.id,
 role,
 email: user.email ?? payload.email
 });

 return {
 success: true,
 message: "Codigo enviado para o e-mail do setor.",
 maskedDestination: challenge.maskedDestination
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao iniciar acesso interno."
 };
 }
}
