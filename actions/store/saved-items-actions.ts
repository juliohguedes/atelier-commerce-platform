"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 moveCartItemSchema,
 moveSavedItemSchema,
 removeSavedItemSchema,
 type MoveCartItemInput,
 type MoveSavedItemInput,
 type RemoveSavedItemInput
} from "@/lib/validations/store";

interface SavedItemsActionResult {
 success: boolean;
 message: string;
}

interface CartItemRow {
 id: string;
 user_id: string;
 product_id: string;
 variant_id: string;
 quantity: number;
}

interface SavedItemRow {
 id: string;
 user_id: string;
 product_id: string;
 variant_id: string;
 quantity: number;
}

function revalidateStorePaths() {
 revalidatePath(ROUTES.public.shop);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);
}

export async function moveCartItemToSavedAction(
 input: MoveCartItemInput
): Promise<SavedItemsActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Funcionalidade indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = moveCartItemSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para salvar itens."
 };
 }

 const { data: cartItem } = await supabase
 .from("cart_items")
 .select("id,user_id,product_id,variant_id,quantity")
 .eq("id", payload.cartItemId)
 .eq("user_id", user.id)
 .maybeSingle<CartItemRow>();

 if (!cartItem) {
 return {
 success: false,
 message: "Item de carrinho não encontrado."
 };
 }

 const { data: existingSavedItem } = await supabase
 .from("saved_for_later_items")
 .select("id,quantity")
 .eq("user_id", user.id)
 .eq("variant_id", cartItem.variant_id)
 .maybeSingle<{ id: string; quantity: number }>();

 if (existingSavedItem) {
 const { error: updateSavedError } = await supabase
 .from("saved_for_later_items")
 .update({ quantity: existingSavedItem.quantity + cartItem.quantity })
 .eq("id", existingSavedItem.id);

 if (updateSavedError) {
 return {
 success: false,
 message: "Não foi possível atualizar o item salvo."
 };
 }
 } else {
 const { error: insertSavedError } = await supabase
 .from("saved_for_later_items")
 .insert({
 user_id: user.id,
 product_id: cartItem.product_id,
 variant_id: cartItem.variant_id,
 quantity: cartItem.quantity
 });

 if (insertSavedError) {
 return {
 success: false,
 message: "Não foi possível salvar o item para depois."
 };
 }
 }

 const { error: deleteCartError } = await supabase
 .from("cart_items")
 .delete()
 .eq("id", cartItem.id);

 if (deleteCartError) {
 return {
 success: false,
 message: "Não foi possível finalizar a movimentação do item."
 };
 }

 revalidateStorePaths();

 return {
 success: true,
 message: "Item movido para Salvar para depois."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao mover item."
 };
 }
}

export async function moveSavedItemToCartAction(
 input: MoveSavedItemInput
): Promise<SavedItemsActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Funcionalidade indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = moveSavedItemSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para mover itens."
 };
 }

 const { data: savedItem } = await supabase
 .from("saved_for_later_items")
 .select("id,user_id,product_id,variant_id,quantity")
 .eq("id", payload.savedItemId)
 .eq("user_id", user.id)
 .maybeSingle<SavedItemRow>();

 if (!savedItem) {
 return {
 success: false,
 message: "Item salvo não encontrado."
 };
 }

 const { data: existingCartItem } = await supabase
 .from("cart_items")
 .select("id,quantity")
 .eq("user_id", user.id)
 .eq("variant_id", savedItem.variant_id)
 .maybeSingle<{ id: string; quantity: number }>();

 if (existingCartItem) {
 const { error: updateCartError } = await supabase
 .from("cart_items")
 .update({ quantity: existingCartItem.quantity + savedItem.quantity })
 .eq("id", existingCartItem.id);

 if (updateCartError) {
 return {
 success: false,
 message: "Não foi possível atualizar o item no carrinho."
 };
 }
 } else {
 const { error: insertCartError } = await supabase
 .from("cart_items")
 .insert({
 user_id: user.id,
 product_id: savedItem.product_id,
 variant_id: savedItem.variant_id,
 quantity: savedItem.quantity
 });

 if (insertCartError) {
 return {
 success: false,
 message: "Não foi possível mover item para o carrinho."
 };
 }
 }

 const { error: deleteSavedError } = await supabase
 .from("saved_for_later_items")
 .delete()
 .eq("id", savedItem.id);

 if (deleteSavedError) {
 return {
 success: false,
 message: "Não foi possível remover o item salvo."
 };
 }

 revalidateStorePaths();

 return {
 success: true,
 message: "Item movido para o carrinho."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao mover item salvo."
 };
 }
}

export async function removeSavedItemAction(
 input: RemoveSavedItemInput
): Promise<SavedItemsActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Funcionalidade indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = removeSavedItemSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para remover itens salvos."
 };
 }

 const { error } = await supabase
 .from("saved_for_later_items")
 .delete()
 .eq("id", payload.savedItemId)
 .eq("user_id", user.id);

 if (error) {
 return {
 success: false,
 message: "Não foi possível remover o item salvo."
 };
 }

 revalidateStorePaths();

 return {
 success: true,
 message: "Item removido de Salvar para depois."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao remover item salvo."
 };
 }
}
