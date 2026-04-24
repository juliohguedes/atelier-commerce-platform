"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 removeCartItemSchema,
 updateCartItemSchema,
 type RemoveCartItemInput,
 type UpdateCartItemInput
} from "@/lib/validations/store";

interface StoreCartMutationResult {
 success: boolean;
 message: string;
}

interface CartItemRow {
 id: string;
 variant_id: string;
}

interface VariantStockRow {
 available_quantity: number;
}

function revalidateStoreCommercePaths() {
 revalidatePath(ROUTES.public.shop);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);
}

export async function updateCartItemQuantityAction(
 input: UpdateCartItemInput
): Promise<StoreCartMutationResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Carrinho indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = updateCartItemSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para editar o carrinho."
 };
 }

 const { data: cartItem } = await supabase
 .from("cart_items")
 .select("id,variant_id")
 .eq("id", payload.cartItemId)
 .eq("user_id", user.id)
 .maybeSingle<CartItemRow>();

 if (!cartItem) {
 return {
 success: false,
 message: "Item de carrinho não encontrado."
 };
 }

 const { data: variant } = await supabase
 .from("store_product_variants")
 .select("available_quantity")
 .eq("id", cartItem.variant_id)
 .maybeSingle<VariantStockRow>();

 if (!variant) {
 return {
 success: false,
 message: "Variação do item indisponivel."
 };
 }

 if (payload.quantity > Number(variant.available_quantity)) {
 return {
 success: false,
 message: `Estoque insuficiente. Disponivel: ${variant.available_quantity}.`
 };
 }

 const { error } = await supabase
 .from("cart_items")
 .update({ quantity: payload.quantity })
 .eq("id", cartItem.id);

 if (error) {
 return {
 success: false,
 message: "Não foi possível atualizar a quantidade."
 };
 }

 revalidateStoreCommercePaths();

 return {
 success: true,
 message: "Quantidade atualizada no carrinho."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao atualizar carrinho."
 };
 }
}

export async function removeCartItemAction(
 input: RemoveCartItemInput
): Promise<StoreCartMutationResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Carrinho indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = removeCartItemSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para editar o carrinho."
 };
 }

 const { error } = await supabase
 .from("cart_items")
 .delete()
 .eq("id", payload.cartItemId)
 .eq("user_id", user.id);

 if (error) {
 return {
 success: false,
 message: "Não foi possível remover o item do carrinho."
 };
 }

 revalidateStoreCommercePaths();

 return {
 success: true,
 message: "Item removido do carrinho."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao remover item do carrinho."
 };
 }
}
