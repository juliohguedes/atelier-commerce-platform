import {
 customOrderStatusLabels,
 financialStatusLabels,
 paymentStatusLabels,
 storeOrderStatusLabels
} from "@/lib/constants/internal-panels";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ManagementReportFilters } from "@/lib/validations/management";
import type {
 ManagementReportOrderRow,
 ManagementReportPaymentRow,
 ManagementReportSector,
 ManagementReportStatus,
 ManagementReportStockRow,
 ManagementReportsData,
 ManagementSectorPerformance
} from "@/types/management";

interface CustomOrderRow {
 id: number;
 public_id: string;
 protocol_code: string;
 user_id: string | null;
 status: string;
 contact_full_name: string | null;
 created_at: string;
}

interface CustomQuoteRow {
 order_id: number;
 final_amount: number;
 payment_status: string;
 payment_confirmed_at: string | null;
 production_started_at: string | null;
 ready_to_ship_at: string | null;
 shipped_at: string | null;
 delivered_at: string | null;
}

interface StoreOrderRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 status: string;
 payment_status: string;
 total_amount: number;
 shipping_cost: number;
 created_at: string;
 delivered_at: string | null;
}

interface StoreInvoiceRow {
 order_id: number;
 invoice_number: string | null;
 invoice_url: string | null;
}

interface StoreProductRow {
 id: string;
 name: string;
 category_id: string | null;
 collection_id: string | null;
 is_active: boolean;
 low_stock_threshold: number;
}

interface StoreVariantRow {
 id: string;
 product_id: string;
 stock_quantity: number;
 reserved_quantity: number;
 available_quantity: number;
}

interface ProfileRow {
 id: string;
 full_name: string | null;
}

interface CategoryRow {
 id: string;
 name: string;
}

interface CollectionRow {
 id: string;
 name: string;
}

interface PaymentCandidate extends ManagementReportPaymentRow {
 reportStatus: ManagementReportStatus;
 sector: "admin" | "sales_stock";
}

const reportAnalysisStatuses = new Set([
 "em_analise_inicial",
 "em_avaliacao_pela_equipe",
 "aguardando_contato_via_whatsapp",
 "aguardando_confirmacao_da_cliente",
 "pedido_aprovado_para_orcamento_final"
]);

function isWithinDateRange(
 value: string | null | undefined,
 filters: Pick<ManagementReportFilters, "dateFrom" | "dateTo">
): boolean {
 if (!value) {
 return !filters.dateFrom && !filters.dateTo;
 }

 const date = value.slice(0, 10);

 if (filters.dateFrom && date < filters.dateFrom) {
 return false;
 }

 if (filters.dateTo && date > filters.dateTo) {
 return false;
 }

 return true;
}

function getCustomReportStatus(
 order: CustomOrderRow,
 quote: CustomQuoteRow | undefined
): ManagementReportStatus {
 if (quote?.delivered_at) {
 return "entregue";
 }

 if (quote?.shipped_at) {
 return "enviado";
 }

 if (quote?.ready_to_ship_at) {
 return "pronto_para_envio";
 }

 if (quote?.production_started_at || quote?.payment_status === "approved") {
 return "em_producao";
 }

 if (
 quote?.payment_status === "pending" ||
 quote?.payment_status === "awaiting_payment"
 ) {
 return "aguardando_pagamento";
 }

 if (reportAnalysisStatuses.has(order.status)) {
 return "em_analise";
 }

 return "pedido_recebido";
}

function getStoreReportStatus(order: StoreOrderRow): ManagementReportStatus {
 if (order.status === "em_separacao") {
 return "em_separacao";
 }

 if (order.status === "pronto_para_envio") {
 return "pronto_para_envio";
 }

 if (order.status === "enviado") {
 return "enviado";
 }

 if (order.status === "entregue") {
 return "entregue";
 }

 if (order.payment_status === "approved" || order.status === "pagamento_aprovado") {
 return "pagamento_aprovado";
 }

 return "pedido_recebido";
}

function getPaymentStatusLabel(value: string): string {
 return paymentStatusLabels[value] ?? value;
}

function getOrderStatusLabel(status: ManagementReportStatus, sourceStatusLabel: string): string {
 switch (status) {
 case "em_analise":
 return "Em análise";
 case "aguardando_pagamento":
 return "Aguardando pagamento";
 case "em_producao":
 return "Em produção";
 case "pagamento_aprovado":
 return "Pagamento aprovado";
 case "em_separacao":
 return "Em separação";
 default:
 return sourceStatusLabel;
 }
}

function matchesReportStatus(
 selectedStatus: ManagementReportStatus,
 rowStatus: ManagementReportStatus
): boolean {
 return selectedStatus === "todos" || selectedStatus === rowStatus;
}

function shouldIncludeCustomItems(sector: ManagementReportSector): boolean {
 return sector !== "sales_stock";
}

function shouldIncludeStoreItems(sector: ManagementReportSector): boolean {
 return sector !== "admin";
}

function shouldIncludeStockItems(sector: ManagementReportSector): boolean {
 return sector === "todos" || sector === "sales_stock";
}

function getCustomPaymentReportStatus(
 order: CustomOrderRow,
 quote: CustomQuoteRow | undefined
): ManagementReportStatus {
 if (
 quote?.payment_status === "pending" ||
 quote?.payment_status === "awaiting_payment"
 ) {
 return "aguardando_pagamento";
 }

 if (quote?.payment_status === "approved") {
 return getCustomReportStatus(order, quote);
 }

 return getCustomReportStatus(order, quote);
}

function getStorePaymentReportStatus(order: StoreOrderRow): ManagementReportStatus {
 if (
 order.payment_status === "pending" ||
 order.payment_status === "awaiting_payment"
 ) {
 return "aguardando_pagamento";
 }

 return getStoreReportStatus(order);
}

function roundPercentage(value: number): number {
 return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
}

function buildPerformanceRows(
 customOrders: ManagementReportOrderRow[],
 storeOrders: ManagementReportOrderRow[],
 payments: ManagementReportPaymentRow[],
 stock: ManagementReportStockRow[]
): ManagementSectorPerformance[] {
 const adminRevenue = customOrders.reduce((total, item) => total + item.totalAmount, 0);
 const financeRevenue = payments.reduce((total, item) => total + item.totalAmount, 0);
 const salesRevenue = storeOrders.reduce((total, item) => total + item.totalAmount, 0);

 const adminCompleted = customOrders.filter((item) => item.status === "entregue").length;
 const financeCompleted = payments.filter(
 (item) => item.paymentStatusLabel === paymentStatusLabels.approved
 ).length;
 const salesCompleted = storeOrders.filter((item) => item.status === "entregue").length;

 return [
 {
 sector: "admin",
 label: "Admin",
 totalOrders: customOrders.length,
 totalRevenue: adminRevenue,
 pendingItems: customOrders.filter((item) =>
 ["em_analise", "aguardando_pagamento", "em_producao"].includes(item.status)
 ).length,
 completionRate: customOrders.length > 0 ? roundPercentage((adminCompleted / customOrders.length) * 100) : 0,
 averageTicket: customOrders.length > 0 ? adminRevenue / customOrders.length : 0
 },
 {
 sector: "finance",
 label: "Financeiro",
 totalOrders: payments.length,
 totalRevenue: financeRevenue,
 pendingItems: payments.filter((item) =>
 ["Pendente", "Aguardando pagamento"].includes(item.paymentStatusLabel)
 ).length,
 completionRate: payments.length > 0 ? roundPercentage((financeCompleted / payments.length) * 100) : 0,
 averageTicket: payments.length > 0 ? financeRevenue / payments.length : 0
 },
 {
 sector: "sales_stock",
 label: "Vendas e estoque",
 totalOrders: storeOrders.length,
 totalRevenue: salesRevenue,
 pendingItems:
 storeOrders.filter((item) =>
 ["em_separacao", "pronto_para_envio"].includes(item.status)
 ).length + stock.filter((item) => item.lowStockVariants > 0).length,
 completionRate: storeOrders.length > 0 ? roundPercentage((salesCompleted / storeOrders.length) * 100) : 0,
 averageTicket: storeOrders.length > 0 ? salesRevenue / storeOrders.length : 0
 }
 ];
}

function buildStrategicInsights(
 sector: ManagementReportSector,
 orders: ManagementReportOrderRow[],
 payments: ManagementReportPaymentRow[],
 stock: ManagementReportStockRow[]
): string[] {
 const pendingPaymentCount = payments.filter((item) =>
 ["Pendente", "Aguardando pagamento"].includes(item.paymentStatusLabel)
 ).length;
 const lowStockCount = stock.filter((item) => item.lowStockVariants > 0).length;
 const deliveriesCount = orders.filter((item) =>
 ["pronto_para_envio", "enviado"].includes(item.status)
 ).length;

 if (sector === "finance") {
 return [
 `${pendingPaymentCount} pagamentos aguardam acompanhamento imediato.`,
 `${payments.filter((item) => item.invoiceLabel === "Nota pendente").length} registros financeiros ainda precisam de nota ou validacao final.`,
 `${deliveriesCount} pedidos ja estao em fase de expedicao com impacto direto no caixa.`
 ];
 }

 if (sector === "sales_stock") {
 return [
 `${lowStockCount} produtos exigem reposicao ou redistribuicao de estoque.`,
 `${orders.filter((item) => item.status === "em_separacao").length} pedidos seguem em separacao interna.`,
 `${deliveriesCount} envios devem ser priorizados para cumprir a operacao da loja.`
 ];
 }

 return [
 `${pendingPaymentCount} pagamentos pendentes ainda afetam o fluxo estrategico da empresa.`,
 `${lowStockCount} produtos com estoque baixo podem comprometer campanhas e vendas futuras.`,
 `${deliveriesCount} pedidos em expedicao demandam alinhamento entre producao, financeiro e atendimento.`
 ];
}

function buildMockData(filters: ManagementReportFilters): ManagementReportsData {
 const now = new Date().toISOString();

 const orderCandidates: ManagementReportOrderRow[] = [
 {
 id: "custom-mock-1",
 source: "custom_order",
 reference: "PED-000411",
 clientName: "Mariana F.",
 sector: "admin",
 status: "em_producao",
 statusLabel: "Em produção",
 paymentStatusLabel: "Aprovado",
 createdAt: now,
 totalAmount: 1890
 },
 {
 id: "store-mock-1",
 source: "store_order",
 reference: "LOJ-000182",
 clientName: "Renata C.",
 sector: "sales_stock",
 status: "pronto_para_envio",
 statusLabel: "Pronto para envio",
 paymentStatusLabel: "Aprovado",
 createdAt: now,
 totalAmount: 459
 }
 ];

 const paymentCandidates: PaymentCandidate[] = [
 {
 id: "payment-mock-1",
 source: "custom_order",
 sector: "admin",
 reportStatus: "pagamento_aprovado",
 reference: "PED-000411",
 clientName: "Mariana F.",
 paymentStatusLabel: "Aprovado",
 invoiceLabel: "Não aplicavel",
 totalAmount: 1890,
 shippingCost: 0,
 createdAt: now
 },
 {
 id: "payment-mock-2",
 source: "store_order",
 sector: "sales_stock",
 reportStatus: "aguardando_pagamento",
 reference: "LOJ-000182",
 clientName: "Renata C.",
 paymentStatusLabel: "Aguardando pagamento",
 invoiceLabel: "Nota pendente",
 totalAmount: 459,
 shippingCost: 36,
 createdAt: now
 }
 ];

 const stockCandidates: ManagementReportStockRow[] = [
 {
 productId: "product-mock-1",
 productName: "Blazer Noir Signature",
 categoryName: "Alfaiataria",
 collectionName: "Noir Signature",
 availableQuantity: 3,
 reservedQuantity: 2,
 variantsCount: 3,
 lowStockVariants: 1,
 isActive: true,
 isAvailable: true
 }
 ];

 const orders = orderCandidates
 .filter((item) => matchesReportStatus(filters.status, item.status))
 .filter((item) => {
 if (item.source === "custom_order") {
 return shouldIncludeCustomItems(filters.sector);
 }

 return shouldIncludeStoreItems(filters.sector);
 });

 const payments = paymentCandidates
 .filter((item) => matchesReportStatus(filters.status, item.reportStatus))
 .filter((item) => {
 if (item.source === "custom_order") {
 return shouldIncludeCustomItems(filters.sector);
 }

 return shouldIncludeStoreItems(filters.sector);
 })
 .map((item) => ({
 id: item.id,
 source: item.source,
 reference: item.reference,
 clientName: item.clientName,
 paymentStatusLabel: item.paymentStatusLabel,
 invoiceLabel: item.invoiceLabel,
 totalAmount: item.totalAmount,
 shippingCost: item.shippingCost,
 createdAt: item.createdAt
 }));

 const stock = shouldIncludeStockItems(filters.sector)
 ? stockCandidates.filter((item) => {
 if (filters.status === "estoque_baixo") {
 return item.lowStockVariants > 0;
 }

 if (filters.status === "indisponivel") {
 return !item.isAvailable;
 }

 return true;
 })
 : [];

 const performance = buildPerformanceRows(
 orders.filter((item) => item.sector === "admin"),
 orders.filter((item) => item.sector === "sales_stock"),
 payments,
 stock
 ).filter((item) => filters.sector === "todos" || item.sector === filters.sector);

 return {
 summary: {
 totalOrders: orders.length,
 totalSales: payments.reduce((total, item) => total + item.totalAmount, 0),
 approvedPayments: payments.filter((item) => item.paymentStatusLabel === "Aprovado").length,
 pendingPayments: payments.filter((item) =>
 ["Pendente", "Aguardando pagamento"].includes(item.paymentStatusLabel)
 ).length,
 lowStockProducts: stock.filter((item) => item.lowStockVariants > 0).length,
 projectedDeliveries: orders.filter((item) =>
 ["pronto_para_envio", "enviado"].includes(item.status)
 ).length
 },
 orders,
 payments,
 stock,
 performance,
 strategicInsights: buildStrategicInsights(filters.sector, orders, payments, stock)
 };
}

export async function getManagementReportsData(
 filters: ManagementReportFilters
): Promise<ManagementReportsData> {
 if (!isSupabaseConfigured) {
 return buildMockData(filters);
 }

 try {
 const supabase = await createSupabaseServerClient();

 const [
 customOrdersResponse,
 customQuotesResponse,
 storeOrdersResponse,
 invoicesResponse,
 productsResponse,
 variantsResponse,
 categoriesResponse,
 collectionsResponse
 ] = await Promise.all([
 supabase
 .from("custom_orders")
 .select("id,public_id,protocol_code,user_id,status,contact_full_name,created_at")
 .order("created_at", { ascending: false })
 .returns<CustomOrderRow[]>(),
 supabase
 .from("custom_order_final_quotes")
 .select(
 "order_id,final_amount,payment_status,payment_confirmed_at,production_started_at,ready_to_ship_at,shipped_at,delivered_at"
 )
 .returns<CustomQuoteRow[]>(),
 supabase
 .from("store_orders")
 .select(
 "id,public_id,order_number,user_id,status,payment_status,total_amount,shipping_cost,created_at,delivered_at"
 )
 .order("created_at", { ascending: false })
 .returns<StoreOrderRow[]>(),
 supabase
 .from("store_order_invoices")
 .select("order_id,invoice_number,invoice_url")
 .returns<StoreInvoiceRow[]>(),
 supabase
 .from("store_products")
 .select("id,name,category_id,collection_id,is_active,low_stock_threshold")
 .returns<StoreProductRow[]>(),
 supabase
 .from("store_product_variants")
 .select("id,product_id,stock_quantity,reserved_quantity,available_quantity")
 .returns<StoreVariantRow[]>(),
 supabase.from("store_categories").select("id,name").returns<CategoryRow[]>(),
 supabase.from("store_collections").select("id,name").returns<CollectionRow[]>()
 ]);

 const customOrders = customOrdersResponse.data ?? [];
 const customQuotes = customQuotesResponse.data ?? [];
 const storeOrders = storeOrdersResponse.data ?? [];
 const invoices = invoicesResponse.data ?? [];
 const products = productsResponse.data ?? [];
 const variants = variantsResponse.data ?? [];

 const profileIds = Array.from(
 new Set([
 ...customOrders.map((item) => item.user_id),
 ...storeOrders.map((item) => item.user_id)
 ].filter((userId): userId is string => Boolean(userId)))
 );

 const profilesResponse = profileIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name")
 .in("id", profileIds)
 .returns<ProfileRow[]>()
 : { data: [] as ProfileRow[] };

 const profileById = new Map((profilesResponse.data ?? []).map((item) => [item.id, item.full_name]));
 const quoteByOrderId = new Map(customQuotes.map((item) => [item.order_id, item]));
 const invoiceByOrderId = new Map(invoices.map((item) => [item.order_id, item]));
 const categoriesById = new Map((categoriesResponse.data ?? []).map((item) => [item.id, item.name]));
 const collectionsById = new Map((collectionsResponse.data ?? []).map((item) => [item.id, item.name]));

 const customOrderRows: ManagementReportOrderRow[] = customOrders
 .map((order) => {
 const quote = quoteByOrderId.get(order.id);
 const reportStatus = getCustomReportStatus(order, quote);
 const sourceLabel = customOrderStatusLabels[order.status] ?? order.status;

 return {
 id: order.public_id,
 source: "custom_order" as const,
 reference: order.protocol_code,
 clientName:
 order.contact_full_name ?? (order.user_id ? profileById.get(order.user_id) : null) ?? "Cliente sem nome",
 sector: "admin" as const,
 status: reportStatus,
 statusLabel: getOrderStatusLabel(reportStatus, sourceLabel),
 paymentStatusLabel: quote ? getPaymentStatusLabel(quote.payment_status) : null,
 createdAt: order.created_at,
 totalAmount: Number(quote?.final_amount ?? 0)
 };
 })
 .filter((item) => isWithinDateRange(item.createdAt, filters))
 .filter((item) => matchesReportStatus(filters.status, item.status));

 const storeOrderRows: ManagementReportOrderRow[] = storeOrders
 .map((order) => {
 const reportStatus = getStoreReportStatus(order);
 const sourceLabel = storeOrderStatusLabels[order.status] ?? order.status;

 return {
 id: order.public_id,
 source: "store_order" as const,
 reference: order.order_number,
 clientName: profileById.get(order.user_id) ?? "Cliente sem nome",
 sector: "sales_stock" as const,
 status: reportStatus,
 statusLabel: getOrderStatusLabel(reportStatus, sourceLabel),
 paymentStatusLabel: getPaymentStatusLabel(order.payment_status),
 createdAt: order.created_at,
 totalAmount: Number(order.total_amount)
 };
 })
 .filter((item) => isWithinDateRange(item.createdAt, filters))
 .filter((item) => matchesReportStatus(filters.status, item.status));

 const orders = [...customOrderRows, ...storeOrderRows]
 .filter((item) => {
 if (item.source === "custom_order") {
 return shouldIncludeCustomItems(filters.sector);
 }

 return shouldIncludeStoreItems(filters.sector);
 })
 .sort((left, right) => (left.createdAt > right.createdAt ? -1 : 1));

 const paymentCandidates: PaymentCandidate[] = [
 ...customOrders.map((order) => {
 const quote = quoteByOrderId.get(order.id);
 const reportStatus = getCustomPaymentReportStatus(order, quote);

 return {
 id: `custom-${order.public_id}`,
 source: "custom_order" as const,
 sector: "admin" as const,
 reportStatus,
 reference: order.protocol_code,
 clientName:
 order.contact_full_name ?? (order.user_id ? profileById.get(order.user_id) : null) ?? "Cliente sem nome",
 paymentStatusLabel: getPaymentStatusLabel(quote?.payment_status ?? "pending"),
 invoiceLabel: "Não aplicavel",
 totalAmount: Number(quote?.final_amount ?? 0),
 shippingCost: 0,
 createdAt: order.created_at
 };
 }),
 ...storeOrders.map((order) => {
 const invoice = invoiceByOrderId.get(order.id);
 const invoiceLabel = invoice?.invoice_url
 ? invoice.invoice_number ?? "Nota emitida"
 : order.payment_status === "approved"
 ? financialStatusLabels.pending_invoice
 : "Nota pendente";
 const reportStatus = getStorePaymentReportStatus(order);

 return {
 id: `store-${order.public_id}`,
 source: "store_order" as const,
 sector: "sales_stock" as const,
 reportStatus,
 reference: order.order_number,
 clientName: profileById.get(order.user_id) ?? "Cliente sem nome",
 paymentStatusLabel: getPaymentStatusLabel(order.payment_status),
 invoiceLabel,
 totalAmount: Number(order.total_amount),
 shippingCost: Number(order.shipping_cost),
 createdAt: order.created_at
 };
 })
 ].filter((item) => isWithinDateRange(item.createdAt, filters));

 const paymentRows: ManagementReportPaymentRow[] = paymentCandidates
 .filter((item) => matchesReportStatus(filters.status, item.reportStatus))
 .filter((item) => {
 if (item.source === "custom_order") {
 return shouldIncludeCustomItems(filters.sector);
 }

 return shouldIncludeStoreItems(filters.sector);
 })
 .map((item) => ({
 id: item.id,
 source: item.source,
 reference: item.reference,
 clientName: item.clientName,
 paymentStatusLabel: item.paymentStatusLabel,
 invoiceLabel: item.invoiceLabel,
 totalAmount: item.totalAmount,
 shippingCost: item.shippingCost,
 createdAt: item.createdAt
 }));

 const variantsByProductId = new Map<string, StoreVariantRow[]>();
 for (const variant of variants) {
 const current = variantsByProductId.get(variant.product_id) ?? [];
 variantsByProductId.set(variant.product_id, [...current, variant]);
 }

 const stockRows: ManagementReportStockRow[] = shouldIncludeStockItems(filters.sector)
 ? products
 .map((product) => {
 const productVariants = variantsByProductId.get(product.id) ?? [];
 const availableQuantity = productVariants.reduce(
 (total, item) => total + Number(item.available_quantity),
 0
 );
 const reservedQuantity = productVariants.reduce(
 (total, item) => total + Number(item.reserved_quantity),
 0
 );
 const lowStockVariants = productVariants.filter(
 (item) => Number(item.available_quantity) <= product.low_stock_threshold
 ).length;

 return {
 productId: product.id,
 productName: product.name,
 categoryName: product.category_id
 ? categoriesById.get(product.category_id) ?? null
 : null,
 collectionName: product.collection_id
 ? collectionsById.get(product.collection_id) ?? null
 : null,
 availableQuantity,
 reservedQuantity,
 variantsCount: productVariants.length,
 lowStockVariants,
 isActive: product.is_active,
 isAvailable: availableQuantity > 0
 };
 })
 .filter((item) => {
 if (filters.status === "estoque_baixo") {
 return item.lowStockVariants > 0;
 }

 if (filters.status === "indisponivel") {
 return !item.isAvailable;
 }

 return true;
 })
 .sort((left, right) => right.lowStockVariants - left.lowStockVariants)
 : [];

 const performance = buildPerformanceRows(
 customOrderRows,
 storeOrderRows,
 paymentRows,
 stockRows
 ).filter((item) => filters.sector === "todos" || item.sector === filters.sector);

 const summary = {
 totalOrders: orders.length,
 totalSales: paymentRows.reduce((total, item) => total + item.totalAmount, 0),
 approvedPayments: paymentRows.filter((item) => item.paymentStatusLabel === "Aprovado")
 .length,
 pendingPayments: paymentRows.filter((item) =>
 ["Pendente", "Aguardando pagamento"].includes(item.paymentStatusLabel)
 ).length,
 lowStockProducts: stockRows.filter((item) => item.lowStockVariants > 0).length,
 projectedDeliveries: orders.filter((item) =>
 ["pronto_para_envio", "enviado"].includes(item.status)
 ).length
 };

 return {
 summary,
 orders,
 payments: paymentRows,
 stock: stockRows,
 performance,
 strategicInsights: buildStrategicInsights(filters.sector, orders, paymentRows, stockRows)
 };
 } catch {
 return buildMockData(filters);
 }
}
