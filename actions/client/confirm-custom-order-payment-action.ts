"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderPaymentConfirmationSchema,
 type CustomOrderPaymentConfirmationInput
} from "@/lib/validations/client-area";
import { queueClientNotifications } from "@/services/client-area/queue-client-notifications";

interface ConfirmCustomOrderPaymentActionResult {
 success: boolean;
 message: string;
}

interface CustomOrderLookupRow {
 id: number;
 user_id: string | null;
 protocol_code: string;
}

interface CustomOrderQuoteRow {
 id: string;
 approved_by_client_at: string | null;
 payment_status:
 | "pending"
 | "awaiting_payment"
 | "approved"
 | "failed"
 | "cancelled"
 | "refunded";
 payment_reference: string | null;
}

export async function confirmCustomOrderPaymentAction(
 input: CustomOrderPaymentConfirmationInput
): Promise<ConfirmCustomOrderPaymentActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para confirmação de pagamento."
 };
 }

 try {
 const payload = customOrderPaymentConfirmationSchema.parse(input);
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

 const { data: order, error: orderError } = await supabase
 .from("custom_orders")
 .select("id,user_id,protocol_code")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<CustomOrderLookupRow>();

 if (orderError || !order || order.user_id !== user.id) {
 return {
 success: false,
 message: "Pedido sob medida não encontrado para sua conta."
 };
 }

 const { data: quote, error: quoteError } = await supabase
 .from("custom_order_final_quotes")
 .select("id,approved_by_client_at,payment_status,payment_reference")
 .eq("order_id", order.id)
 .maybeSingle<CustomOrderQuoteRow>();

 if (quoteError || !quote) {
 return {
 success: false,
 message: "Orçamento final não encontrado para este pedido."
 };
 }

 if (!quote.approved_by_client_at) {
 return {
 success: false,
 message: "Aprove o orçamento final antes de confirmar o pagamento."
 };
 }

 if (quote.payment_status === "approved") {
 return {
 success: true,
 message: "Pagamento já estava confirmado para este pedido."
 };
 }

 const now = new Date().toISOString();
 const paymentReference = quote.payment_reference ?? `PAY-${Date.now()}`;

 const { error: updateQuoteError } = await supabase
 .from("custom_order_final_quotes")
 .update({
 selected_payment_method: payload.paymentMethod,
 payment_status: "approved",
 payment_reference: paymentReference,
 payment_confirmed_at: now,
 production_started_at: now
 })
 .eq("id", quote.id);

 if (updateQuoteError) {
 return {
 success: false,
 message: "Não foi possível confirmar o pagamento agora."
 };
 }

 const { error: updateOrderError } = await supabase
 .from("custom_orders")
 .update({
 payment_confirmed_at: now,
 status: "pedido_aprovado_para_orcamento_final"
 })
 .eq("id", order.id);

 if (updateOrderError) {
 return {
 success: false,
 message: "Pagamento registrado, mas o pedido não foi atualizado completamente."
 };
 }

 try {
 await queueClientNotifications({
 userId: user.id,
 title: "Pagamento aprovado",
 body: `Pagamento aprovado para o protocolo ${order.protocol_code}.`,
 payload: {
 orderPublicId: payload.orderPublicId,
 protocolCode: order.protocol_code,
 paymentMethod: payload.paymentMethod,
 paymentReference
 }
 });

 await queueClientNotifications({
 userId: user.id,
 title: "Pedido em produção",
 body: `Seu pedido ${order.protocol_code} entrou em producao apos a aprovacao do pagamento.`,
 payload: {
 orderPublicId: payload.orderPublicId,
 protocolCode: order.protocol_code
 }
 });
 } catch {
 // ignore notification enqueue errors to avoid blocking the main flow
 }

 revalidatePath(ROUTES.private.client);
 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message: "Pagamento confirmado com sucesso. Pedido encaminhado para produção."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao confirmar pagamento."
 };
 }
}
