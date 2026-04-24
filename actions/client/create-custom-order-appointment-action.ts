"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderAppointmentSchema,
 type CustomOrderAppointmentInput
} from "@/lib/validations/client-area";

interface CreateCustomOrderAppointmentActionResult {
 success: boolean;
 message: string;
}

interface CustomOrderLookupRow {
 id: number;
 user_id: string | null;
}

export async function createCustomOrderAppointmentAction(
 input: CustomOrderAppointmentInput
): Promise<CreateCustomOrderAppointmentActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para agendamentos."
 };
 }

 try {
 const payload = customOrderAppointmentSchema.parse(input);
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

 let orderId: number | null = null;

 if (payload.orderPublicId) {
 const { data: order, error: orderError } = await supabase
 .from("custom_orders")
 .select("id,user_id")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<CustomOrderLookupRow>();

 if (orderError || !order || order.user_id !== user.id) {
 return {
 success: false,
 message: "Pedido informado para agendamento não pertence a sua conta."
 };
 }

 orderId = order.id;
 }

 const { error: insertError } = await supabase.from("custom_order_appointments").insert({
 order_id: orderId,
 user_id: user.id,
 appointment_type: payload.appointmentType,
 attendance_mode: payload.attendanceMode,
 scheduled_for: new Date(payload.scheduledFor).toISOString(),
 notes: payload.notes ?? null,
 status: "solicitado"
 });

 if (insertError) {
 return {
 success: false,
 message: "Não foi possível solicitar o agendamento agora."
 };
 }

 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message: "Agendamento solicitado com sucesso. Nossa equipe confirmara o horário."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao solicitar agendamento."
 };
 }
}
