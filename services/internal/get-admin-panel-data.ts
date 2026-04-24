import { customOrderPieceOptions } from "@/lib/constants/custom-order";
import { customOrderStatusLabels } from "@/lib/constants/internal-panels";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminPanelFilters } from "@/lib/validations/internal-panels";
import type {
 AdminOrderDetail,
 AdminOrderListItem,
 AdminOrderStatusHistoryItem,
 AdminPanelData
} from "@/types/internal-panels";

interface CustomOrderRow {
 id: number;
 public_id: string;
 protocol_code: string;
 user_id: string | null;
 status: AdminOrderListItem["status"];
 piece_type: AdminOrderListItem["pieceType"];
 contact_full_name: string | null;
 contact_email: string | null;
 contact_whatsapp: string | null;
 created_at: string;
 estimated_price: number;
 production_mode: AdminOrderDetail["productionMode"];
 request_type: AdminOrderDetail["requestType"];
 modeling: AdminOrderDetail["modeling"];
 piece_length: string | null;
 measurements: AdminOrderDetail["measurements"] | null;
 reference_notes: string | null;
 visual_notes: string | null;
 final_notes: string | null;
 estimate_breakdown: AdminOrderDetail["estimateBreakdown"] | null;
}

interface FinalQuoteRow {
 order_id: number;
 final_amount: number;
 quote_summary: string;
 payment_status: "pending" | "awaiting_payment" | "approved" | "failed" | "cancelled" | "refunded";
 payment_confirmed_at: string | null;
 production_started_at: string | null;
 ready_to_ship_at: string | null;
 shipped_at: string | null;
 delivered_at: string | null;
}

interface FulfillmentRow {
 order_id: number;
 delivery_mode: AdminOrderDetail["deliveryMode"];
 tracking_code: string | null;
 tracking_link: string | null;
}

interface StatusHistoryRow {
 id: number;
 order_id: number;
 status: AdminOrderListItem["status"];
 note: string | null;
 changed_by_user_id: string | null;
 changed_at: string;
}

interface ProfileLookupRow {
 id: string;
 full_name: string | null;
}

const pieceTypeLabelMap = new Map<string, string>(
 customOrderPieceOptions.map((item) => [item.value, item.label])
);

const adminAnalysisStatuses: AdminOrderListItem["status"][] = [
 "em_analise_inicial",
 "em_avaliacao_pela_equipe",
 "aguardando_contato_via_whatsapp",
 "aguardando_confirmacao_da_cliente",
 "pedido_aprovado_para_orcamento_final"
];

function getPieceTypeLabel(pieceType: string): string {
 return pieceTypeLabelMap.get(pieceType) ?? pieceType;
}

function normalizeClientName(order: CustomOrderRow, profileName: string | null | undefined): string {
 return order.contact_full_name ?? profileName ?? "Cliente sem nome";
}

function isInMonth(dateIso: string, now: Date): boolean {
 const date = new Date(dateIso);
 return (
 date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
 );
}

function matchesAdminStatusFilter(
 statusFilter: AdminPanelFilters["status"],
 order: CustomOrderRow,
 quote: FinalQuoteRow | undefined
): boolean {
 if (statusFilter === "todos") {
 return true;
 }

 if (statusFilter === "novos") {
 return order.status === "pedido_recebido";
 }

 if (statusFilter === "em_analise") {
 return adminAnalysisStatuses.includes(order.status);
 }

 if (statusFilter === "aguardando_pagamento") {
 return quote?.payment_status === "awaiting_payment" || quote?.payment_status === "pending";
 }

 if (statusFilter === "em_producao") {
 return Boolean(
 quote?.payment_status === "approved" &&
 !quote.ready_to_ship_at &&
 !quote.shipped_at &&
 !quote.delivered_at
 );
 }

 if (statusFilter === "pronto_para_envio") {
 return Boolean(quote?.ready_to_ship_at && !quote.shipped_at);
 }

 if (statusFilter === "enviados") {
 return Boolean(quote?.shipped_at && !quote.delivered_at);
 }

 if (statusFilter === "entregues") {
 return Boolean(quote?.delivered_at || order.status === "pedido_encerrado");
 }

 return true;
}

function filterByText(filters: AdminPanelFilters, row: AdminOrderListItem): boolean {
 const normalizedProtocol = filters.protocol?.toLowerCase();
 const normalizedName = filters.name?.toLowerCase();
 const normalizedQuery = filters.query?.toLowerCase();

 if (normalizedProtocol && !row.protocolCode.toLowerCase().includes(normalizedProtocol)) {
 return false;
 }

 if (normalizedName && !row.clientName.toLowerCase().includes(normalizedName)) {
 return false;
 }

 if (filters.dateFrom && row.createdAt.slice(0, 10) < filters.dateFrom) {
 return false;
 }

 if (filters.dateTo && row.createdAt.slice(0, 10) > filters.dateTo) {
 return false;
 }

 if (!normalizedQuery) {
 return true;
 }

 const haystack = [
 row.clientName,
 row.protocolCode,
 row.clientEmail ?? "",
 row.clientWhatsapp ?? ""
 ]
 .join(" ")
 .toLowerCase();

 return haystack.includes(normalizedQuery);
}

function buildMockData(): AdminPanelData {
 const createdAt = new Date().toISOString();

 return {
 metrics: {
 novos: 1,
 emAnalise: 1,
 aguardandoPagamento: 1,
 emProducao: 0,
 prontoParaEnvio: 0,
 enviados: 0,
 entregues: 0,
 vendasMes: 0
 },
 orders: [
 {
 id: 1,
 publicId: "00000000-0000-4000-8000-000000000011",
 protocolCode: "PED-000011",
 status: "em_analise_inicial",
 statusLabel: "Em análise inicial",
 pieceType: "vestido",
 pieceTypeLabel: "Vestido",
 clientName: "Cliente demonstração",
 clientEmail: "cliente@demo.com",
 clientWhatsapp: "11999999999",
 createdAt,
 estimatedPrice: 680,
 finalAmount: null,
 paymentStatus: "pending"
 }
 ],
 selectedOrder: null
 };
}

export async function getAdminPanelData(filters: AdminPanelFilters): Promise<AdminPanelData> {
 if (!isSupabaseConfigured) {
 return buildMockData();
 }

 try {
 const supabase = await createSupabaseServerClient();

 const [customOrdersResponse, quotesResponse, fulfillmentsResponse] = await Promise.all([
 supabase
 .from("custom_orders")
 .select(
 "id,public_id,protocol_code,user_id,status,piece_type,contact_full_name,contact_email,contact_whatsapp,created_at,estimated_price,production_mode,request_type,modeling,piece_length,measurements,reference_notes,visual_notes,final_notes,estimate_breakdown"
 )
 .order("created_at", { ascending: false })
 .returns<CustomOrderRow[]>(),
 supabase
 .from("custom_order_final_quotes")
 .select(
 "order_id,final_amount,quote_summary,payment_status,payment_confirmed_at,production_started_at,ready_to_ship_at,shipped_at,delivered_at"
 )
 .returns<FinalQuoteRow[]>(),
 supabase
 .from("custom_order_fulfillments")
 .select("order_id,delivery_mode,tracking_code,tracking_link")
 .returns<FulfillmentRow[]>(),
 ]);

 const customOrders = customOrdersResponse.data ?? [];
 const quotes = quotesResponse.data ?? [];
 const fulfillments = fulfillmentsResponse.data ?? [];

 const quoteByOrderId = new Map(quotes.map((row) => [row.order_id, row]));
 const fulfillmentByOrderId = new Map(fulfillments.map((row) => [row.order_id, row]));

 const userIds = Array.from(
 new Set(customOrders.map((row) => row.user_id).filter((userId): userId is string => Boolean(userId)))
 );

 const profilesResponse = userIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name")
 .in("id", userIds)
 .returns<ProfileLookupRow[]>()
 : { data: [] as ProfileLookupRow[] };

 const profileNameByUserId = new Map(
 (profilesResponse.data ?? []).map((row) => [row.id, row.full_name])
 );

 const mappedOrders: AdminOrderListItem[] = customOrders.map((order) => {
 const quote = quoteByOrderId.get(order.id);
 const profileName = order.user_id ? profileNameByUserId.get(order.user_id) : null;

 return {
 id: order.id,
 publicId: order.public_id,
 protocolCode: order.protocol_code,
 status: order.status,
 statusLabel: customOrderStatusLabels[order.status] ?? order.status,
 pieceType: order.piece_type,
 pieceTypeLabel: getPieceTypeLabel(order.piece_type),
 clientName: normalizeClientName(order, profileName),
 clientEmail: order.contact_email,
 clientWhatsapp: order.contact_whatsapp,
 createdAt: order.created_at,
 estimatedPrice: Number(order.estimated_price),
 finalAmount: quote ? Number(quote.final_amount) : null,
 paymentStatus: quote?.payment_status ?? null
 };
 });

 const filteredOrders = mappedOrders
 .filter((order) => {
 const source = customOrders.find((item) => item.public_id === order.publicId);
 if (!source) {
 return false;
 }

 const quote = quoteByOrderId.get(source.id);
 return matchesAdminStatusFilter(filters.status, source, quote);
 })
 .filter((order) => filterByText(filters, order));

 const now = new Date();
 const metrics = {
 novos: customOrders.filter((item) => item.status === "pedido_recebido").length,
 emAnalise: customOrders.filter((item) => adminAnalysisStatuses.includes(item.status)).length,
 aguardandoPagamento: quotes.filter(
 (item) => item.payment_status === "pending" || item.payment_status === "awaiting_payment"
 ).length,
 emProducao: quotes.filter(
 (item) => item.payment_status === "approved" && !item.ready_to_ship_at && !item.shipped_at
 ).length,
 prontoParaEnvio: quotes.filter((item) => Boolean(item.ready_to_ship_at && !item.shipped_at))
 .length,
 enviados: quotes.filter((item) => Boolean(item.shipped_at && !item.delivered_at)).length,
 entregues: quotes.filter((item) => Boolean(item.delivered_at)).length,
 vendasMes: quotes
 .filter(
 (item) =>
 item.payment_status === "approved" &&
 isInMonth(item.payment_confirmed_at ?? item.delivered_at ?? "", now)
 )
 .reduce((total, item) => total + Number(item.final_amount), 0)
 };

 let selectedOrder: AdminOrderDetail | null = null;

 if (filters.selected) {
 const sourceOrder = customOrders.find((item) => item.public_id === filters.selected);
 const selectedListItem = filteredOrders.find((item) => item.publicId === filters.selected);

 if (sourceOrder && selectedListItem) {
 const quote = quoteByOrderId.get(sourceOrder.id);
 const fulfillment = fulfillmentByOrderId.get(sourceOrder.id);

 const statusHistoryResponse = await supabase
 .from("custom_order_status_history")
 .select("id,order_id,status,note,changed_by_user_id,changed_at")
 .eq("order_id", sourceOrder.id)
 .order("changed_at", { ascending: false })
 .returns<StatusHistoryRow[]>();

 const changedByUserIds = Array.from(
 new Set(
 (statusHistoryResponse.data ?? [])
 .map((item) => item.changed_by_user_id)
 .filter((userId): userId is string => Boolean(userId))
 )
 );

 const changedByProfilesResponse = changedByUserIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name")
 .in("id", changedByUserIds)
 .returns<ProfileLookupRow[]>()
 : { data: [] as ProfileLookupRow[] };

 const changedByProfileMap = new Map(
 (changedByProfilesResponse.data ?? []).map((item) => [item.id, item.full_name])
 );

 const history: AdminOrderStatusHistoryItem[] = (statusHistoryResponse.data ?? []).map(
 (item) => ({
 id: item.id,
 status: item.status,
 statusLabel: customOrderStatusLabels[item.status] ?? item.status,
 note: item.note,
 changedAt: item.changed_at,
 changedByName: item.changed_by_user_id
 ? changedByProfileMap.get(item.changed_by_user_id) ?? null
 : null,
 changedByRole: null
 })
 );

 selectedOrder = {
 ...selectedListItem,
 productionMode: sourceOrder.production_mode,
 requestType: sourceOrder.request_type,
 modeling: sourceOrder.modeling,
 pieceLength: sourceOrder.piece_length,
 measurements: sourceOrder.measurements ?? {},
 referenceNotes: sourceOrder.reference_notes,
 visualNotes: sourceOrder.visual_notes,
 finalNotes: sourceOrder.final_notes,
 estimateBreakdown: sourceOrder.estimate_breakdown ?? {},
 quoteSummary: quote?.quote_summary ?? null,
 deliveryMode: fulfillment?.delivery_mode ?? null,
 trackingCode: fulfillment?.tracking_code ?? null,
 trackingLink: fulfillment?.tracking_link ?? null,
 history
 };
 }
 }

 return {
 metrics,
 orders: filteredOrders,
 selectedOrder
 };
 } catch {
 return buildMockData();
 }
}

