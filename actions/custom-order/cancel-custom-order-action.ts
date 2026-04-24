"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderCancelSchema,
 type CustomOrderCancelInput
} from "@/lib/validations/custom-order";
import { getUserRole } from "@/services/auth/get-user-role";
import {
 cancellableStatusesBeforePayment,
 getCustomOrderStatusLabel
} from "@/services/custom-order/order-status";
import { onlyDigits } from "@/lib/validations/br";

interface CancelCustomOrderActionResult {
 success: boolean;
 message: string;
 statusLabel?: string;
}

interface OrderRecordForCancellation {
 id: number;
 user_id: string | null;
 contact_email: string | null;
 contact_whatsapp: string | null;
 status:
 | "draft"
 | "pedido_recebido"
 | "em_analise_inicial"
 | "em_avaliacao_pela_equipe"
 | "aguardando_contato_via_whatsapp"
 | "aguardando_confirmacao_da_cliente"
 | "pedido_aprovado_para_orcamento_final"
 | "pedido_encerrado"
 | "cancelado_pela_cliente"
 | "cancelado_interno";
 payment_confirmed_at: string | null;
}

export async function cancelCustomOrderAction(
 input: CustomOrderCancelInput
): Promise<CancelCustomOrderActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para cancelamento."
 };
 }

 try {
 const payload = customOrderCancelSchema.parse(input);
 const admin = createSupabaseAdminClient();

 let authenticatedUserId: string | null = null;
 let isInternalUser = false;

 try {
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

 if (user) {
 authenticatedUserId = user.id;
 const role = await getUserRole(user.id);
 isInternalUser = ["admin", "finance", "sales_stock"].includes(role);
 }
 } catch {
 authenticatedUserId = null;
 isInternalUser = false;
 }

 const { data: order, error: orderError } = await admin
 .from("custom_orders")
 .select("id,user_id,contact_email,contact_whatsapp,status,payment_confirmed_at")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<OrderRecordForCancellation>();

 if (orderError || !order) {
 return {
 success: false,
 message: "Pedido não encontrado para cancelamento."
 };
 }

 const isOwner = Boolean(authenticatedUserId && order.user_id === authenticatedUserId);
 const normalizedOrderEmail = order.contact_email?.toLowerCase() ?? null;
 const normalizedPayloadEmail = payload.contactEmail?.toLowerCase() ?? null;
 const normalizedOrderWhatsapp = order.contact_whatsapp
 ? onlyDigits(order.contact_whatsapp)
 : null;
 const normalizedPayloadWhatsapp = payload.whatsapp
 ? onlyDigits(payload.whatsapp)
 : null;
 const isGuestOwner =
 !order.user_id &&
 ((normalizedOrderEmail && normalizedPayloadEmail === normalizedOrderEmail) ||
 (normalizedOrderWhatsapp && normalizedPayloadWhatsapp === normalizedOrderWhatsapp) ||
 (!normalizedOrderEmail && !normalizedOrderWhatsapp && !authenticatedUserId));

 if (!isOwner && !isGuestOwner && !isInternalUser) {
 return {
 success: false,
 message:
 "Sem permissão para cancelar este pedido. Confirme e-mail/WhatsApp de contato."
 };
 }

 if (order.payment_confirmed_at && !isInternalUser) {
 return {
 success: false,
 message:
 "Depois do pagamento, o cancelamento segue por solicitação e análise interna."
 };
 }

 if (!cancellableStatusesBeforePayment.includes(order.status) && !isInternalUser) {
 return {
 success: false,
 message: "Este pedido não pode mais ser cancelado diretamente na plataforma."
 };
 }

 const { error: updateError } = await admin
 .from("custom_orders")
 .update({
 status: "cancelado_pela_cliente",
 cancelled_at: new Date().toISOString(),
 cancelled_reason: "Cancelado pela cliente na plataforma."
 })
 .eq("id", order.id);

 if (updateError) {
 return {
 success: false,
 message: "Não foi possível cancelar o pedido no momento."
 };
 }

 revalidatePath(ROUTES.public.tailored);

 return {
 success: true,
 message: "Pedido cancelado com sucesso.",
 statusLabel: getCustomOrderStatusLabel("cancelado_pela_cliente")
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao cancelar pedido."
 };
 }
}
