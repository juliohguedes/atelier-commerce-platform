"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toggleWishlistSchema, type ToggleWishlistInput } from "@/lib/validations/store";

interface ToggleWishlistActionResult {
 success: boolean;
 message: string;
 isFavorited?: boolean;
 requiresAuth?: boolean;
}

interface ExistingWishlistRow {
 id: string;
}

export async function toggleWishlistItemAction(
 input: ToggleWishlistInput
): Promise<ToggleWishlistActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Favoritos indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = toggleWishlistSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para usar favoritos.",
 requiresAuth: true
 };
 }

 let existingQuery = supabase
 .from("wishlist_items")
 .select("id")
 .eq("user_id", user.id)
 .eq("product_id", payload.productId);

 if (payload.variantId) {
 existingQuery = existingQuery.eq("variant_id", payload.variantId);
 } else {
 existingQuery = existingQuery.is("variant_id", null);
 }

 const { data: existingItem } = await existingQuery.maybeSingle<ExistingWishlistRow>();

 if (existingItem) {
 const { error } = await supabase
 .from("wishlist_items")
 .delete()
 .eq("id", existingItem.id);

 if (error) {
 return {
 success: false,
 message: "Não foi possível remover dos favoritos."
 };
 }

 revalidatePath(ROUTES.public.shop);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: "Item removido dos favoritos.",
 isFavorited: false
 };
 }

 const { error } = await supabase.from("wishlist_items").insert({
 user_id: user.id,
 product_id: payload.productId,
 variant_id: payload.variantId ?? null,
 notify_on_restock: payload.notifyOnRestock
 });

 if (error) {
 return {
 success: false,
 message: "Não foi possível adicionar aos favoritos."
 };
 }

 revalidatePath(ROUTES.public.shop);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: "Item adicionado aos favoritos.",
 isFavorited: true
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao atualizar favoritos."
 };
 }
}
