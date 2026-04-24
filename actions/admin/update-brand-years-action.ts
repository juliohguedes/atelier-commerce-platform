"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/services/auth/get-user-role";

const updateBrandYearsSchema = z.object({
 yearsInBusiness: z.coerce
 .number()
 .int("Informe um número inteiro de anos.")
 .min(0, "O valor mínimo e 0.")
 .max(200, "O valor máximo e 200.")
});

interface UpdateBrandYearsActionResult {
 success: boolean;
 message: string;
}

export async function updateBrandYearsAction(
 input: unknown
): Promise<UpdateBrandYearsActionResult> {
 try {
 const payload = updateBrandYearsSchema.parse(input);
 const supabase = await createSupabaseServerClient();

 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Sua sessão expirou. Faca login novamente."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== "admin") {
 return {
 success: false,
 message: "Apenas administradoras podem atualizar este campo."
 };
 }

 const { error } = await supabase
 .from("brand_settings")
 .update({
 years_in_business: payload.yearsInBusiness
 })
 .eq("singleton_key", true);

 if (error) {
 return {
 success: false,
 message: "Não foi possível salvar os anos no ramo."
 };
 }

 revalidatePath(ROUTES.public.home);
 revalidatePath(ROUTES.private.admin);

 return {
 success: true,
 message: "Anos no ramo atualizados com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Não foi possível processar a solicitação."
 };
 }
}
