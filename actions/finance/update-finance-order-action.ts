"use server";

import { revalidatePath } from "next/cache";
import { financeUnlockAuditEventName } from "@/lib/constants/internal-panels";
import { ROUTES } from "@/lib/constants/routes";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 financeUpdateOrderSchema,
 type FinanceUpdateOrderInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface FinanceUpdateOrderResult {
 success: boolean;
 message: string;
}

interface CustomOrderRow {
 id: number;
 public_id: string;
 protocol_code: string;
 user_id: string | null;
}

interface CustomQuoteRow {
 id: string;
 order_id: number;
 final_amount: number;
 quote_summary: string;
 payment_status: string;
 selected_payment_method: string | null;
 payment_reference: string | null;
}

interface CustomFulfillmentRow {
 id: string;
 order_id: number;
 tracking_code: string | null;
 tracking_link: string | null;
}

interface StoreOrderRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 total_amount: number;
 shipping_cost: number;
 payment_status: string;
 payment_method: string | null;
 payment_reference: string | null;
 tracking_code: string | null;
 tracking_link: string | null;
}

interface StoreInvoiceRow {
 id: number;
 order_id: number;
 invoice_number: string;
 invoice_url: string | null;
 invoice_payload: Record<string, unknown>;
}

function asOptionalString(value: string | undefined): string | null {
 return value ?? null;
}

function hasField<T>(value: T | undefined): value is T {
 return value !== undefined;
}

function getChangedFields(
 before: Record<string, unknown>,
 after: Record<string, unknown>
): Array<{ field: string; previous: unknown; next: unknown }> {
 return Object.keys(after)
 .filter((field) => before[field] !== after[field])
 .map((field) => ({
 field,
 previous: before[field],
 next: after[field]
 }));
}

export async function updateFinanceOrderAction(
 input: FinanceUpdateOrderInput
): Promise<FinanceUpdateOrderResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = financeUpdateOrderSchema.parse(input);
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
 if (![
 "admin",
 "finance"
 ].includes(role)) {
 return {
 success: false,
 message: "Apenas admin e financeiro podem alterar dados financeiros."
 };
 }

 if (!env.INTERNAL_FINANCE_UNLOCK_PASSWORD) {
 return {
 success: false,
 message:
 "Senha de desbloqueio financeiro não configurada. Defina INTERNAL_FINANCE_UNLOCK_PASSWORD."
 };
 }

 if (payload.unlockPassword !== env.INTERNAL_FINANCE_UNLOCK_PASSWORD) {
 return {
 success: false,
 message: "Senha de desbloqueio invalida."
 };
 }

 const admin = createSupabaseAdminClient();
 const unlockedAt = new Date().toISOString();

 if (payload.orderType === "custom_order") {
 const { data: order } = await admin
 .from("custom_orders")
 .select("id,public_id,protocol_code,user_id")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<CustomOrderRow>();

 if (!order) {
 return {
 success: false,
 message: "Pedido sob medida não encontrado."
 };
 }

 const [quoteResponse, fulfillmentResponse] = await Promise.all([
 admin
 .from("custom_order_final_quotes")
 .select(
 "id,order_id,final_amount,quote_summary,payment_status,selected_payment_method,payment_reference"
 )
 .eq("order_id", order.id)
 .maybeSingle<CustomQuoteRow>(),
 admin
 .from("custom_order_fulfillments")
 .select("id,order_id,tracking_code,tracking_link")
 .eq("order_id", order.id)
 .maybeSingle<CustomFulfillmentRow>()
 ]);

 const quote = quoteResponse.data;
 const beforeQuote = {
 final_amount: quote?.final_amount ?? null,
 quote_summary: quote?.quote_summary ?? null,
 payment_status: quote?.payment_status ?? null,
 selected_payment_method: quote?.selected_payment_method ?? null,
 payment_reference: quote?.payment_reference ?? null
 };

 if (!quote && (payload.finalAmount === undefined || payload.quoteSummary === undefined)) {
 return {
 success: false,
 message:
 "Para criar o orçamento final neste pedido, informe valor final e resumo do orçamento."
 };
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "finance",
 entityTable: "custom_orders",
 entityId: order.public_id,
 backupReason: "before_finance_unlock_update",
 snapshot: {
 order,
 quote: quote ?? null,
 fulfillment: fulfillmentResponse.data ?? null
 },
 createdBy: user.id
 });

 if (quote) {
 const nextQuote = {
 final_amount: payload.finalAmount ?? quote.final_amount,
 quote_summary: payload.quoteSummary ?? quote.quote_summary,
 payment_status: payload.paymentStatus ?? quote.payment_status,
 selected_payment_method: payload.paymentMethod ?? quote.selected_payment_method,
 payment_reference: payload.paymentReference ?? quote.payment_reference,
 updated_by: user.id
 };

 await admin.from("custom_order_final_quotes").update(nextQuote).eq("id", quote.id);
 } else {
 await admin.from("custom_order_final_quotes").insert({
 order_id: order.id,
 final_amount: payload.finalAmount,
 quote_summary: payload.quoteSummary,
 payment_status: payload.paymentStatus ?? "pending",
 selected_payment_method: payload.paymentMethod,
 payment_reference: payload.paymentReference,
 updated_by: user.id
 });
 }

 if (hasField(payload.trackingCode) || hasField(payload.trackingLink)) {
 const currentTrackingCode = fulfillmentResponse.data?.tracking_code ?? null;
 const currentTrackingLink = fulfillmentResponse.data?.tracking_link ?? null;

 const nextFulfillment = {
 tracking_code: hasField(payload.trackingCode)
 ? asOptionalString(payload.trackingCode)
 : currentTrackingCode,
 tracking_link: hasField(payload.trackingLink)
 ? asOptionalString(payload.trackingLink)
 : currentTrackingLink
 };

 if (fulfillmentResponse.data) {
 await admin
 .from("custom_order_fulfillments")
 .update(nextFulfillment)
 .eq("id", fulfillmentResponse.data.id);
 } else {
 await admin.from("custom_order_fulfillments").insert({
 order_id: order.id,
 ...nextFulfillment
 });
 }
 }

 await admin.from("internal_notifications").insert({
 recipient_user_id: order.user_id,
 channel: payload.notifyChannel,
 title: "Atualização financeira",
 body: `Seu pedido ${order.protocol_code} recebeu atualizacao financeira pela equipe.`,
 status: "pending",
 payload: {
 order_type: "custom_order",
 order_public_id: order.public_id,
 protocol: order.protocol_code,
 operation_summary: payload.operationSummary ?? null
 },
 created_by: user.id
 });

 const afterQuote = {
 final_amount: payload.finalAmount ?? quote?.final_amount ?? null,
 quote_summary: payload.quoteSummary ?? quote?.quote_summary ?? null,
 payment_status: payload.paymentStatus ?? quote?.payment_status ?? null,
 selected_payment_method: payload.paymentMethod ?? quote?.selected_payment_method ?? null,
 payment_reference: payload.paymentReference ?? quote?.payment_reference ?? null,
 tracking_code: hasField(payload.trackingCode)
 ? asOptionalString(payload.trackingCode)
 : fulfillmentResponse.data?.tracking_code ?? null,
 tracking_link: hasField(payload.trackingLink)
 ? asOptionalString(payload.trackingLink)
 : fulfillmentResponse.data?.tracking_link ?? null
 };

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: financeUnlockAuditEventName,
 entity_table: "custom_orders",
 entity_id: order.public_id,
 metadata: {
 unlocked_at: unlockedAt,
 unlocked_by_user_id: user.id,
 order_type: "custom_order",
 protocol: order.protocol_code,
 changed_fields: getChangedFields(beforeQuote, afterQuote),
 operation_summary: payload.operationSummary ?? null
 }
 });
 }

 if (payload.orderType === "store_order") {
 const { data: order } = await admin
 .from("store_orders")
 .select(
 "id,public_id,order_number,user_id,total_amount,shipping_cost,payment_status,payment_method,payment_reference,tracking_code,tracking_link"
 )
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<StoreOrderRow>();

 if (!order) {
 return {
 success: false,
 message: "Pedido da loja não encontrado."
 };
 }

 const { data: invoice } = await admin
 .from("store_order_invoices")
 .select("id,order_id,invoice_number,invoice_url,invoice_payload")
 .eq("order_id", order.id)
 .maybeSingle<StoreInvoiceRow>();

 const beforeOrder = {
 shipping_cost: Number(order.shipping_cost),
 payment_status: order.payment_status,
 payment_method: order.payment_method,
 payment_reference: order.payment_reference,
 tracking_code: order.tracking_code,
 tracking_link: order.tracking_link,
 invoice_url: invoice?.invoice_url ?? null
 };

 await createSystemBackup({
 writer: admin,
 contextArea: "finance",
 entityTable: "store_orders",
 entityId: order.public_id,
 backupReason: "before_finance_unlock_update",
 snapshot: {
 order,
 invoice: invoice ?? null
 },
 createdBy: user.id
 });

 const updateOrderPayload = {
 shipping_cost: payload.shippingCost ?? Number(order.shipping_cost),
 payment_status: payload.paymentStatus ?? order.payment_status,
 payment_method: payload.paymentMethod ?? order.payment_method,
 payment_reference: payload.paymentReference ?? order.payment_reference,
 tracking_code: hasField(payload.trackingCode)
 ? asOptionalString(payload.trackingCode)
 : order.tracking_code,
 tracking_link: hasField(payload.trackingLink)
 ? asOptionalString(payload.trackingLink)
 : order.tracking_link
 };

 await admin.from("store_orders").update(updateOrderPayload).eq("id", order.id);

 if (hasField(payload.invoiceUrl) || payload.invoicePayloadNote) {
 const nextInvoicePayload = {
 ...(invoice?.invoice_payload ?? {}),
 finance_note: payload.invoicePayloadNote ?? null,
 updated_by_user_id: user.id,
 unlocked_at: unlockedAt
 };

 if (invoice) {
 await admin
 .from("store_order_invoices")
 .update({
 invoice_url: hasField(payload.invoiceUrl)
 ? asOptionalString(payload.invoiceUrl)
 : invoice.invoice_url,
 invoice_payload: nextInvoicePayload
 })
 .eq("id", invoice.id);
 } else {
 await admin.from("store_order_invoices").insert({
 order_id: order.id,
 total_amount: Number(order.total_amount),
 currency_code: "BRL",
 invoice_url: hasField(payload.invoiceUrl)
 ? asOptionalString(payload.invoiceUrl)
 : null,
 invoice_payload: nextInvoicePayload
 });
 }
 }

 await admin.from("internal_notifications").insert({
 recipient_user_id: order.user_id,
 channel: payload.notifyChannel,
 title: "Atualização financeira",
 body: `Seu pedido ${order.order_number} recebeu atualizacao financeira pela equipe.`,
 status: "pending",
 payload: {
 order_type: "store_order",
 order_public_id: order.public_id,
 protocol: order.order_number,
 operation_summary: payload.operationSummary ?? null
 },
 created_by: user.id
 });

 const afterOrder = {
 shipping_cost: updateOrderPayload.shipping_cost,
 payment_status: updateOrderPayload.payment_status,
 payment_method: updateOrderPayload.payment_method,
 payment_reference: updateOrderPayload.payment_reference,
 tracking_code: updateOrderPayload.tracking_code,
 tracking_link: updateOrderPayload.tracking_link,
 invoice_url: hasField(payload.invoiceUrl)
 ? asOptionalString(payload.invoiceUrl)
 : invoice?.invoice_url ?? null
 };

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: financeUnlockAuditEventName,
 entity_table: "store_orders",
 entity_id: order.public_id,
 metadata: {
 unlocked_at: unlockedAt,
 unlocked_by_user_id: user.id,
 order_type: "store_order",
 protocol: order.order_number,
 changed_fields: getChangedFields(beforeOrder, afterOrder),
 operation_summary: payload.operationSummary ?? null
 }
 });
 }

 revalidatePath(ROUTES.private.finance);
 revalidatePath(ROUTES.private.client);
 revalidatePath(ROUTES.private.clientStore);

 return {
 success: true,
 message: "Atualização financeira aplicada com desbloqueio e auditoria registrados."
 };
 } catch (error) {
 return {
 success: false,
 message: error instanceof Error ? error.message : "Falha inesperada ao atualizar dados financeiros."
 };
 }
}
