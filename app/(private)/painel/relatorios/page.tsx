import Link from "next/link";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { InternalStatusChip } from "@/components/internal/internal-status-chip";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import {
 managementSectorLabels,
 managementStatusLabels
} from "@/lib/constants/management";
import { ROUTES } from "@/lib/constants/routes";
import {
 managementReportFiltersSchema,
 type ManagementReportFilters
} from "@/lib/validations/management";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { getManagementReportsData } from "@/services/internal/get-management-reports-data";
import type { ManagementReportStatus } from "@/types/management";

interface ReportsPageProps {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeSearchParams(
 raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
 return Object.fromEntries(
 Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
 );
}

function buildExportHref(filters: ManagementReportFilters, format: "csv" | "pdf"): string {
 const params = new URLSearchParams();

 for (const [key, value] of Object.entries(filters)) {
 if (!value) {
 continue;
 }

 params.set(key, String(value));
 }

 params.set("format", format);
 return `${ROUTES.private.reports}/export?${params.toString()}`;
}

function getStatusTone(status: ManagementReportStatus): "neutral" | "warning" | "success" {
 if (["pagamento_aprovado", "pronto_para_envio", "enviado", "entregue"].includes(status)) {
 return "success";
 }

 if (["em_analise", "aguardando_pagamento", "em_producao", "em_separacao"].includes(status)) {
 return "warning";
 }

 return "neutral";
}

function getPaymentTone(label: string): "neutral" | "warning" | "success" {
 if (label.toLowerCase().includes("aprovado")) {
 return "success";
 }

 if (label.toLowerCase().includes("pendente") || label.toLowerCase().includes("aguardando")) {
 return "warning";
 }

 return "neutral";
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
 const { role } = await requireRole(["admin", "finance", "sales_stock"]);
 const resolvedSearchParams = await searchParams;
 const normalized = normalizeSearchParams(resolvedSearchParams);
 const parsedFilters = managementReportFiltersSchema.safeParse(normalized);

 const filters = parsedFilters.success
 ? parsedFilters.data
 : managementReportFiltersSchema.parse({
 sector: "todos",
 status: "todos"
 });

 const data = await getManagementReportsData(filters);
 const canExport = role === "finance";

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Gestão interna</p>
 <h1 className="text-4xl">Relatórios por setor</h1>
 <p className="max-w-3xl text-sm text-muted-foreground">
 Visão de pedidos, vendas, pagamentos, estoque e desempenho geral com filtros por data,
 setor e status. A exportação em PDF e Excel/CSV fica restrita ao financeiro.
 </p>
 </header>

 {canExport ? (
 <div className="flex flex-wrap gap-3">
 <a
 className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-gold-500/60 hover:text-gold-400"
 href={buildExportHref(filters, "pdf")}
 >
 <FileText className="h-4 w-4" />
 Exportar PDF
 </a>
 <a
 className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-gold-500/60 hover:text-gold-400"
 href={buildExportHref(filters, "csv")}
 >
 <FileSpreadsheet className="h-4 w-4" />
 Exportar Excel/CSV
 </a>
 </div>
 ) : null}

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Filtros do relatório</CardTitle>
 <CardDescription>
 Admin enxerga a visão estrategica geral. Financeiro exporta. Vendas e estoque acompanha a operação.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" method="get">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="report-date-from">
 Data inicial
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateFrom ?? ""}
 id="report-date-from"
 name="dateFrom"
 type="date"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="report-date-to">
 Data final
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateTo ?? ""}
 id="report-date-to"
 name="dateTo"
 type="date"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="report-sector">
 Setor
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.sector}
 id="report-sector"
 name="sector"
 >
 {Object.entries(managementSectorLabels).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="report-status">
 Status
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.status}
 id="report-status"
 name="status"
 >
 {Object.entries(managementStatusLabels).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-end gap-2">
 <button
 className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
 type="submit"
 >
 <Download className="mr-2 h-4 w-4" />
 Aplicar
 </button>
 <Link
 className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
 href={ROUTES.private.reports}
 >
 Limpar
 </Link>
 </div>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Pedidos no recorte
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.summary.totalOrders}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Vendas consolidadas
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {formatCurrencyBRL(data.summary.totalSales)}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Pagamentos aprovados
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.summary.approvedPayments}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Pagamentos pendentes
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.summary.pendingPayments}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Estoque sensível
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.summary.lowStockProducts}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Entregas previstas
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.summary.projectedDeliveries}
 </p>
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Pedidos</CardTitle>
 <CardDescription>
 Consolidado dos pedidos sob medida e da loja conforme o recorte aplicado.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {data.orders.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum pedido encontrado para os filtros atuais.
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[760px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Setor</th>
 <th className="px-2 py-2">Referência</th>
 <th className="px-2 py-2">Cliente</th>
 <th className="px-2 py-2">Status</th>
 <th className="px-2 py-2">Pagamento</th>
 <th className="px-2 py-2">Valor</th>
 <th className="px-2 py-2">Data</th>
 </tr>
 </thead>
 <tbody>
 {data.orders.map((order) => (
 <tr className="border-b border-border/40" key={order.id}>
 <td className="px-2 py-2">{managementSectorLabels[order.sector]}</td>
 <td className="px-2 py-2 font-medium text-gold-400">{order.reference}</td>
 <td className="px-2 py-2">{order.clientName}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={order.statusLabel}
 tone={getStatusTone(order.status)}
 />
 </td>
 <td className="px-2 py-2">{order.paymentStatusLabel ?? "-"}</td>
 <td className="px-2 py-2">
 {formatCurrencyBRL(order.totalAmount)}
 </td>
 <td className="px-2 py-2">{formatDateBR(order.createdAt)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Desempenho geral</CardTitle>
 <CardDescription>
 Leitura executiva por setor para apoiar decisoes da operação.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {data.performance.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum indicador disponível no recorte atual.
 </p>
 ) : (
 data.performance.map((item) => (
 <div className="rounded-xl border border-border/70 bg-card/40 p-4" key={item.sector}>
 <div className="flex items-center justify-between gap-3">
 <p className="text-sm font-medium">{item.label}</p>
 <InternalStatusChip
 label={`${item.completionRate}% concluidos`}
 tone={item.completionRate >= 70 ? "success" : "warning"}
 />
 </div>
 <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
 <p>Pedidos/itens: {item.totalOrders}</p>
 <p>Receita: {formatCurrencyBRL(item.totalRevenue)}</p>
 <p>Pendencias: {item.pendingItems}</p>
 <p>Ticket medio: {formatCurrencyBRL(item.averageTicket)}</p>
 </div>
 </div>
 ))
 )}
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Pagamentos</CardTitle>
 <CardDescription>
 Fluxo financeiro com leitura de aprovação, nota fiscal e frete.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {data.payments.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum registro financeiro encontrado para os filtros atuais.
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[720px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Referência</th>
 <th className="px-2 py-2">Cliente</th>
 <th className="px-2 py-2">Pagamento</th>
 <th className="px-2 py-2">Nota fiscal</th>
 <th className="px-2 py-2">Valor</th>
 <th className="px-2 py-2">Frete</th>
 <th className="px-2 py-2">Data</th>
 </tr>
 </thead>
 <tbody>
 {data.payments.map((payment) => (
 <tr className="border-b border-border/40" key={payment.id}>
 <td className="px-2 py-2 font-medium text-gold-400">{payment.reference}</td>
 <td className="px-2 py-2">{payment.clientName}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={payment.paymentStatusLabel}
 tone={getPaymentTone(payment.paymentStatusLabel)}
 />
 </td>
 <td className="px-2 py-2">{payment.invoiceLabel}</td>
 <td className="px-2 py-2">
 {formatCurrencyBRL(payment.totalAmount)}
 </td>
 <td className="px-2 py-2">
 {formatCurrencyBRL(payment.shippingCost)}
 </td>
 <td className="px-2 py-2">{formatDateBR(payment.createdAt)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Estoque</CardTitle>
 <CardDescription>
 Produtos com disponibilidade, reserva e risco de ruptura.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {data.stock.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum item de estoque relevante para o setor ou filtro atual.
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[720px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Produto</th>
 <th className="px-2 py-2">Categoria</th>
 <th className="px-2 py-2">Coleção</th>
 <th className="px-2 py-2">Disponível</th>
 <th className="px-2 py-2">Reservado</th>
 <th className="px-2 py-2">Baixo estoque</th>
 <th className="px-2 py-2">Situação</th>
 </tr>
 </thead>
 <tbody>
 {data.stock.map((item) => (
 <tr className="border-b border-border/40" key={item.productId}>
 <td className="px-2 py-2 font-medium">{item.productName}</td>
 <td className="px-2 py-2">{item.categoryName ?? "-"}</td>
 <td className="px-2 py-2">{item.collectionName ?? "-"}</td>
 <td className="px-2 py-2">{item.availableQuantity}</td>
 <td className="px-2 py-2">{item.reservedQuantity}</td>
 <td className="px-2 py-2">{item.lowStockVariants}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={item.isAvailable ? "Disponível" : "Indisponivel"}
 tone={item.isAvailable ? "success" : "warning"}
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Insights estrategicos</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {data.strategicInsights.map((insight) => (
 <div className="rounded-xl border border-border/70 bg-card/40 p-3 text-sm" key={insight}>
 {insight}
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 );
}
