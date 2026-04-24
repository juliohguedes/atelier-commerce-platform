"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInternalAccessChallenge } from "@/services/auth/internal-access-service";
import { getUserRole } from "@/services/auth/get-user-role";
import { internalUserRoles } from "@/types/auth";

const requestInternalAccessCodeSchema = z.object({
 expectedRole: z.enum(internalUserRoles)
});

interface RequestInternalAccessCodeResult {
 success: boolean;
 message: string;
 maskedDestination?: string;
}

export async function requestInternalAccessCodeAction(
 input: z.input<typeof requestInternalAccessCodeSchema>
): Promise<RequestInternalAccessCodeResult> {
 try {
 const payload = requestInternalAccessCodeSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user?.email) {
 return {
 success: false,
 message: "Sessão interna invalida para reenviar o codigo."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== payload.expectedRole) {
 return {
 success: false,
 message: "Setor divergente para este reenvio."
 };
 }

 const challenge = await createInternalAccessChallenge({
 userId: user.id,
 role,
 email: user.email
 });

 return {
 success: true,
 message: "Novo codigo enviado com sucesso.",
 maskedDestination: challenge.maskedDestination
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao reenviar o codigo."
 };
 }
}
