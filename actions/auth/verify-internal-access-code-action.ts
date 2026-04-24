"use server";

import { cookies } from "next/headers";
import { getInternalAccessCookieName } from "@/lib/auth/internal-access-session";
import { env } from "@/lib/env";
import {
 internalAccessVerificationSchema,
 type InternalAccessVerificationInput
} from "@/lib/validations/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 verifyInternalAccessChallenge
} from "@/services/auth/internal-access-service";
import { getUserRole } from "@/services/auth/get-user-role";

interface VerifyInternalAccessCodeResult {
 success: boolean;
 message: string;
}

export async function verifyInternalAccessCodeAction(
 input: InternalAccessVerificationInput
): Promise<VerifyInternalAccessCodeResult> {
 try {
 const payload = internalAccessVerificationSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Sessão expirada. Faca login novamente."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== payload.expectedRole) {
 return {
 success: false,
 message: "Setor divergente para validacao."
 };
 }

 const verification = await verifyInternalAccessChallenge({
 userId: user.id,
 role,
 code: payload.code
 });

 const cookieStore = await cookies();
 cookieStore.set(getInternalAccessCookieName(), verification.sessionToken, {
 httpOnly: true,
 sameSite: "lax",
 secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
 expires: new Date(verification.sessionExpiresAt),
 path: "/"
 });

 return {
 success: true,
 message: "Acesso interno validado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao validar codigo."
 };
 }
}
