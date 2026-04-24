"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 clientProfileUpdateSchema,
 type ClientProfileUpdateInput
} from "@/lib/validations/auth";

interface UpdateClientProfileActionResult {
 success: boolean;
 message: string;
}

export async function updateClientProfileAction(
 input: ClientProfileUpdateInput
): Promise<UpdateClientProfileActionResult> {
 try {
 const payload = clientProfileUpdateSchema.parse(input);
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

 const { data: existingAddresses, error: existingAddressesError } = await supabase
 .from("addresses")
 .select("id")
 .eq("user_id", user.id);

 if (existingAddressesError) {
 return {
 success: false,
 message: "Não foi possível carregar os endereços atuais."
 };
 }

 const allAddresses = [payload.mainAddress, ...payload.additionalAddresses];
 const normalizedRows = allAddresses.map((address, index) => ({
 id: address.id ?? randomUUID(),
 user_id: user.id,
 label: address.label ?? (index === 0 ? "Principal" : `Endereco ${index + 1}`),
 recipient_name: address.recipientName,
 zip_code: address.zipCode,
 street: address.street,
 number: address.number,
 complement: address.complement ?? null,
 neighborhood: address.neighborhood,
 city: address.city,
 state: address.state,
 is_primary: index === 0
 }));

 const { error: profileError } = await supabase.from("profiles").upsert(
 {
 id: user.id,
 full_name: payload.fullName,
 email: payload.email,
 whatsapp: payload.whatsapp,
 cpf: payload.cpf,
 preferred_locale: "pt-BR"
 },
 {
 onConflict: "id"
 }
 );

 if (profileError) {
 return {
 success: false,
 message: "Não foi possível atualizar seus dados pessoais."
 };
 }

 const { error: addressesError } = await supabase.from("addresses").upsert(normalizedRows, {
 onConflict: "id"
 });

 if (addressesError) {
 return {
 success: false,
 message: "Não foi possível atualizar seus endereços."
 };
 }

 const keepIds = new Set(normalizedRows.map((row) => row.id));
 const removedIds = (existingAddresses ?? [])
 .map((address) => address.id)
 .filter((addressId) => !keepIds.has(addressId));

 if (removedIds.length > 0) {
 const { error: deleteError } = await supabase
 .from("addresses")
 .delete()
 .eq("user_id", user.id)
 .in("id", removedIds);

 if (deleteError) {
 return {
 success: false,
 message: "Alguns endereços removidos não puderam ser atualizados."
 };
 }
 }

 let emailUpdatePendingMessage = "";

 if (user.email !== payload.email) {
 const { error: emailUpdateError } = await supabase.auth.updateUser({
 email: payload.email
 });

 if (emailUpdateError) {
 return {
 success: false,
 message: "Dados salvos, mas não foi possível iniciar a troca de e-mail."
 };
 }

 emailUpdatePendingMessage =
 " Confirmação de troca de e-mail enviada para a caixa de entrada.";
 }

 revalidatePath(ROUTES.private.client);
 revalidatePath(ROUTES.private.clientAccount);

 return {
 success: true,
 message: `Dados atualizados com sucesso.${emailUpdatePendingMessage}`
 };
 } catch {
 return {
 success: false,
 message: "Não foi possível processar sua solicitação. Revise os dados informados."
 };
 }
}
