import type { Route } from "next";
import Link from "next/link";
import { FinanceOrderUpdateForm } from "@/components/internal/finance-order-update-form";
import { InternalKpiLinkCard } from "@/components/internal/internal-kpi-link-card";
import { InternalStatusChip } from "@/components/internal/internal-status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financeDashboardBlocks } from "@/lib/constants/internal-panels";
import { requireRole } from "@/lib/auth/guards";
import { ROUTES } from "@/lib/constants/routes";
import { financePanelFiltersSchema } from "@/lib/validations/internal-panels";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import {
 getFinanceFinancialStatusLabel,
 getFinancePanelData,
 getFinancePaymentStatusLabel,
 getFinanceStoreStatusLabel
} from "@/services/internal/get-finance-panel-data";

interface FinancePanelPageProps {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeSearchParams(
 raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
 return Object.fromEntries(
 Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
 );
}

function buildFinanceHref(
 current: ReturnType<typeof financePanelFiltersSchema.parse>,
 overrides: Partial<ReturnType<typeof financePanelFiltersSchema.parse>>
): string {
 const params = new URLSearchParams();
 const merged = {
 ...current,
 ...overrides
 };

 for (const [key, value] of Object.entries(merged)) {
 if (!value) {
 continue;
 }

 params.set(key, String(value));
 }

 const query = params.toString();
 return query.length > 0 ? `${ROUTES.private.finance}?${query}` : ROUTES.private.finance;
}

function financialTone(status: string): "neutral" | "warning" | "success" | "danger" {
 if (["pending_quote", "pending_payment", "pending_shipping", "pending_invoice"].includes(status)) {
 return "warning";
 }

 if (["invoice_issued", "payment_approved"].includes(status)) {
 return "success";
 }

 if (["cancelled", "failed"].includes(status)) {
 return "danger";
 }

 return "neutral";
}

export default async function FinancePanelPage({ searchParams }: FinancePanelPageProps) {
 await requireRole(["admin", "finance"]);

 const resolvedSearchParams = await searchParams;
 const normalized = normalizeSearchParams(resolvedSearchParams);
 const parsedFilters = financePanelFiltersSchema.safeParse(normalized);

 const filters = parsedFilters.success
 ? parsedFilters.data
 : financePanelFiltersSchema.parse({ status: "todos" });

 const data = await getFinancePanelData(filters);

 const metricValues = {
 aguardando_orcamento: data.metrics.aguardandoOrcamento,
 aguardando_pagamento: data.metrics.aguardandoPagamento,
 pagamentos_aprovados: data.metrics.pagamentosAprovados,
 frete_pendente: data.metrics.fretePendente,
 nota_fiscal_pendente: data.metrics.notaFiscalPendente,
 notas_emitidas: data.metrics.notasEmitidas
 } as const;

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Financeiro</p>
 <h1 className="text-4xl">Painel financeiro por setor</h1>
 <p className="max-w-3xl text-sm text-muted-foreground">
 Gestão de orçamento final, pagamento, frete e nota fiscal com desbloqueio, notificação previa e auditoria.
 </p>
 </header>

 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
 {financeDashboardBlocks.map((block) => (
 <InternalKpiLinkCard
 href={buildFinanceHref(filters, {
 status: block.id,
 selected: undefined
 })}
 key={block.id}
 title={block.title}
 value={metricValues[block.id]}
 />
 ))}
 </div>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Filtros e busca</CardTitle>
 </CardHeader>
 <CardContent>
 <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" method="get">
 <div className="space-y-1 xl:col-span-2">
 <label className="text-xs text-muted-foreground" htmlFor="finance-query">
 Busca (protocolo, nome, e-mail)
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.query ?? ""}
 id="finance-query"
 name="query"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-protocol">
 Protocolo
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.protocol ?? ""}
 id="finance-protocol"
 name="protocol"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-name">
 Nome
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.name ?? ""}
 id="finance-name"
 name="name"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-status">
 Status financeiro
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.financialStatus}
 id="finance-status"
 name="financialStatus"
 >
 <option value="todos">Todos</option>
 <option value="pending_quote">Aguardando orçamento</option>
 <option value="pending_payment">Aguardando pagamento</option>
 <option value="payment_approved">Pagamento aprovado</option>
 <option value="pending_shipping">Frete pendente</option>
 <option value="pending_invoice">Nota fiscal pendente</option>
 <option value="invoice_issued">Nota emitida</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-payment-status">
 Pagamento
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.paymentStatus}
 id="finance-payment-status"
 name="paymentStatus"
 >
 <option value="todos">Todos</option>
 <option value="pending">Pendente</option>
 <option value="awaiting_payment">Aguardando pagamento</option>
 <option value="approved">Aprovado</option>
 <option value="failed">Falhou</option>
 <option value="cancelled">Cancelado</option>
 <option value="refunded">Reembolsado</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-invoice-status">
 Nota fiscal
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.invoiceStatus}
 id="finance-invoice-status"
 name="invoiceStatus"
 >
 <option value="todos">Todas</option>
 <option value="com_nota">Com nota</option>
 <option value="sem_nota">Sem nota</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-date-from">
 Data inicial
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateFrom ?? ""}
 id="finance-date-from"
 name="dateFrom"
 type="date"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="finance-date-to">
 Data final
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateTo ?? ""}
 id="finance-date-to"
 name="dateTo"
 type="date"
 />
 </div>

 <div className="flex items-end gap-2 xl:col-span-6">
 <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">
 Aplicar filtros
 </button>
 <Link
 className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
 href={ROUTES.private.finance}
 >
 Limpar
 </Link>
 </div>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Lista financeira</CardTitle>
 </CardHeader>
 <CardContent>
 {data.orders.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido encontrado com os filtros atuais.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[840px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Protocolo</th>
 <th className="px-2 py-2">Cliente</th>
 <th className="px-2 py-2">Pagamento</th>
 <th className="px-2 py-2">Status financeiro</th>
 <th className="px-2 py-2">Nota fiscal</th>
 <th className="px-2 py-2">Total</th>
 <th className="px-2 py-2">Data</th>
 </tr>
 </thead>
 <tbody>
 {data.orders.map((order) => (
 <tr className="border-b border-border/40" key={order.publicId}>
 <td className="px-2 py-2">
 <Link
 className="text-gold-400 hover:underline"
 href={buildFinanceHref(filters, { selected: order.publicId }) as Route}
 >
 {order.protocol}
 </Link>
 </td>
 <td className="px-2 py-2">{order.clientName}</td>
 <td className="px-2 py-2">{getFinancePaymentStatusLabel(order.paymentStatus)}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={getFinanceFinancialStatusLabel(order.financialStatus)}
 tone={financialTone(order.financialStatus)}
 />
 </td>
 <td className="px-2 py-2">{order.invoiceNumber ?? "Pendente"}</td>
 <td className="px-2 py-2">{formatCurrencyBRL(order.totalAmount)}</td>
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
 <CardTitle className="text-lg">Painel lateral financeiro</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.selectedOrder ? (
 <>
 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Protocolo</p>
 <p className="text-sm font-medium">{data.selectedOrder.protocol}</p>
 <p className="text-xs text-muted-foreground">Tipo: {data.selectedOrder.type === "store_order" ? "Loja" : "Sob medida"}</p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dados da cliente</p>
 <p className="text-sm">{data.selectedOrder.clientName}</p>
 <p className="text-sm text-muted-foreground">{data.selectedOrder.clientEmail ?? "E-mail não informado"}</p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Orçamento e pagamento</p>
 <p className="text-sm text-muted-foreground">Total: {formatCurrencyBRL(data.selectedOrder.totalAmount)}</p>
 <p className="text-sm text-muted-foreground">Frete: {formatCurrencyBRL(data.selectedOrder.shippingCost)}</p>
 <p className="text-sm text-muted-foreground">
 Pagamento: {getFinancePaymentStatusLabel(data.selectedOrder.paymentStatus)}
 </p>
 {data.selectedOrder.storeOrderStatus ? (
 <p className="text-sm text-muted-foreground">
 Status do pedido: {getFinanceStoreStatusLabel(data.selectedOrder.storeOrderStatus)}
 </p>
 ) : null}
 <p className="text-sm text-muted-foreground">Referencia: {data.selectedOrder.paymentReference ?? "Não informada"}</p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Frete e nota fiscal</p>
 <p className="text-sm text-muted-foreground">
 Transportadora: {data.selectedOrder.shippingCarrier ?? "Não informada"}
 </p>
 <p className="text-sm text-muted-foreground">Rastreio: {data.selectedOrder.trackingCode ?? "Não informado"}</p>
 <p className="text-sm text-muted-foreground">
 Nota fiscal URL: {data.selectedOrder.invoiceUrl ?? "Não informada"}
 </p>
 </div>

 <div className="space-y-1 border-t border-border/70 pt-3">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Atualizar com desbloqueio</p>
 <FinanceOrderUpdateForm order={data.selectedOrder} />
 </div>
 </>
 ) : (
 <p className="text-sm text-muted-foreground">
 Selecione um pedido para abrir os controles financeiros detalhados.
 </p>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

