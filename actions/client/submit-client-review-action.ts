"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 clientReviewSubmissionSchema,
 type ClientReviewSubmissionInput
} from "@/lib/validations/client-area";

interface SubmitClientReviewActionResult {
 success: boolean;
 message: string;
}

interface CustomOrderLookupRow {
 id: number;
 protocol_code: string;
 user_id: string | null;
}

interface StoreOrderLookupRow {
 id: number;
 order_number: string;
 user_id: string;
}

interface ExistingReviewRow {
 id: string;
}

export async function submitClientReviewAction(
 input: ClientReviewSubmissionInput
): Promise<SubmitClientReviewActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para avaliações."
 };
 }

 try {
 const payload = clientReviewSubmissionSchema.parse(input);
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

 let customOrderId: number | null = null;
 let storeOrderId: number | null = null;

 if (payload.targetType === "custom_order") {
 const { data: order, error: orderError } = await supabase
 .from("custom_orders")
 .select("id,protocol_code,user_id")
 .eq("public_id", payload.customOrderPublicId)
 .maybeSingle<CustomOrderLookupRow>();

 if (orderError || !order || order.user_id !== user.id) {
 return {
 success: false,
 message: "Pedido sob medida não encontrado para avaliação."
 };
 }

 customOrderId = order.id;
 }

 if (payload.targetType === "store_order") {
 const { data: order, error: orderError } = await supabase
 .from("store_orders")
 .select("id,order_number,user_id")
 .eq("public_id", payload.storeOrderPublicId)
 .maybeSingle<StoreOrderLookupRow>();

 if (orderError || !order || order.user_id !== user.id) {
 return {
 success: false,
 message: "Pedido da loja não encontrado para avaliação."
 };
 }

 storeOrderId = order.id;
 }

 const reviewLookupQuery = supabase
 .from("client_reviews")
 .select("id")
 .eq("user_id", user.id)
 .eq("target_type", payload.targetType)
 .limit(1);

 const { data: existingReview } = payload.targetType === "custom_order"
 ? await reviewLookupQuery.eq("custom_order_id", customOrderId).maybeSingle<ExistingReviewRow>()
 : await reviewLookupQuery.eq("store_order_id", storeOrderId).maybeSingle<ExistingReviewRow>();

 if (existingReview?.id) {
 const { error: updateError } = await supabase
 .from("client_reviews")
 .update({
 rating: payload.rating,
 headline: payload.headline ?? null,
 comment: payload.comment
 })
 .eq("id", existingReview.id);

 if (updateError) {
 return {
 success: false,
 message: "Não foi possível atualizar sua avaliação agora."
 };
 }

 revalidatePath(ROUTES.private.clientTailored);
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: "Avaliação atualizada com sucesso."
 };
 }

 const { error: insertError } = await supabase.from("client_reviews").insert({
 user_id: user.id,
 target_type: payload.targetType,
 custom_order_id: customOrderId,
 store_order_id: storeOrderId,
 rating: payload.rating,
 headline: payload.headline ?? null,
 comment: payload.comment,
 is_public: true
 });

 if (insertError) {
 return {
 success: false,
 message: "Não foi possível enviar sua avaliação agora."
 };
 }

 revalidatePath(ROUTES.private.clientTailored);
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: "Avaliação enviada com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao enviar avaliação."
 };
 }
}
