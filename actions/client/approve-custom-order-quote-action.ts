"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderQuoteApprovalSchema,
 type CustomOrderQuoteApprovalInput
} from "@/lib/validations/client-area";
import { queueClientNotifications } from "@/services/client-area/queue-client-notifications";

interface ApproveCustomOrderQuoteActionResult {
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
 final_amount: number;
 approved_by_client_at: string | null;
 payment_status:
 | "pending"
 | "awaiting_payment"
 | "approved"
 | "failed"
 | "cancelled"
 | "refunded";
}

export async function approveCustomOrderQuoteAction(
 input: CustomOrderQuoteApprovalInput
): Promise<ApproveCustomOrderQuoteActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para aprovação de orçamento."
 };
 }

 try {
 const payload = customOrderQuoteApprovalSchema.parse(input);
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
 .select("id,final_amount,approved_by_client_at,payment_status")
 .eq("order_id", order.id)
 .maybeSingle<CustomOrderQuoteRow>();

 if (quoteError || !quote) {
 return {
 success: false,
 message: "O orçamento final ainda não esta disponível para aprovação."
 };
 }

 if (quote.approved_by_client_at) {
 return {
 success: true,
 message: "O orçamento final já estava aprovado."
 };
 }

 const now = new Date().toISOString();

 const { error: updateError } = await supabase
 .from("custom_order_final_quotes")
 .update({
 approved_by_client_at: now,
 approval_confirmation_seen_at: now,
 payment_status:
 quote.payment_status === "pending" ? "awaiting_payment" : quote.payment_status
 })
 .eq("id", quote.id);

 if (updateError) {
 return {
 success: false,
 message: "Não foi possível aprovar o orçamento final agora."
 };
 }

 try {
 await queueClientNotifications({
 userId: user.id,
 title: "Orçamento final aprovado",
 body: `Recebemos sua aprovacao no protocolo ${order.protocol_code}. Proximo passo: pagamento para iniciar producao.`,
 payload: {
 orderPublicId: payload.orderPublicId,
 protocolCode: order.protocol_code,
 finalAmount: quote.final_amount
 }
 });
 } catch {
 // ignore notification enqueue errors to avoid blocking the main flow
 }

 revalidatePath(ROUTES.private.client);
 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message: "Orçamento final aprovado. Agora você pode confirmar o pagamento."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao aprovar o orçamento final."
 };
 }
}
