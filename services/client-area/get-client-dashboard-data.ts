import {
 customOrderPieceOptions,
 customOrderProductionModeOptions,
 customOrderStatusLabels
} from "@/lib/constants/custom-order";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
 ClientAccountDeletionRequestSummary,
 ClientAppointmentSummary,
 ClientCustomOrderAttachment,
 ClientCustomOrderDesignOption,
 ClientCustomOrderFinalQuote,
 ClientCustomOrderFulfillment,
 ClientCustomOrderSummary,
 ClientDashboardData,
 ClientNotificationSummary,
 ClientReviewSummary,
 ClientStoreOrderItem,
 ClientStoreOrderSummary,
 ClientStoreOrderStatus,
 CustomOrderStatus
} from "@/types";

interface CustomOrderRow {
 id: number;
 public_id: string;
 protocol_code: string;
 piece_type: string;
 production_mode: string;
 status: CustomOrderStatus;
 estimated_price: number;
 created_at: string;
}

interface CustomOrderAttachmentRow {
 id: string;
 order_id: number;
 original_file_name: string;
 mime_type: string;
 storage_path: string;
 created_at: string;
}

interface CustomOrderDesignOptionRow {
 id: string;
 order_id: number;
 option_code: string;
 title: string;
 preview_image_url: string | null;
 reference_pdf_url: string | null;
 team_note: string | null;
 created_at: string;
 is_visible_to_client: boolean;
}

interface CustomOrderFinalQuoteRow {
 order_id: number;
 final_amount: number;
 quote_summary: string;
 payment_status: ClientCustomOrderFinalQuote["paymentStatus"];
 selected_payment_method: ClientCustomOrderFinalQuote["paymentMethod"];
 approved_by_client_at: string | null;
 payment_confirmed_at: string | null;
 production_started_at: string | null;
 ready_to_ship_at: string | null;
 shipped_at: string | null;
 delivered_at: string | null;
}

interface CustomOrderFulfillmentRow {
 order_id: number;
 delivery_mode: ClientCustomOrderFulfillment["deliveryMode"];
 tracking_code: string | null;
 tracking_link: string | null;
 pickup_address: string | null;
 pickup_instructions: string | null;
}

interface StoreOrderRow {
 id: number;
 public_id: string;
 order_number: string;
 status: ClientStoreOrderStatus;
 payment_status: ClientCustomOrderFinalQuote["paymentStatus"];
 total_amount: number;
 tracking_code: string | null;
 tracking_link: string | null;
 created_at: string;
 delivered_at: string | null;
}

interface StoreOrderItemRow {
 id: string;
 order_id: number;
 sku: string;
 product_name: string;
 variant_description: string | null;
 quantity: number;
 unit_price: number;
 line_total: number;
}

interface AppointmentRow {
 id: string;
 order_id: number | null;
 appointment_type: ClientAppointmentSummary["appointmentType"];
 attendance_mode: ClientAppointmentSummary["attendanceMode"];
 scheduled_for: string;
 status: ClientAppointmentSummary["status"];
 notes: string | null;
}

interface NotificationRow {
 id: string;
 channel: ClientNotificationSummary["channel"];
 status: ClientNotificationSummary["status"];
 title: string;
 body: string;
 created_at: string;
}

interface ReviewRow {
 id: string;
 target_type: ClientReviewSummary["targetType"];
 custom_order_id: number | null;
 store_order_id: number | null;
 rating: number;
 headline: string | null;
 comment: string;
 created_at: string;
}

interface AccountDeletionRow {
 id: string;
 status: ClientAccountDeletionRequestSummary["status"];
 reason: string;
 requested_at: string;
 resolution_note: string | null;
}

const customOrderClosedStatuses = new Set<CustomOrderStatus>([
 "pedido_encerrado",
 "cancelado_pela_cliente",
 "cancelado_interno"
]);

const storeOrderClosedStatuses = new Set<ClientStoreOrderStatus>(["entregue", "cancelado"]);

const pieceTypeLabelMap = new Map<string, string>(
 customOrderPieceOptions.map((pieceTypeOption) => [pieceTypeOption.value, pieceTypeOption.label])
);

const productionModeLabelMap = new Map<string, string>(
 customOrderProductionModeOptions.map((productionModeOption) => [
 productionModeOption.value,
 productionModeOption.label
 ])
);

const storeStatusLabels: Record<ClientStoreOrderStatus, string> = {
 pedido_recebido: "Pedido recebido",
 pagamento_aprovado: "Pagamento aprovado",
 em_separacao: "Em separação",
 pronto_para_envio: "Pronto para envio",
 enviado: "Enviado",
 entregue: "Entregue",
 cancelado: "Cancelado"
};

function getCustomOrderWorkflowStatusLabel(
 orderStatusLabel: string,
 quote: ClientCustomOrderFinalQuote | null
): string {
 if (!quote) {
 return orderStatusLabel;
 }

 if (!quote.approvedByClientAt) {
 return "Orçamento final disponível";
 }

 if (quote.paymentStatus !== "approved") {
 return "Aguardando pagamento";
 }

 if (quote.deliveredAt) {
 return "Entregue";
 }

 if (quote.shippedAt) {
 return "Enviado";
 }

 if (quote.readyToShipAt) {
 return "Pronto para envio";
 }

 if (quote.productionStartedAt) {
 return "Em produção";
 }

 return "Pagamento aprovado";
}

function buildMockDashboardData(): ClientDashboardData {
 const now = new Date().toISOString();

 return {
 metrics: {
 customOrdersInProgress: 1,
 customOrdersHistory: 1,
 storeOrdersInProgress: 1,
 notificationsPending: 2
 },
 customOrdersInProgress: [
 {
 publicId: "00000000-0000-4000-8000-000000000001",
 protocolCode: "PED-000321",
 status: "aguardando_confirmacao_da_cliente",
 statusLabel: "Aguardando confirmação da cliente",
 pieceType: "vestido",
 pieceTypeLabel: "Vestido",
 productionModeLabel: "Sob medida",
 estimatedPrice: 720,
 createdAt: now,
 workflowStatusLabel: "Orçamento final disponível",
 attachments: [
 {
 id: "mock-attachment-1",
 fileName: "referencia_vestido.pdf",
 mimeType: "application/pdf",
 storagePath: "mock/orders/PED-000321/referencia_vestido.pdf",
 createdAt: now
 }
 ],
 designOptions: [
 {
 id: "mock-model-1",
 optionCode: "MOD-01",
 title: "Opção 1 - Alfaiataria com fenda",
 previewImageUrl:
 "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
 referencePdfUrl: null,
 teamNote: "Modelagem com cintura marcada e acabamento premium.",
 createdAt: now
 },
 {
 id: "mock-model-2",
 optionCode: "MOD-02",
 title: "Opção 2 - Minimalista estruturado",
 previewImageUrl:
 "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
 referencePdfUrl: null,
 teamNote: "Silhueta reta com forro acetinado.",
 createdAt: now
 },
 {
 id: "mock-model-3",
 optionCode: "MOD-03",
 title: "Opção 3 - Fluido com manga",
 previewImageUrl:
 "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
 referencePdfUrl: null,
 teamNote: "Movimento leve e proposta para evento noturno.",
 createdAt: now
 }
 ],
 finalQuote: {
 finalAmount: 890,
 quoteSummary: "Vestido sob medida com forro completo e aviamentos premium.",
 paymentStatus: "awaiting_payment",
 paymentMethod: null,
 approvedByClientAt: null,
 paymentConfirmedAt: null,
 productionStartedAt: null,
 readyToShipAt: null,
 shippedAt: null,
 deliveredAt: null
 },
 fulfillment: {
 deliveryMode: "entrega",
 trackingCode: null,
 trackingLink: null,
 pickupAddress: null,
 pickupInstructions: null
 }
 }
 ],
 customOrdersHistory: [],
 storeOrdersInProgress: [
 {
 publicId: "00000000-0000-4000-8000-000000000002",
 orderNumber: "LOJ-000178",
 status: "enviado",
 statusLabel: "Enviado",
 paymentStatus: "approved",
 totalAmount: 459,
 trackingCode: "BR123456789",
 trackingLink: "https://rastreamento.exemplo.com/BR123456789",
 createdAt: now,
 deliveredAt: null,
 items: [
 {
 id: "mock-item-1",
 sku: "BLZ-001",
 productName: "Blazer Alfaiataria Noite",
 variantDescription: "Preto fosco - Tam M",
 quantity: 1,
 unitPrice: 459,
 lineTotal: 459
 }
 ]
 }
 ],
 storeOrdersHistory: [],
 appointments: [],
 notifications: [
 {
 id: "mock-notification-1",
 channel: "in_app",
 status: "pending",
 title: "Orçamento final disponível",
 body: "Seu protocolo PED-000321 recebeu orçamento final.",
 createdAt: now
 },
 {
 id: "mock-notification-2",
 channel: "whatsapp",
 status: "pending",
 title: "Rastreio da loja atualizado",
 body: "Seu pedido LOJ-000178 foi postado e já possui rastreio.",
 createdAt: now
 }
 ],
 reviews: [],
 latestDeletionRequest: null
 };
}

export async function getClientDashboardData(userId: string): Promise<ClientDashboardData> {
 if (!isSupabaseConfigured) {
 return buildMockDashboardData();
 }

 try {
 const supabase = await createSupabaseServerClient();

 const [customOrdersResponse, storeOrdersResponse, notificationsResponse, appointmentsResponse, reviewsResponse, deletionResponse] = await Promise.all([
 supabase
 .from("custom_orders")
 .select("id,public_id,protocol_code,piece_type,production_mode,status,estimated_price,created_at")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<CustomOrderRow[]>(),
 supabase
 .from("store_orders")
 .select("id,public_id,order_number,status,payment_status,total_amount,tracking_code,tracking_link,created_at,delivered_at")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<StoreOrderRow[]>(),
 supabase
 .from("internal_notifications")
 .select("id,channel,status,title,body,created_at")
 .eq("recipient_user_id", userId)
 .order("created_at", { ascending: false })
 .limit(20)
 .returns<NotificationRow[]>(),
 supabase
 .from("custom_order_appointments")
 .select("id,order_id,appointment_type,attendance_mode,scheduled_for,status,notes")
 .eq("user_id", userId)
 .order("scheduled_for", { ascending: false })
 .returns<AppointmentRow[]>(),
 supabase
 .from("client_reviews")
 .select("id,target_type,custom_order_id,store_order_id,rating,headline,comment,created_at")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<ReviewRow[]>(),
 supabase
 .from("account_deletion_requests")
 .select("id,status,reason,requested_at,resolution_note")
 .eq("user_id", userId)
 .order("requested_at", { ascending: false })
 .limit(1)
 .maybeSingle<AccountDeletionRow>()
 ]);

 const customOrders = customOrdersResponse.data ?? [];
 const storeOrders = storeOrdersResponse.data ?? [];
 const notifications = notificationsResponse.data ?? [];
 const appointments = appointmentsResponse.data ?? [];
 const reviews = reviewsResponse.data ?? [];

 const customOrderIds = customOrders.map((order) => order.id);
 const storeOrderIds = storeOrders.map((order) => order.id);

 const [attachmentsResponse, designOptionsResponse, finalQuotesResponse, fulfillmentsResponse, storeItemsResponse] =
 await Promise.all([
 customOrderIds.length > 0
 ? supabase
 .from("custom_order_attachments")
 .select("id,order_id,original_file_name,mime_type,storage_path,created_at")
 .in("order_id", customOrderIds)
 .order("created_at", { ascending: false })
 .returns<CustomOrderAttachmentRow[]>()
 : Promise.resolve({ data: [] as CustomOrderAttachmentRow[] }),
 customOrderIds.length > 0
 ? supabase
 .from("custom_order_design_options")
 .select("id,order_id,option_code,title,preview_image_url,reference_pdf_url,team_note,created_at,is_visible_to_client")
 .in("order_id", customOrderIds)
 .eq("is_visible_to_client", true)
 .order("created_at", { ascending: false })
 .returns<CustomOrderDesignOptionRow[]>()
 : Promise.resolve({ data: [] as CustomOrderDesignOptionRow[] }),
 customOrderIds.length > 0
 ? supabase
 .from("custom_order_final_quotes")
 .select("order_id,final_amount,quote_summary,payment_status,selected_payment_method,approved_by_client_at,payment_confirmed_at,production_started_at,ready_to_ship_at,shipped_at,delivered_at")
 .in("order_id", customOrderIds)
 .returns<CustomOrderFinalQuoteRow[]>()
 : Promise.resolve({ data: [] as CustomOrderFinalQuoteRow[] }),
 customOrderIds.length > 0
 ? supabase
 .from("custom_order_fulfillments")
 .select("order_id,delivery_mode,tracking_code,tracking_link,pickup_address,pickup_instructions")
 .in("order_id", customOrderIds)
 .returns<CustomOrderFulfillmentRow[]>()
 : Promise.resolve({ data: [] as CustomOrderFulfillmentRow[] }),
 storeOrderIds.length > 0
 ? supabase
 .from("store_order_items")
 .select("id,order_id,sku,product_name,variant_description,quantity,unit_price,line_total")
 .in("order_id", storeOrderIds)
 .returns<StoreOrderItemRow[]>()
 : Promise.resolve({ data: [] as StoreOrderItemRow[] })
 ]);

 const attachmentsByOrder = new Map<number, ClientCustomOrderAttachment[]>();
 for (const attachmentRow of attachmentsResponse.data ?? []) {
 const attachment: ClientCustomOrderAttachment = {
 id: attachmentRow.id,
 fileName: attachmentRow.original_file_name,
 mimeType: attachmentRow.mime_type,
 storagePath: attachmentRow.storage_path,
 createdAt: attachmentRow.created_at
 };

 const current = attachmentsByOrder.get(attachmentRow.order_id) ?? [];
 attachmentsByOrder.set(attachmentRow.order_id, [...current, attachment]);
 }

 const designOptionsByOrder = new Map<number, ClientCustomOrderDesignOption[]>();
 for (const designOptionRow of designOptionsResponse.data ?? []) {
 const designOption: ClientCustomOrderDesignOption = {
 id: designOptionRow.id,
 optionCode: designOptionRow.option_code,
 title: designOptionRow.title,
 previewImageUrl: designOptionRow.preview_image_url,
 referencePdfUrl: designOptionRow.reference_pdf_url,
 teamNote: designOptionRow.team_note,
 createdAt: designOptionRow.created_at
 };

 const current = designOptionsByOrder.get(designOptionRow.order_id) ?? [];
 designOptionsByOrder.set(designOptionRow.order_id, [...current, designOption]);
 }

 const finalQuoteByOrder = new Map<number, ClientCustomOrderFinalQuote>();
 for (const finalQuoteRow of finalQuotesResponse.data ?? []) {
 finalQuoteByOrder.set(finalQuoteRow.order_id, {
 finalAmount: Number(finalQuoteRow.final_amount),
 quoteSummary: finalQuoteRow.quote_summary,
 paymentStatus: finalQuoteRow.payment_status,
 paymentMethod: finalQuoteRow.selected_payment_method,
 approvedByClientAt: finalQuoteRow.approved_by_client_at,
 paymentConfirmedAt: finalQuoteRow.payment_confirmed_at,
 productionStartedAt: finalQuoteRow.production_started_at,
 readyToShipAt: finalQuoteRow.ready_to_ship_at,
 shippedAt: finalQuoteRow.shipped_at,
 deliveredAt: finalQuoteRow.delivered_at
 });
 }

 const fulfillmentByOrder = new Map<number, ClientCustomOrderFulfillment>();
 for (const fulfillmentRow of fulfillmentsResponse.data ?? []) {
 fulfillmentByOrder.set(fulfillmentRow.order_id, {
 deliveryMode: fulfillmentRow.delivery_mode,
 trackingCode: fulfillmentRow.tracking_code,
 trackingLink: fulfillmentRow.tracking_link,
 pickupAddress: fulfillmentRow.pickup_address,
 pickupInstructions: fulfillmentRow.pickup_instructions
 });
 }

 const mappedCustomOrders: ClientCustomOrderSummary[] = customOrders.map((customOrder) => {
 const statusLabel = customOrderStatusLabels[customOrder.status] ?? customOrder.status;
 const finalQuote = finalQuoteByOrder.get(customOrder.id) ?? null;

 return {
 publicId: customOrder.public_id,
 protocolCode: customOrder.protocol_code,
 status: customOrder.status,
 statusLabel,
 pieceType: customOrder.piece_type,
 pieceTypeLabel: pieceTypeLabelMap.get(customOrder.piece_type) ?? customOrder.piece_type,
 productionModeLabel:
 productionModeLabelMap.get(customOrder.production_mode) ?? customOrder.production_mode,
 estimatedPrice: Number(customOrder.estimated_price ?? 0),
 createdAt: customOrder.created_at,
 workflowStatusLabel: getCustomOrderWorkflowStatusLabel(statusLabel, finalQuote),
 attachments: attachmentsByOrder.get(customOrder.id) ?? [],
 designOptions: designOptionsByOrder.get(customOrder.id) ?? [],
 finalQuote,
 fulfillment: fulfillmentByOrder.get(customOrder.id) ?? null
 };
 });

 const customOrdersInProgress = mappedCustomOrders.filter((customOrder) => {
 if (customOrderClosedStatuses.has(customOrder.status)) {
 return false;
 }

 if (customOrder.finalQuote?.deliveredAt) {
 return false;
 }

 return true;
 });

 const customOrdersHistory = mappedCustomOrders.filter((customOrder) =>
 !customOrdersInProgress.some((activeCustomOrder) => activeCustomOrder.publicId === customOrder.publicId)
 );

 const storeItemsByOrder = new Map<number, ClientStoreOrderItem[]>();
 for (const storeItemRow of storeItemsResponse.data ?? []) {
 const item: ClientStoreOrderItem = {
 id: storeItemRow.id,
 sku: storeItemRow.sku,
 productName: storeItemRow.product_name,
 variantDescription: storeItemRow.variant_description,
 quantity: storeItemRow.quantity,
 unitPrice: Number(storeItemRow.unit_price),
 lineTotal: Number(storeItemRow.line_total)
 };

 const current = storeItemsByOrder.get(storeItemRow.order_id) ?? [];
 storeItemsByOrder.set(storeItemRow.order_id, [...current, item]);
 }

 const mappedStoreOrders: ClientStoreOrderSummary[] = storeOrders.map((storeOrder) => ({
 publicId: storeOrder.public_id,
 orderNumber: storeOrder.order_number,
 status: storeOrder.status,
 statusLabel: storeStatusLabels[storeOrder.status] ?? storeOrder.status,
 paymentStatus: storeOrder.payment_status,
 totalAmount: Number(storeOrder.total_amount),
 trackingCode: storeOrder.tracking_code,
 trackingLink: storeOrder.tracking_link,
 createdAt: storeOrder.created_at,
 deliveredAt: storeOrder.delivered_at,
 items: storeItemsByOrder.get(storeOrder.id) ?? []
 }));

 const storeOrdersInProgress = mappedStoreOrders.filter(
 (storeOrder) => !storeOrderClosedStatuses.has(storeOrder.status)
 );

 const storeOrdersHistory = mappedStoreOrders.filter((storeOrder) =>
 !storeOrdersInProgress.some((activeStoreOrder) => activeStoreOrder.publicId === storeOrder.publicId)
 );

 const customOrderIdToProtocol = new Map(
 customOrders.map((customOrder) => [customOrder.id, customOrder.protocol_code])
 );
 const customOrderIdToPublicId = new Map(
 customOrders.map((customOrder) => [customOrder.id, customOrder.public_id])
 );
 const storeOrderIdToOrderNumber = new Map(
 storeOrders.map((storeOrder) => [storeOrder.id, storeOrder.order_number])
 );
 const storeOrderIdToPublicId = new Map(
 storeOrders.map((storeOrder) => [storeOrder.id, storeOrder.public_id])
 );

 const mappedReviews: ClientReviewSummary[] = reviews.map((review) => ({
 id: review.id,
 targetType: review.target_type,
 targetPublicId:
 review.target_type === "custom_order"
 ? customOrderIdToPublicId.get(review.custom_order_id ?? -1) ?? null
 : storeOrderIdToPublicId.get(review.store_order_id ?? -1) ?? null,
 orderReference:
 review.target_type === "custom_order"
 ? customOrderIdToProtocol.get(review.custom_order_id ?? -1) ?? "Pedido sob medida"
 : storeOrderIdToOrderNumber.get(review.store_order_id ?? -1) ?? "Pedido da loja",
 rating: review.rating,
 headline: review.headline,
 comment: review.comment,
 createdAt: review.created_at
 }));

 const mappedAppointments: ClientAppointmentSummary[] = appointments.map((appointment) => ({
 id: appointment.id,
 orderPublicId:
 appointment.order_id !== null
 ? (customOrderIdToPublicId.get(appointment.order_id) ?? null)
 : null,
 appointmentType: appointment.appointment_type,
 attendanceMode: appointment.attendance_mode,
 scheduledFor: appointment.scheduled_for,
 status: appointment.status,
 notes: appointment.notes
 }));

 const mappedNotifications: ClientNotificationSummary[] = notifications.map((notification) => ({
 id: notification.id,
 channel: notification.channel,
 status: notification.status,
 title: notification.title,
 body: notification.body,
 createdAt: notification.created_at
 }));

 const latestDeletionRequest: ClientAccountDeletionRequestSummary | null =
 deletionResponse.data
 ? {
 id: deletionResponse.data.id,
 status: deletionResponse.data.status,
 reason: deletionResponse.data.reason,
 requestedAt: deletionResponse.data.requested_at,
 resolutionNote: deletionResponse.data.resolution_note
 }
 : null;

 return {
 metrics: {
 customOrdersInProgress: customOrdersInProgress.length,
 customOrdersHistory: customOrdersHistory.length,
 storeOrdersInProgress: storeOrdersInProgress.length,
 notificationsPending: mappedNotifications.filter(
 (notification) => notification.status === "pending"
 ).length
 },
 customOrdersInProgress,
 customOrdersHistory,
 storeOrdersInProgress,
 storeOrdersHistory,
 appointments: mappedAppointments,
 notifications: mappedNotifications,
 reviews: mappedReviews,
 latestDeletionRequest
 };
 } catch {
 return buildMockDashboardData();
 }
}
