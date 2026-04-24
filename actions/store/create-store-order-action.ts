"use server";

import { revalidatePath } from "next/cache";
import { createInvoiceAdapter } from "@/adapters/invoice/create-invoice-adapter";
import { createPaymentAdapter } from "@/adapters/payment/create-payment-adapter";
import { createShippingAdapter } from "@/adapters/shipping/create-shipping-adapter";
import { createWhatsAppAdapter } from "@/adapters/whatsapp/create-whatsapp-adapter";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 confirmStorePaymentSchema,
 createStoreOrderSchema,
 type ConfirmStorePaymentInput,
 type CreateStoreOrderInput
} from "@/lib/validations/store";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";
import { onlyDigits } from "@/lib/validations/br";
import type { StoreCheckoutResult } from "@/types/store";

interface StoreOrderActionResult {
 success: boolean;
 message: string;
 data?: StoreCheckoutResult;
}

interface CartRow {
 id: string;
 product_id: string;
 variant_id: string;
 quantity: number;
}

interface ProductRow {
 id: string;
 slug: string;
 name: string;
 base_price: number;
 collection_id: string | null;
 is_active: boolean;
}

interface VariantRow {
 id: string;
 product_id: string;
 sku: string;
 size_label: string;
 color_label: string;
 variation_label: string | null;
 available_quantity: number;
 stock_quantity: number;
 reserved_quantity: number;
 price_override: number | null;
 is_active: boolean;
}

interface CollectionRow {
 id: string;
 name: string;
}

interface ImageRow {
 product_id: string;
 image_url: string;
 alt_text: string | null;
 display_order: number;
}

interface AddressRow {
 id: string;
 label: string;
 recipient_name: string;
 zip_code: string;
 street: string;
 number: string;
 complement: string | null;
 neighborhood: string;
 city: string;
 state: string;
 is_primary: boolean;
}

interface CreatedOrderRow {
 id: number;
 public_id: string;
 order_number: string;
 payment_status: StoreCheckoutResult["paymentStatus"];
 total_amount: number;
}

interface CreatedInvoiceRow {
 invoice_number: string;
}

interface OrderForPaymentRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 status: string;
 payment_status: StoreCheckoutResult["paymentStatus"];
}

interface OrderItemRow {
 id: string;
 order_id: number;
 variant_id: string | null;
 quantity: number;
}

interface OrderContactProfileRow {
 full_name: string | null;
 whatsapp: string | null;
}

interface CheckoutProfileRow {
 full_name: string | null;
 email: string | null;
 cpf: string | null;
}

function normalizeAddressSnapshot(row: AddressRow) {
 return {
 id: row.id,
 label: row.label,
 recipient_name: row.recipient_name,
 zip_code: row.zip_code,
 street: row.street,
 number: row.number,
 complement: row.complement,
 neighborhood: row.neighborhood,
 city: row.city,
 state: row.state,
 is_primary: row.is_primary
 };
}

function revalidateStoreAfterCheckout() {
 revalidatePath(ROUTES.public.shop);
 revalidatePath("/painel/cliente/loja/carrinho");
 revalidatePath(ROUTES.private.clientStore);
}

export async function createStoreOrderAction(
 input: CreateStoreOrderInput
): Promise<StoreOrderActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Checkout indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = createStoreOrderSchema.parse(input);
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Entre na sua conta para finalizar a compra."
 };
 }

 const admin = createSupabaseAdminClient();
 const { data: checkoutProfile } = await admin
 .from("profiles")
 .select("full_name,email,cpf")
 .eq("id", user.id)
 .maybeSingle<CheckoutProfileRow>();

 const customerCpf = payload.customerCpf
 ? onlyDigits(payload.customerCpf)
 : checkoutProfile?.cpf ?? null;

 if (!customerCpf) {
 return {
 success: false,
 message: "Informe o CPF para continuar com o pagamento e faturamento."
 };
 }

 if (!checkoutProfile?.cpf) {
 const { error: profileUpdateError } = await admin.from("profiles").upsert(
 {
 id: user.id,
 full_name: checkoutProfile?.full_name ?? user.email?.split("@")[0] ?? "Cliente",
 email: checkoutProfile?.email ?? user.email ?? null,
 cpf: customerCpf,
 preferred_locale: "pt-BR"
 },
 {
 onConflict: "id"
 }
 );

 if (profileUpdateError) {
 return {
 success: false,
 message: "Não foi possível registrar o CPF para faturamento."
 };
 }
 }

 const { data: cartRows } = await admin
 .from("cart_items")
 .select("id,product_id,variant_id,quantity")
 .eq("user_id", user.id)
 .returns<CartRow[]>();

 if (!cartRows || cartRows.length === 0) {
 return {
 success: false,
 message: "Seu carrinho esta vazio."
 };
 }

 const productIds = Array.from(new Set(cartRows.map((item) => item.product_id)));
 const variantIds = Array.from(new Set(cartRows.map((item) => item.variant_id)));

 const [productsResponse, variantsResponse, collectionsResponse, imagesResponse] = await Promise.all([
 admin
 .from("store_products")
 .select("id,slug,name,base_price,collection_id,is_active")
 .in("id", productIds)
 .returns<ProductRow[]>(),
 admin
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,variation_label,available_quantity,stock_quantity,reserved_quantity,price_override,is_active"
 )
 .in("id", variantIds)
 .returns<VariantRow[]>(),
 admin
 .from("store_collections")
 .select("id,name")
 .returns<CollectionRow[]>(),
 admin
 .from("store_product_images")
 .select("product_id,image_url,alt_text,display_order")
 .in("product_id", productIds)
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>()
 ]);

 const productsById = new Map((productsResponse.data ?? []).map((item) => [item.id, item]));
 const variantsById = new Map((variantsResponse.data ?? []).map((item) => [item.id, item]));
 const collectionsById = new Map((collectionsResponse.data ?? []).map((item) => [item.id, item]));
 const firstImageByProductId = new Map<string, ImageRow>();
 for (const row of imagesResponse.data ?? []) {
 if (!firstImageByProductId.has(row.product_id)) {
 firstImageByProductId.set(row.product_id, row);
 }
 }

 const invalidItem = cartRows.find((cartItem) => {
 const product = productsById.get(cartItem.product_id);
 const variant = variantsById.get(cartItem.variant_id);
 if (!product || !variant) {
 return true;
 }

 if (!product.is_active || !variant.is_active) {
 return true;
 }

 if (variant.product_id !== product.id) {
 return true;
 }

 return cartItem.quantity > Number(variant.available_quantity);
 });

 if (invalidItem) {
 return {
 success: false,
 message:
 "Existe item sem estoque suficiente ou indisponivel no carrinho. Revise antes de continuar."
 };
 }

 let shippingAddressRow: AddressRow | null = null;

 if (payload.shippingMode === "saved" && payload.savedAddressId) {
 const { data: savedAddress } = await admin
 .from("addresses")
 .select(
 "id,label,recipient_name,zip_code,street,number,complement,neighborhood,city,state,is_primary"
 )
 .eq("id", payload.savedAddressId)
 .eq("user_id", user.id)
 .maybeSingle<AddressRow>();

 shippingAddressRow = savedAddress ?? null;
 }

 if (payload.shippingMode === "new" && payload.newAddress) {
 const { data: insertedAddress } = await admin
 .from("addresses")
 .insert({
 user_id: user.id,
 label: payload.newAddress.label ?? "Checkout",
 recipient_name: payload.newAddress.recipientName,
 zip_code: payload.newAddress.zipCode,
 street: payload.newAddress.street,
 number: payload.newAddress.number,
 complement: payload.newAddress.complement ?? null,
 neighborhood: payload.newAddress.neighborhood,
 city: payload.newAddress.city,
 state: payload.newAddress.state,
 is_primary: false
 })
 .select(
 "id,label,recipient_name,zip_code,street,number,complement,neighborhood,city,state,is_primary"
 )
 .single<AddressRow>();

 shippingAddressRow = insertedAddress;
 }

 if (!shippingAddressRow) {
 return {
 success: false,
 message: "Endereço de entrega não encontrado."
 };
 }

 const shippingAddressSnapshot = normalizeAddressSnapshot(shippingAddressRow);
 const billingAddressSnapshot = payload.useSameAddressForBilling
 ? shippingAddressSnapshot
 : shippingAddressSnapshot;

 const orderItemsPayload = cartRows.map((cartItem) => {
 const product = productsById.get(cartItem.product_id);
 const variant = variantsById.get(cartItem.variant_id);

 if (!product || !variant) {
 throw new Error("Item de carrinho inconsistente.");
 }

 const collection = product.collection_id
 ? collectionsById.get(product.collection_id)
 : null;
 const image = firstImageByProductId.get(product.id);
 const unitPrice = Number(variant.price_override ?? product.base_price);

 return {
 productId: product.id,
 variantId: variant.id,
 sku: variant.sku,
 productName: product.name,
 variantDescription: variant.variation_label ?? `${variant.size_label} / ${variant.color_label}`,
 quantity: cartItem.quantity,
 unitPrice,
 sizeLabel: variant.size_label,
 colorLabel: variant.color_label,
 collectionName: collection?.name ?? null,
 imageUrl: image?.image_url ?? null
 };
 });

 const shippingAdapter = createShippingAdapter();
 const paymentAdapter = createPaymentAdapter();
 const invoiceAdapter = createInvoiceAdapter();
 const shippingQuote = await shippingAdapter.quote(
 {
 street: shippingAddressRow.street,
 city: shippingAddressRow.city,
 state: shippingAddressRow.state,
 zipCode: shippingAddressRow.zip_code
 },
 orderItemsPayload.map((item) => ({
 sku: item.sku,
 name: item.productName,
 quantity: item.quantity,
 unitPrice: item.unitPrice
 }))
 );

 const subtotal = orderItemsPayload.reduce(
 (accumulator, currentItem) => accumulator + currentItem.unitPrice * currentItem.quantity,
 0
 );
 const shippingCost = shippingQuote.amountInCents / 100;
 const totalAmount = subtotal + shippingCost;

 const cartSnapshot = orderItemsPayload.map((item) => ({
 sku: item.sku,
 product_name: item.productName,
 size_label: item.sizeLabel,
 color_label: item.colorLabel,
 quantity: item.quantity,
 unit_price: item.unitPrice
 }));

 const { data: createdOrder, error: orderError } = await admin
 .from("store_orders")
 .insert({
 user_id: user.id,
 status: "pedido_recebido",
 payment_method: payload.paymentMethod,
 payment_status: "awaiting_payment",
 subtotal,
 shipping_cost: shippingCost,
 total_amount: totalAmount,
 shipping_address_id: shippingAddressRow.id,
 shipping_address_snapshot: shippingAddressSnapshot,
 billing_address_snapshot: billingAddressSnapshot,
 cart_snapshot: cartSnapshot,
 delivery_mode: "entrega",
 notes_internal: payload.notes ?? null
 })
 .select("id,public_id,order_number,payment_status,total_amount")
 .single<CreatedOrderRow>();

 if (orderError || !createdOrder) {
 return {
 success: false,
 message: "Não foi possível criar o pedido da loja."
 };
 }

 const { error: itemsError } = await admin.from("store_order_items").insert(
 orderItemsPayload.map((item) => ({
 order_id: createdOrder.id,
 product_id: item.productId,
 variant_id: item.variantId,
 sku: item.sku,
 product_name: item.productName,
 variant_description: item.variantDescription,
 quantity: item.quantity,
 unit_price: item.unitPrice,
 size_label: item.sizeLabel,
 color_label: item.colorLabel,
 collection_name: item.collectionName,
 image_url: item.imageUrl
 }))
 );

 if (itemsError) {
 await admin.from("store_orders").delete().eq("id", createdOrder.id);
 return {
 success: false,
 message: "Não foi possível registrar os itens do pedido."
 };
 }

 const paymentIntent = await paymentAdapter.createPaymentIntent({
 amountInCents: Math.round(totalAmount * 100),
 method: payload.paymentMethod,
 customerEmail: user.email ?? payload.newAddress?.recipientName ?? "cliente@local.test",
 customerName: shippingAddressRow.recipient_name,
 metadata: {
 order_number: createdOrder.order_number,
 order_public_id: createdOrder.public_id,
 customer_cpf: customerCpf
 }
 });

 await admin
 .from("store_orders")
 .update({
 payment_reference: paymentIntent.reference
 })
 .eq("id", createdOrder.id);

 const issuedInvoice = await invoiceAdapter.issueInvoice({
 orderReference: createdOrder.order_number,
 customerName: shippingAddressRow.recipient_name,
 totalAmount,
 items: orderItemsPayload.map((item) => ({
 description: `${item.productName} ${item.variantDescription}`,
 quantity: item.quantity,
 unitAmount: item.unitPrice
 })),
 metadata: {
 shipping_method: shippingQuote.method,
 shipping_carrier: shippingQuote.carrier,
 customer_cpf: customerCpf,
 payment_method: payload.paymentMethod,
 payment_reference: paymentIntent.reference
 }
 });

 const { data: createdInvoice } = await admin
 .from("store_order_invoices")
 .insert({
 order_id: createdOrder.id,
 total_amount: totalAmount,
 currency_code: "BRL",
 invoice_url: issuedInvoice.invoiceUrl,
 invoice_payload: {
 order_number: createdOrder.order_number,
 payment_method: payload.paymentMethod,
 payment_reference: paymentIntent.reference,
 payment_url: paymentIntent.paymentUrl,
 pix_copy_paste_code: paymentIntent.pixCopyPasteCode,
 customer_cpf: customerCpf,
 shipping_method: shippingQuote.method,
 shipping_carrier: shippingQuote.carrier,
 shipping_eta_days: shippingQuote.etaInDays,
 shipping_address: shippingAddressSnapshot,
 items: cartSnapshot,
 integration: issuedInvoice.payload
 }
 })
 .select("invoice_number")
 .maybeSingle<CreatedInvoiceRow>();

 await admin
 .from("internal_notifications")
 .insert([
 {
 recipient_user_id: user.id,
 channel: "in_app",
 title: "Pedido da loja criado",
 body: `Seu pedido ${createdOrder.order_number} foi registrado e aguarda pagamento.`,
 status: "pending",
 payload: {
 order_public_id: createdOrder.public_id,
 order_number: createdOrder.order_number,
 payment_reference: paymentIntent.reference,
 shipping_method: shippingQuote.method,
 shipping_carrier: shippingQuote.carrier
 }
 },
 {
 recipient_user_id: user.id,
 channel: "email",
 title: "Nota fiscal disponível na plataforma",
 body: `A nota fiscal do pedido ${createdOrder.order_number} esta disponivel na area da cliente.`,
 status: "pending",
 payload: {
 order_public_id: createdOrder.public_id,
 order_number: createdOrder.order_number,
 invoice_number: createdInvoice?.invoice_number ?? issuedInvoice.invoiceNumber,
 invoice_url: issuedInvoice.invoiceUrl
 }
 }
 ]);

 await admin.from("cart_items").delete().eq("user_id", user.id);

 revalidateStoreAfterCheckout();

 return {
 success: true,
 message: "Pedido criado com sucesso.",
 data: {
 orderPublicId: createdOrder.public_id,
 orderNumber: createdOrder.order_number,
 invoiceNumber: createdInvoice?.invoice_number ?? issuedInvoice.invoiceNumber,
 totalAmount: Number(createdOrder.total_amount),
 paymentStatus: createdOrder.payment_status
 }
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao finalizar checkout."
 };
 }
}

export async function confirmStorePaymentAction(
 input: ConfirmStorePaymentInput
): Promise<StoreOrderActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Pagamento indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = confirmStorePaymentSchema.parse(input);
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Autenticação necessária para confirmar pagamento."
 };
 }

 const role = await getUserRole(user.id);
 if (!["admin", "finance", "sales_stock"].includes(role)) {
 return {
 success: false,
 message: "Somente equipe interna pode confirmar pagamentos."
 };
 }

 const admin = createSupabaseAdminClient();

 const { data: order } = await admin
 .from("store_orders")
 .select("id,public_id,order_number,user_id,status,payment_status")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<OrderForPaymentRow>();

 if (!order) {
 return {
 success: false,
 message: "Pedido não encontrado."
 };
 }

 if (order.payment_status === "approved") {
 return {
 success: false,
 message: "Pagamento já confirmado para este pedido."
 };
 }

 const { data: orderItems } = await admin
 .from("store_order_items")
 .select("id,order_id,variant_id,quantity")
 .eq("order_id", order.id)
 .returns<OrderItemRow[]>();

 const variantIds = (orderItems ?? [])
 .map((item) => item.variant_id)
 .filter((variantId): variantId is string => Boolean(variantId));

 const { data: variants } = variantIds.length
 ? await admin
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,variation_label,available_quantity,stock_quantity,reserved_quantity,price_override,is_active"
 )
 .in("id", variantIds)
 .returns<VariantRow[]>()
 : { data: [] as VariantRow[] };

 const variantsById = new Map((variants ?? []).map((variant) => [variant.id, variant]));

 for (const item of orderItems ?? []) {
 if (!item.variant_id) {
 continue;
 }

 const variant = variantsById.get(item.variant_id);
 if (!variant || Number(variant.available_quantity) < item.quantity) {
 return {
 success: false,
 message:
 "Não foi possível reservar estoque para o pedido. Revise disponibilidade antes de confirmar."
 };
 }
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "finance",
 entityTable: "store_orders",
 entityId: order.public_id,
 backupReason: "before_store_payment_confirmation",
 snapshot: {
 order,
 order_items: orderItems ?? [],
 variants: variants ?? []
 },
 createdBy: user.id
 });

 for (const item of orderItems ?? []) {
 if (!item.variant_id) {
 continue;
 }

 const variant = variantsById.get(item.variant_id);
 if (!variant) {
 continue;
 }

 const newReservedQuantity = Number(variant.reserved_quantity) + item.quantity;

 await admin
 .from("store_product_variants")
 .update({
 reserved_quantity: newReservedQuantity
 })
 .eq("id", variant.id);

 await admin.from("store_stock_movements").insert({
 variant_id: variant.id,
 product_id: variant.product_id,
 order_id: order.id,
 order_item_id: item.id,
 movement_type: "reserved_on_payment",
 quantity: item.quantity,
 previous_stock_quantity: Number(variant.stock_quantity),
 new_stock_quantity: Number(variant.stock_quantity),
 previous_reserved_quantity: Number(variant.reserved_quantity),
 new_reserved_quantity: newReservedQuantity,
 note: "Reserva de estoque após pagamento aprovado.",
 created_by: user.id,
 metadata: {
 payment_reference: payload.paymentReference ?? null
 }
 });

 await admin
 .from("store_order_items")
 .update({
 was_reserved: true,
 reserved_at: new Date().toISOString()
 })
 .eq("id", item.id);
 }

 const nowIso = new Date().toISOString();

 await admin
 .from("store_orders")
 .update({
 status: "pagamento_aprovado",
 payment_status: "approved",
 payment_reference: payload.paymentReference ?? null,
 paid_at: nowIso,
 reserved_at: nowIso
 })
 .eq("id", order.id);

 await admin.from("internal_notifications").insert([
 {
 recipient_user_id: order.user_id,
 channel: "in_app",
 title: "Pagamento aprovado",
 body: `O pagamento do pedido ${order.order_number} foi aprovado.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number
 }
 },
 {
 recipient_user_id: order.user_id,
 channel: "email",
 title: "Pagamento aprovado",
 body: `Seu pagamento do pedido ${order.order_number} foi aprovado e a producao interna foi iniciada.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number
 }
 },
 {
 recipient_user_id: order.user_id,
 channel: "whatsapp",
 title: "Pagamento aprovado",
 body: `Pedido ${order.order_number} com pagamento confirmado. Seguiremos com os proximos passos.`,
 status: "pending",
 payload: {
 order_public_id: order.public_id,
 order_number: order.order_number
 }
 }
 ]);

 const { data: contactProfile } = await admin
 .from("profiles")
 .select("full_name,whatsapp")
 .eq("id", order.user_id)
 .maybeSingle<OrderContactProfileRow>();

 if (contactProfile?.whatsapp) {
 await createWhatsAppAdapter().sendMessage({
 to: contactProfile.whatsapp,
 message: `Pagamento do pedido ${order.order_number} aprovado. Seguiremos para a separacao interna.`,
 template: "store_payment_approved",
 metadata: {
 order_number: order.order_number,
 customer_name: contactProfile.full_name ?? null
 }
 });
 }

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "store.confirm_payment",
 entity_table: "store_orders",
 entity_id: order.public_id,
 metadata: {
 order_number: order.order_number,
 payment_reference: payload.paymentReference ?? null
 }
 });

 revalidateStoreAfterCheckout();

 return {
 success: true,
 message: "Pagamento confirmado e estoque reservado com sucesso."
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
