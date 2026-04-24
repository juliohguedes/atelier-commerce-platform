"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderDeliveryPreferenceSchema,
 type CustomOrderDeliveryPreferenceInput
} from "@/lib/validations/client-area";
import { queueClientNotifications } from "@/services/client-area/queue-client-notifications";

interface SetCustomOrderDeliveryModeActionResult {
 success: boolean;
 message: string;
}

interface CustomOrderLookupRow {
 id: number;
 user_id: string | null;
 protocol_code: string;
}

export async function setCustomOrderDeliveryModeAction(
 input: CustomOrderDeliveryPreferenceInput
): Promise<SetCustomOrderDeliveryModeActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para entrega/retirada."
 };
 }

 try {
 const payload = customOrderDeliveryPreferenceSchema.parse(input);
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

 const { error: upsertError } = await supabase
 .from("custom_order_fulfillments")
 .upsert(
 {
 order_id: order.id,
 delivery_mode: payload.deliveryMode
 },
 {
 onConflict: "order_id"
 }
 );

 if (upsertError) {
 return {
 success: false,
 message: "Não foi possível salvar sua preferência de entrega agora."
 };
 }

 try {
 if (payload.deliveryMode === "retirada") {
 await queueClientNotifications({
 userId: user.id,
 title: "Retirada selecionada",
 body: `Voce selecionou retirada para o protocolo ${order.protocol_code}. A equipe avisara quando estiver disponivel.`,
 payload: {
 orderPublicId: payload.orderPublicId,
 protocolCode: order.protocol_code,
 deliveryMode: payload.deliveryMode
 }
 });
 }

 if (payload.deliveryMode === "entrega") {
 await queueClientNotifications({
 userId: user.id,
 title: "Entrega selecionada",
 body: `Voce selecionou entrega para o protocolo ${order.protocol_code}. O rastreio sera enviado quando o envio for liberado.`,
 payload: {
 orderPublicId: payload.orderPublicId,
 protocolCode: order.protocol_code,
 deliveryMode: payload.deliveryMode
 }
 });
 }
 } catch {
 // ignore notification enqueue errors to avoid blocking the main flow
 }

 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message:
 payload.deliveryMode === "entrega"
 ? "Preferência salva: entrega. Você será avisada com o rastreio."
 : "Preferência salva: retirada. Você recebera aviso pela plataforma, e-mail e WhatsApp."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao salvar preferência de entrega."
 };
 }
}
