"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminUpdateOrderStatusSchema,
 type AdminUpdateOrderStatusInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateAdminOrderStatusResult {
 success: boolean;
 message: string;
}

interface CustomOrderRow {
 id: number;
 public_id: string;
 protocol_code: string;
 status: string;
 user_id: string | null;
}

export async function updateAdminOrderStatusAction(
 input: AdminUpdateOrderStatusInput
): Promise<UpdateAdminOrderStatusResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = adminUpdateOrderStatusSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Autenticação obrigatória."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== "admin") {
 return {
 success: false,
 message: "Apenas admin pode atualizar status do pedido."
 };
 }

 const admin = createSupabaseAdminClient();

 const { data: order } = await admin
 .from("custom_orders")
 .select("id,public_id,protocol_code,status,user_id")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<CustomOrderRow>();

 if (!order) {
 return {
 success: false,
 message: "Pedido não encontrado."
 };
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "admin",
 entityTable: "custom_orders",
 entityId: order.public_id,
 backupReason: "before_custom_order_status_update",
 snapshot: {
 order
 },
 createdBy: user.id
 });

 const { error: updateError } = await admin
 .from("custom_orders")
 .update({ status: payload.status })
 .eq("id", order.id);

 if (updateError) {
 return {
 success: false,
 message: "Não foi possível atualizar o status do pedido."
 };
 }

 if (payload.note) {
 await admin.from("custom_order_status_history").insert({
 order_id: order.id,
 status: payload.status,
 note: payload.note,
 changed_by_user_id: user.id,
 is_system: false
 });
 }

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.update_custom_order_status",
 entity_table: "custom_orders",
 entity_id: order.public_id,
 metadata: {
 previous_status: order.status,
 next_status: payload.status,
 note: payload.note ?? null,
 protocol_code: order.protocol_code
 }
 });

 if (order.user_id) {
 await admin.from("internal_notifications").insert({
 recipient_user_id: order.user_id,
 channel: "in_app",
 title: "Atualização de status",
 body: `Seu pedido ${order.protocol_code} teve o status atualizado para ${payload.status}.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 protocol_code: order.protocol_code,
 next_status: payload.status
 },
 created_by: user.id
 });
 }

 revalidatePath(ROUTES.private.admin);
 revalidatePath(ROUTES.private.clientTailored);

 return {
 success: true,
 message: "Status do pedido atualizado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao atualizar status do pedido."
 };
 }
}
