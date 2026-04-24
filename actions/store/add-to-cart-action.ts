"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addToCartSchema, type AddToCartInput } from "@/lib/validations/store";

interface AddToCartActionResult {
 success: boolean;
 message: string;
 requiresAuth?: boolean;
}

interface VariantRow {
 id: string;
 product_id: string;
 available_quantity: number;
 sku: string;
 is_active: boolean;
}

interface ProductRow {
 id: string;
 slug: string;
 name: string;
 is_active: boolean;
}

interface ExistingCartItemRow {
 id: string;
 quantity: number;
}

export async function addToCartAction(
 input: AddToCartInput
): Promise<AddToCartActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message:
 "Loja indisponivel sem Supabase configurado. Defina as variaveis para habilitar carrinho."
 };
 }

 try {
 const payload = addToCartSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para adicionar itens ao carrinho.",
 requiresAuth: true
 };
 }

 const { data: variantRow } = await supabase
 .from("store_product_variants")
 .select("id,product_id,available_quantity,sku,is_active")
 .eq("id", payload.variantId)
 .maybeSingle<VariantRow>();

 if (!variantRow || !variantRow.is_active) {
 return {
 success: false,
 message: "A variação selecionada não esta disponível."
 };
 }

 const { data: productRow } = await supabase
 .from("store_products")
 .select("id,slug,name,is_active")
 .eq("id", variantRow.product_id)
 .maybeSingle<ProductRow>();

 if (!productRow || !productRow.is_active) {
 return {
 success: false,
 message: "Produto indisponivel no momento."
 };
 }

 const { data: existingItem } = await supabase
 .from("cart_items")
 .select("id,quantity")
 .eq("user_id", user.id)
 .eq("variant_id", payload.variantId)
 .maybeSingle<ExistingCartItemRow>();

 const nextQuantity = (existingItem?.quantity ?? 0) + payload.quantity;

 if (nextQuantity > Number(variantRow.available_quantity)) {
 return {
 success: false,
 message: `Estoque insuficiente para ${productRow.name}. Disponivel: ${variantRow.available_quantity}.`
 };
 }

 if (existingItem) {
 const { error } = await supabase
 .from("cart_items")
 .update({ quantity: nextQuantity })
 .eq("id", existingItem.id);

 if (error) {
 return {
 success: false,
 message: "Não foi possível atualizar o carrinho."
 };
 }
 } else {
 const { error } = await supabase.from("cart_items").insert({
 user_id: user.id,
 product_id: variantRow.product_id,
 variant_id: payload.variantId,
 quantity: payload.quantity
 });

 if (error) {
 return {
 success: false,
 message: "Não foi possível adicionar o item ao carrinho."
 };
 }
 }

 revalidatePath(ROUTES.public.shop);
 revalidatePath(`${ROUTES.public.shop}/${productRow.slug}`);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: `${productRow.name} adicionado ao carrinho.`
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao adicionar item no carrinho."
 };
 }
}
