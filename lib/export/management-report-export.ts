import { internalCalendarTypeLabels, managementSectorLabels } from "@/lib/constants/management";
import { formatCurrencyBRL } from "@/lib/utils";
import { buildSimplePdf } from "@/lib/export/build-simple-pdf";
import type { ManagementReportFilters } from "@/lib/validations/management";
import type {
 InternalCalendarData,
 ManagementReportsData
} from "@/types/management";

function escapeCsvValue(value: string | number | null): string {
 const normalized = value === null ? "" : String(value);
 return `"${normalized.replace(/"/g, '""')}"`;
}

function buildCsvSectionRow(section: string, values: Array<string | number | null>): string {
 return [section, ...values].map(escapeCsvValue).join(",");
}

export function buildManagementCsv(
 reports: ManagementReportsData,
 calendar: InternalCalendarData
): string {
 const lines: string[] = [];

 lines.push(
 [
 "section",
 "col_1",
 "col_2",
 "col_3",
 "col_4",
 "col_5",
 "col_6",
 "col_7",
 "col_8"
 ]
 .map(escapeCsvValue)
 .join(",")
 );

 lines.push(
 buildCsvSectionRow("resumo", [
 "total_pedidos",
 reports.summary.totalOrders,
 "total_vendas",
 reports.summary.totalSales,
 "pagamentos_aprovados",
 reports.summary.approvedPayments,
 "pagamentos_pendentes",
 reports.summary.pendingPayments
 ])
 );
 lines.push(
 buildCsvSectionRow("resumo", [
 "estoque_baixo",
 reports.summary.lowStockProducts,
 "entregas_previstas",
 reports.summary.projectedDeliveries,
 null,
 null,
 null,
 null
 ])
 );

 for (const order of reports.orders) {
 lines.push(
 buildCsvSectionRow("pedidos", [
 order.reference,
 order.clientName,
 order.source,
 order.sector,
 order.statusLabel,
 order.paymentStatusLabel,
 order.totalAmount,
 order.createdAt
 ])
 );
 }

 for (const payment of reports.payments) {
 lines.push(
 buildCsvSectionRow("pagamentos", [
 payment.reference,
 payment.clientName,
 payment.source,
 payment.paymentStatusLabel,
 payment.invoiceLabel,
 payment.totalAmount,
 payment.shippingCost,
 payment.createdAt
 ])
 );
 }

 for (const stockItem of reports.stock) {
 lines.push(
 buildCsvSectionRow("estoque", [
 stockItem.productName,
 stockItem.categoryName,
 stockItem.collectionName,
 stockItem.availableQuantity,
 stockItem.reservedQuantity,
 stockItem.lowStockVariants,
 stockItem.variantsCount,
 stockItem.isAvailable ? "disponível" : "indisponível"
 ])
 );
 }

 for (const sector of reports.performance) {
 lines.push(
 buildCsvSectionRow("desempenho", [
 sector.label,
 sector.totalOrders,
 sector.totalRevenue,
 sector.pendingItems,
 sector.completionRate,
 sector.averageTicket,
 null,
 null
 ])
 );
 }

 for (const calendarEntry of calendar.entries) {
 lines.push(
 buildCsvSectionRow("calendário", [
 internalCalendarTypeLabels[calendarEntry.type],
 calendarEntry.title,
 calendarEntry.clientName,
 calendarEntry.orderReference,
 calendarEntry.sectorLabel,
 calendarEntry.locationLabel,
 calendarEntry.statusLabel,
 calendarEntry.scheduledAt
 ])
 );
 }

 return lines.join("\n");
}

function formatFilterLine(filters: ManagementReportFilters): string {
 const parts = [
 `Setor: ${managementSectorLabels[filters.sector]}`,
 `Status: ${filters.status}`,
 `Data inicial: ${filters.dateFrom ?? "não informada"}`,
 `Data final: ${filters.dateTo ?? "não informada"}`
 ];

 return parts.join(" | ");
}

export function buildManagementPdf(
 reports: ManagementReportsData,
 calendar: InternalCalendarData,
 filters: ManagementReportFilters
): Uint8Array {
 const lines: string[] = [
 formatFilterLine(filters),
 "",
 "Resumo",
 `Pedidos: ${reports.summary.totalOrders}`,
 `Vendas: ${formatCurrencyBRL(reports.summary.totalSales)}`,
 `Pagamentos aprovados: ${reports.summary.approvedPayments}`,
 `Pagamentos pendentes: ${reports.summary.pendingPayments}`,
 `Produtos com estoque baixo: ${reports.summary.lowStockProducts}`,
 `Entregas previstas: ${reports.summary.projectedDeliveries}`,
 "",
 "Pedidos",
 ...reports.orders.map(
 (order) =>
 `${order.reference} | ${order.clientName} | ${order.statusLabel} | ${formatCurrencyBRL(order.totalAmount)}`
 ),
 "",
 "Pagamentos",
 ...reports.payments.map(
 (payment) =>
 `${payment.reference} | ${payment.paymentStatusLabel} | ${payment.invoiceLabel} | ${formatCurrencyBRL(payment.totalAmount)}`
 ),
 "",
 "Estoque",
 ...reports.stock.map(
 (item) =>
 `${item.productName} | disponível ${item.availableQuantity} | reservado ${item.reservedQuantity} | baixo ${item.lowStockVariants}`
 ),
 "",
 "Desempenho",
 ...reports.performance.map(
 (item) =>
 `${item.label} | pedidos ${item.totalOrders} | receita ${formatCurrencyBRL(item.totalRevenue)} | taxa ${item.completionRate}%`
 ),
 "",
 "Calendário interno",
 ...calendar.entries.map(
 (entry) =>
 `${internalCalendarTypeLabels[entry.type]} | ${entry.title} | ${entry.scheduledAt} | ${entry.locationLabel ?? "Sem local"}`
 ),
 "",
 "Insights",
 ...reports.strategicInsights.map((insight) => `- ${insight}`)
 ];

 return buildSimplePdf({
 title: "Relatório interno da operação",
 lines
 });
}
