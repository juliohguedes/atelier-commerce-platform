import { financialStatusLabels, paymentStatusLabels, storeOrderStatusLabels } from "@/lib/constants/internal-panels";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FinancePanelFilters } from "@/lib/validations/internal-panels";
import type {
 FinanceOrderDetail,
 FinanceOrderListItem,
 FinancePanelData
} from "@/types/internal-panels";

interface CustomOrderFinanceRow {
 id: number;
 public_id: string;
 protocol_code: string;
 user_id: string | null;
 status: FinanceOrderDetail["customOrderStatus"];
 contact_full_name: string | null;
 contact_email: string | null;
 created_at: string;
}

interface CustomFinalQuoteRow {
 order_id: number;
 final_amount: number;
 quote_summary: string;
 payment_status: FinanceOrderListItem["paymentStatus"];
 selected_payment_method: FinanceOrderDetail["paymentMethod"];
 payment_reference: string | null;
}

interface CustomFulfillmentRow {
 order_id: number;
 delivery_mode: string | null;
 tracking_code: string | null;
 tracking_link: string | null;
}

interface StoreOrderFinanceRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 status: FinanceOrderDetail["storeOrderStatus"];
 payment_status: FinanceOrderListItem["paymentStatus"];
 payment_method: FinanceOrderDetail["paymentMethod"];
 payment_reference: string | null;
 total_amount: number;
 shipping_cost: number;
 shipping_carrier: string | null;
 tracking_code: string | null;
 tracking_link: string | null;
 delivery_mode: "entrega" | "retirada" | null;
 created_at: string;
}

interface StoreInvoiceRow {
 order_id: number;
 invoice_number: string;
 invoice_url: string | null;
}

interface ProfileRow {
 id: string;
 full_name: string | null;
 email: string | null;
 whatsapp: string | null;
}

function toFinancialStatus(
 value:
 | "pending_quote"
 | "pending_payment"
 | "payment_approved"
 | "pending_shipping"
 | "pending_invoice"
 | "invoice_issued"
): FinanceOrderListItem["financialStatus"] {
 return value;
}

function resolveCustomFinancialStatus(
 quote: CustomFinalQuoteRow | undefined,
 fulfillment: CustomFulfillmentRow | undefined
): FinanceOrderListItem["financialStatus"] {
 if (!quote) {
 return toFinancialStatus("pending_quote");
 }

 if (quote.payment_status === "pending" || quote.payment_status === "awaiting_payment") {
 return toFinancialStatus("pending_payment");
 }

 if (
 quote.payment_status === "approved" &&
 fulfillment?.delivery_mode === "entrega" &&
 !fulfillment.tracking_code
 ) {
 return toFinancialStatus("pending_shipping");
 }

 if (quote.payment_status === "approved") {
 return toFinancialStatus("payment_approved");
 }

 return toFinancialStatus("pending_payment");
}

function resolveStoreFinancialStatus(
 order: StoreOrderFinanceRow,
 invoice: StoreInvoiceRow | undefined
): FinanceOrderListItem["financialStatus"] {
 if (order.payment_status === "pending" || order.payment_status === "awaiting_payment") {
 return toFinancialStatus("pending_payment");
 }

 if (
 order.payment_status === "approved" &&
 order.delivery_mode === "entrega" &&
 !order.tracking_code
 ) {
 return toFinancialStatus("pending_shipping");
 }

 if (order.payment_status === "approved" && !invoice?.invoice_url) {
 return toFinancialStatus("pending_invoice");
 }

 if (invoice?.invoice_url) {
 return toFinancialStatus("invoice_issued");
 }

 if (order.payment_status === "approved") {
 return toFinancialStatus("payment_approved");
 }

 return toFinancialStatus("pending_payment");
}

function filterFinanceText(filters: FinancePanelFilters, row: FinanceOrderListItem): boolean {
 const normalizedProtocol = filters.protocol?.toLowerCase();
 const normalizedName = filters.name?.toLowerCase();
 const normalizedQuery = filters.query?.toLowerCase();

 if (normalizedProtocol && !row.protocol.toLowerCase().includes(normalizedProtocol)) {
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

 if (filters.paymentStatus !== "todos" && row.paymentStatus !== filters.paymentStatus) {
 return false;
 }

 if (filters.invoiceStatus === "com_nota" && !row.invoiceNumber) {
 return false;
 }

 if (filters.invoiceStatus === "sem_nota" && row.invoiceNumber) {
 return false;
 }

 if (filters.financialStatus !== "todos" && row.financialStatus !== filters.financialStatus) {
 return false;
 }

 if (filters.status !== "todos") {
 const mapped =
 filters.status === "aguardando_orcamento"
 ? "pending_quote"
 : filters.status === "aguardando_pagamento"
 ? "pending_payment"
 : filters.status === "pagamentos_aprovados"
 ? "payment_approved"
 : filters.status === "frete_pendente"
 ? "pending_shipping"
 : filters.status === "nota_fiscal_pendente"
 ? "pending_invoice"
 : "invoice_issued";

 if (row.financialStatus !== mapped) {
 return false;
 }
 }

 if (!normalizedQuery) {
 return true;
 }

 return [row.protocol, row.clientName, row.clientEmail ?? ""].join(" ").toLowerCase().includes(normalizedQuery);
}

function buildMockData(): FinancePanelData {
 const createdAt = new Date().toISOString();

 return {
 metrics: {
 aguardandoOrcamento: 1,
 aguardandoPagamento: 1,
 pagamentosAprovados: 0,
 fretePendente: 0,
 notaFiscalPendente: 0,
 notasEmitidas: 0
 },
 orders: [
 {
 type: "custom_order",
 publicId: "00000000-0000-4000-8000-000000000021",
 protocol: "PED-000021",
 clientName: "Cliente demonstração",
 clientEmail: "cliente@demo.com",
 paymentStatus: "pending",
 financialStatus: "pending_quote",
 totalAmount: 0,
 shippingCost: 0,
 invoiceNumber: null,
 createdAt
 }
 ],
 selectedOrder: null
 };
}

export async function getFinancePanelData(filters: FinancePanelFilters): Promise<FinancePanelData> {
 if (!isSupabaseConfigured) {
 return buildMockData();
 }

 try {
 const supabase = await createSupabaseServerClient();

 const [customOrdersResponse, quotesResponse, customFulfillmentsResponse, storeOrdersResponse, invoicesResponse] =
 await Promise.all([
 supabase
 .from("custom_orders")
 .select(
 "id,public_id,protocol_code,user_id,status,contact_full_name,contact_email,created_at"
 )
 .order("created_at", { ascending: false })
 .returns<CustomOrderFinanceRow[]>(),
 supabase
 .from("custom_order_final_quotes")
 .select(
 "order_id,final_amount,quote_summary,payment_status,selected_payment_method,payment_reference"
 )
 .returns<CustomFinalQuoteRow[]>(),
 supabase
 .from("custom_order_fulfillments")
 .select("order_id,delivery_mode,tracking_code,tracking_link")
 .returns<CustomFulfillmentRow[]>(),
 supabase
 .from("store_orders")
 .select(
 "id,public_id,order_number,user_id,status,payment_status,payment_method,payment_reference,total_amount,shipping_cost,shipping_carrier,tracking_code,tracking_link,delivery_mode,created_at"
 )
 .order("created_at", { ascending: false })
 .returns<StoreOrderFinanceRow[]>(),
 supabase
 .from("store_order_invoices")
 .select("order_id,invoice_number,invoice_url")
 .returns<StoreInvoiceRow[]>()
 ]);

 const customOrders = customOrdersResponse.data ?? [];
 const quotes = quotesResponse.data ?? [];
 const customFulfillments = customFulfillmentsResponse.data ?? [];
 const storeOrders = storeOrdersResponse.data ?? [];
 const invoices = invoicesResponse.data ?? [];

 const quoteByOrderId = new Map(quotes.map((item) => [item.order_id, item]));
 const customFulfillmentByOrderId = new Map(customFulfillments.map((item) => [item.order_id, item]));
 const invoiceByStoreOrderId = new Map(invoices.map((item) => [item.order_id, item]));

 const userIds = Array.from(
 new Set([
 ...customOrders.map((item) => item.user_id),
 ...storeOrders.map((item) => item.user_id)
 ].filter((userId): userId is string => Boolean(userId)))
 );

 const profilesResponse = userIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name,email,whatsapp")
 .in("id", userIds)
 .returns<ProfileRow[]>()
 : { data: [] as ProfileRow[] };

 const profilesByUserId = new Map((profilesResponse.data ?? []).map((item) => [item.id, item]));

 const customFinanceOrders: FinanceOrderListItem[] = customOrders.map((order) => {
 const quote = quoteByOrderId.get(order.id);
 const fulfillment = customFulfillmentByOrderId.get(order.id);
 const profile = order.user_id ? profilesByUserId.get(order.user_id) : undefined;

 return {
 type: "custom_order",
 publicId: order.public_id,
 protocol: order.protocol_code,
 clientName: order.contact_full_name ?? profile?.full_name ?? "Cliente sem nome",
 clientEmail: order.contact_email ?? profile?.email ?? null,
 paymentStatus: quote?.payment_status ?? "pending",
 financialStatus: resolveCustomFinancialStatus(quote, fulfillment),
 totalAmount: quote ? Number(quote.final_amount) : 0,
 shippingCost: 0,
 invoiceNumber: null,
 createdAt: order.created_at
 };
 });

 const storeFinanceOrders: FinanceOrderListItem[] = storeOrders.map((order) => {
 const invoice = invoiceByStoreOrderId.get(order.id);
 const profile = profilesByUserId.get(order.user_id);

 return {
 type: "store_order",
 publicId: order.public_id,
 protocol: order.order_number,
 clientName: profile?.full_name ?? "Cliente sem nome",
 clientEmail: profile?.email ?? null,
 paymentStatus: order.payment_status,
 financialStatus: resolveStoreFinancialStatus(order, invoice),
 totalAmount: Number(order.total_amount),
 shippingCost: Number(order.shipping_cost),
 invoiceNumber: invoice?.invoice_number ?? null,
 createdAt: order.created_at
 };
 });

 const financeOrders = [...storeFinanceOrders, ...customFinanceOrders]
 .sort((left, right) => (left.createdAt > right.createdAt ? -1 : 1))
 .filter((item) => filterFinanceText(filters, item));

 const metrics = {
 aguardandoOrcamento: customOrders.filter((item) => !quoteByOrderId.has(item.id)).length,
 aguardandoPagamento: [...customFinanceOrders, ...storeFinanceOrders].filter(
 (item) => item.financialStatus === "pending_payment"
 ).length,
 pagamentosAprovados: [...customFinanceOrders, ...storeFinanceOrders].filter(
 (item) => item.financialStatus === "payment_approved"
 ).length,
 fretePendente: [...customFinanceOrders, ...storeFinanceOrders].filter(
 (item) => item.financialStatus === "pending_shipping"
 ).length,
 notaFiscalPendente: storeFinanceOrders.filter(
 (item) => item.financialStatus === "pending_invoice"
 ).length,
 notasEmitidas: storeFinanceOrders.filter((item) => item.financialStatus === "invoice_issued")
 .length
 };

 let selectedOrder: FinanceOrderDetail | null = null;

 if (filters.selected) {
 const selected = financeOrders.find((item) => item.publicId === filters.selected);

 if (selected) {
 if (selected.type === "custom_order") {
 const customOrder = customOrders.find((item) => item.public_id === selected.publicId);

 if (customOrder) {
 const quote = quoteByOrderId.get(customOrder.id);
 const fulfillment = customFulfillmentByOrderId.get(customOrder.id);

 selectedOrder = {
 ...selected,
 customOrderStatus: customOrder.status,
 storeOrderStatus: null,
 quoteSummary: quote?.quote_summary ?? null,
 paymentMethod: quote?.selected_payment_method ?? null,
 paymentReference: quote?.payment_reference ?? null,
 shippingCarrier: null,
 trackingCode: fulfillment?.tracking_code ?? null,
 trackingLink: fulfillment?.tracking_link ?? null,
 invoiceUrl: null
 };
 }
 } else {
 const storeOrder = storeOrders.find((item) => item.public_id === selected.publicId);

 if (storeOrder) {
 const invoice = invoiceByStoreOrderId.get(storeOrder.id);

 selectedOrder = {
 ...selected,
 customOrderStatus: null,
 storeOrderStatus: storeOrder.status,
 quoteSummary: null,
 paymentMethod: storeOrder.payment_method,
 paymentReference: storeOrder.payment_reference,
 shippingCarrier: storeOrder.shipping_carrier,
 trackingCode: storeOrder.tracking_code,
 trackingLink: storeOrder.tracking_link,
 invoiceUrl: invoice?.invoice_url ?? null
 };
 }
 }
 }
 }

 return {
 metrics,
 orders: financeOrders,
 selectedOrder
 };
 } catch {
 return buildMockData();
 }
}

export function getFinanceFinancialStatusLabel(status: FinanceOrderListItem["financialStatus"]): string {
 return financialStatusLabels[status] ?? status;
}

export function getFinancePaymentStatusLabel(status: FinanceOrderListItem["paymentStatus"]): string {
 return paymentStatusLabels[status] ?? status;
}

export function getFinanceStoreStatusLabel(status: string): string {
 return storeOrderStatusLabels[status] ?? status;
}
