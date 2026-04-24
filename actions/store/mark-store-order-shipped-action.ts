"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createShippingAdapter } from "@/adapters/shipping/create-shipping-adapter";
import { createWhatsAppAdapter } from "@/adapters/whatsapp/create-whatsapp-adapter";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface StoreShippingActionResult {
 success: boolean;
 message: string;
}

interface OrderRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 payment_status: string;
 shipping_carrier: string | null;
 shipping_address_snapshot: {
 recipient_name?: string | null;
 street?: string | null;
 city?: string | null;
 state?: string | null;
 zip_code?: string | null;
 } | null;
}

interface OrderItemRow {
 id: string;
 variant_id: string | null;
 sku: string;
 product_name: string;
 quantity: number;
 unit_price: number;
}

interface ProfileRow {
 full_name: string | null;
 whatsapp: string | null;
}

interface VariantRow {
 id: string;
 product_id: string;
 stock_quantity: number;
 reserved_quantity: number;
}

const markOrderShippedSchema = z.object({
 orderPublicId: z.string().uuid("Pedido invalido."),
 shippingCarrier: z
 .string()
 .trim()
 .max(120)
 .optional()
 .transform((value) => (value ? value : undefined)),
 trackingCode: z
 .string()
 .trim()
 .max(80)
 .optional()
 .transform((value) => (value ? value : undefined)),
 trackingLink: z
 .string()
 .trim()
 .url("Informe um link de rastreio valido.")
 .optional()
});

function revalidateStorePaths() {
 revalidatePath(ROUTES.private.clientStore);
 revalidatePath("/painel/cliente/loja/carrinho");
}

export async function markStoreOrderShippedAction(
 input: z.input<typeof markOrderShippedSchema>
): Promise<StoreShippingActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = markOrderShippedSchema.parse(input);
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Autenticação necessária."
 };
 }

 const role = await getUserRole(user.id);
 if (!["admin", "sales_stock"].includes(role)) {
 return {
 success: false,
 message: "Somente equipe de vendas/estoque pode marcar envio."
 };
 }

 const admin = createSupabaseAdminClient();
 const { data: order } = await admin
 .from("store_orders")
 .select(
 "id,public_id,order_number,user_id,payment_status,shipping_carrier,shipping_address_snapshot"
 )
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<OrderRow>();

 if (!order) {
 return {
 success: false,
 message: "Pedido não encontrado."
 };
 }

 if (order.payment_status !== "approved") {
 return {
 success: false,
 message: "Pedido ainda sem pagamento aprovado para envio."
 };
 }

 const { data: orderItems } = await admin
 .from("store_order_items")
 .select("id,variant_id,sku,product_name,quantity,unit_price")
 .eq("order_id", order.id)
 .returns<OrderItemRow[]>();

 const variantIds = (orderItems ?? [])
 .map((item) => item.variant_id)
 .filter((variantId): variantId is string => Boolean(variantId));

 const { data: variants } = variantIds.length
 ? await admin
 .from("store_product_variants")
 .select("id,product_id,stock_quantity,reserved_quantity")
 .in("id", variantIds)
 .returns<VariantRow[]>()
 : { data: [] as VariantRow[] };

 const variantsById = new Map((variants ?? []).map((variant) => [variant.id, variant]));

 for (const item of orderItems ?? []) {
 if (!item.variant_id) {
 continue;
 }

 const variant = variantsById.get(item.variant_id);
 if (!variant) {
 return {
 success: false,
 message: "Variação de item não encontrada para baixa de estoque."
 };
 }

 if (item.quantity > Number(variant.reserved_quantity)) {
 return {
 success: false,
 message: "Quantidade reservada insuficiente para envio."
 };
 }
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "sales_stock",
 entityTable: "store_orders",
 entityId: order.public_id,
 backupReason: "before_store_order_shipping_update",
 snapshot: {
 order,
 order_items: orderItems ?? [],
 variants: variants ?? []
 },
 createdBy: user.id
 });

 const shippingAdapter = createShippingAdapter();
 const shipment =
 !payload.trackingCode || !payload.trackingLink || !payload.shippingCarrier
 ? await shippingAdapter.createShipment({
 orderReference: order.order_number,
 recipientName:
 order.shipping_address_snapshot?.recipient_name ?? "Cliente da loja",
 destination: {
 street: order.shipping_address_snapshot?.street ?? "Não informado",
 city: order.shipping_address_snapshot?.city ?? "Não informado",
 state: order.shipping_address_snapshot?.state ?? "SP",
 zipCode: order.shipping_address_snapshot?.zip_code ?? "00000000"
 },
 items: (orderItems ?? []).map((item) => ({
 sku: item.sku,
 name: item.product_name,
 quantity: item.quantity,
 unitPrice: Number(item.unit_price)
 })),
 preferredCarrier: payload.shippingCarrier ?? order.shipping_carrier
 })
 : null;

 const resolvedShippingCarrier =
 payload.shippingCarrier ?? shipment?.carrier ?? order.shipping_carrier ?? null;
 const resolvedTrackingCode = payload.trackingCode ?? shipment?.trackingCode ?? null;
 const resolvedTrackingLink = payload.trackingLink ?? shipment?.trackingUrl ?? null;

 const nowIso = new Date().toISOString();

 for (const item of orderItems ?? []) {
 if (!item.variant_id) {
 continue;
 }

 const variant = variantsById.get(item.variant_id);
 if (!variant) {
 continue;
 }

 const newStockQuantity = Number(variant.stock_quantity) - item.quantity;
 const newReservedQuantity = Number(variant.reserved_quantity) - item.quantity;

 await admin
 .from("store_product_variants")
 .update({
 stock_quantity: newStockQuantity,
 reserved_quantity: newReservedQuantity
 })
 .eq("id", variant.id);

 await admin.from("store_stock_movements").insert({
 variant_id: variant.id,
 product_id: variant.product_id,
 order_id: order.id,
 order_item_id: item.id,
 movement_type: "deducted_on_shipping",
 quantity: item.quantity,
 previous_stock_quantity: Number(variant.stock_quantity),
 new_stock_quantity: newStockQuantity,
 previous_reserved_quantity: Number(variant.reserved_quantity),
 new_reserved_quantity: newReservedQuantity,
 note: "Baixa de estoque no envio do pedido.",
 created_by: user.id
 });

 await admin
 .from("store_order_items")
 .update({
 deducted_at: nowIso
 })
 .eq("id", item.id);
 }

 await admin
 .from("store_orders")
 .update({
 status: "enviado",
 shipped_at: nowIso,
 stock_deducted_at: nowIso,
 shipping_carrier: resolvedShippingCarrier,
 tracking_code: resolvedTrackingCode,
 tracking_link: resolvedTrackingLink
 })
 .eq("id", order.id);

 await admin.from("internal_notifications").insert([
 {
 recipient_user_id: order.user_id,
 channel: "in_app",
 title: "Pedido enviado",
 body: `Seu pedido ${order.order_number} foi enviado.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number,
 shipping_carrier: resolvedShippingCarrier,
 tracking_code: resolvedTrackingCode,
 tracking_link: resolvedTrackingLink
 }
 },
 {
 recipient_user_id: order.user_id,
 channel: "email",
 title: "Pedido enviado",
 body: `Seu pedido ${order.order_number} foi enviado e o rastreio esta disponivel.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number,
 shipping_carrier: resolvedShippingCarrier,
 tracking_code: resolvedTrackingCode,
 tracking_link: resolvedTrackingLink
 }
 },
 {
 recipient_user_id: order.user_id,
 channel: "whatsapp",
 title: "Pedido enviado",
 body: `Pedido ${order.order_number} enviado. Consulte o rastreio na plataforma.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number,
 shipping_carrier: resolvedShippingCarrier,
 tracking_code: resolvedTrackingCode,
 tracking_link: resolvedTrackingLink
 }
 }
 ]);

 const { data: profile } = await admin
 .from("profiles")
 .select("full_name,whatsapp")
 .eq("id", order.user_id)
 .maybeSingle<ProfileRow>();

 if (profile?.whatsapp) {
 await createWhatsAppAdapter().sendMessage({
 to: profile.whatsapp,
 message: `Pedido ${order.order_number} enviado. Rastreio: ${resolvedTrackingCode ?? "aguarde atualização na plataforma"}.`,
 template: "store_order_shipped",
 metadata: {
 order_number: order.order_number,
 customer_name: profile.full_name ?? null
 }
 });
 }

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "sales_stock.mark_store_order_shipped",
 entity_table: "store_orders",
 entity_id: order.public_id,
 metadata: {
 order_number: order.order_number,
 shipping_carrier: resolvedShippingCarrier,
 tracking_code: resolvedTrackingCode
 }
 });

 revalidateStorePaths();

 return {
 success: true,
 message: "Pedido marcado como enviado e estoque baixado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao marcar envio."
 };
 }
}
