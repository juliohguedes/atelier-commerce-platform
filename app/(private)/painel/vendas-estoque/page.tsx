import type { Route } from "next";
import Link from "next/link";
import { SalesOrderShippingForm } from "@/components/internal/sales-order-shipping-form";
import { SalesProductOperationalForm } from "@/components/internal/sales-product-operational-form";
import { SalesVariantStockForm } from "@/components/internal/sales-variant-stock-form";
import { InternalKpiLinkCard } from "@/components/internal/internal-kpi-link-card";
import { InternalStatusChip } from "@/components/internal/internal-status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { ROUTES } from "@/lib/constants/routes";
import { salesStockDashboardBlocks, storeOrderStatusLabels } from "@/lib/constants/internal-panels";
import { salesStockPanelFiltersSchema } from "@/lib/validations/internal-panels";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import {
 getSalesOrderStatusLabel,
 getSalesPaymentStatusLabel,
 getSalesStockPanelData
} from "@/services/internal/get-sales-stock-panel-data";

interface SalesStockPanelPageProps {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeSearchParams(
 raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
 return Object.fromEntries(
 Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
 );
}

function buildSalesHref(
 current: ReturnType<typeof salesStockPanelFiltersSchema.parse>,
 overrides: Partial<ReturnType<typeof salesStockPanelFiltersSchema.parse>>
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
 return query.length > 0 ? `${ROUTES.private.salesStock}?${query}` : ROUTES.private.salesStock;
}

function productTone(isActive: boolean, totalAvailable: number): "neutral" | "warning" | "success" | "danger" {
 if (!isActive) {
 return "danger";
 }

 if (totalAvailable === 0) {
 return "warning";
 }

 return "success";
}

function orderTone(status: string): "neutral" | "warning" | "success" | "danger" {
 if (["cancelado"].includes(status)) {
 return "danger";
 }

 if (["enviado", "entregue"].includes(status)) {
 return "success";
 }

 if (["em_separacao", "pronto_para_envio", "pagamento_aprovado"].includes(status)) {
 return "warning";
 }

 return "neutral";
}

export default async function SalesStockPanelPage({
 searchParams
}: SalesStockPanelPageProps) {
 await requireRole(["admin", "sales_stock"]);

 const resolvedSearchParams = await searchParams;
 const normalized = normalizeSearchParams(resolvedSearchParams);
 const parsedFilters = salesStockPanelFiltersSchema.safeParse(normalized);

 const filters = parsedFilters.success
 ? parsedFilters.data
 : salesStockPanelFiltersSchema.parse({
 productStatus: "todos",
 orderStatus: "todos"
 });

 const data = await getSalesStockPanelData(filters);

 const metricValues = {
 produtos_ativos: data.metrics.produtosAtivos,
 estoque_baixo: data.metrics.estoqueBaixo,
 indisponiveis: data.metrics.indisponiveis,
 pedidos_em_separacao: data.metrics.pedidosEmSeparacao,
 prontos_para_envio: data.metrics.prontosParaEnvio,
 enviados_hoje: data.metrics.enviadosHoje
 } as const;

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Vendas e estoque</p>
 <h1 className="text-4xl">Painel comercial e operacional</h1>
 <p className="max-w-3xl text-sm text-muted-foreground">
 Gestão de catálogo, estoque, disponibilidade e envio da loja online. Preços seguem bloqueados para o financeiro.
 </p>
 </header>

 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
 {salesStockDashboardBlocks.map((block) => {
 const statusHref =
 block.id === "produtos_ativos"
 ? buildSalesHref(filters, {
 productStatus: "ativos",
 selectedOrder: undefined,
 selectedProduct: undefined
 })
 : block.id === "estoque_baixo"
 ? buildSalesHref(filters, {
 productStatus: "baixo_estoque",
 selectedOrder: undefined,
 selectedProduct: undefined
 })
 : block.id === "indisponiveis"
 ? buildSalesHref(filters, {
 productStatus: "indisponiveis",
 selectedOrder: undefined,
 selectedProduct: undefined
 })
 : block.id === "pedidos_em_separacao"
 ? buildSalesHref(filters, {
 orderStatus: "em_separacao",
 selectedOrder: undefined,
 selectedProduct: undefined
 })
 : block.id === "prontos_para_envio"
 ? buildSalesHref(filters, {
 orderStatus: "pronto_para_envio",
 selectedOrder: undefined,
 selectedProduct: undefined
 })
 : buildSalesHref(filters, {
 orderStatus: "enviado",
 selectedOrder: undefined,
 selectedProduct: undefined
 });

 return (
 <InternalKpiLinkCard
 href={statusHref}
 key={block.id}
 title={block.title}
 value={metricValues[block.id]}
 />
 );
 })}
 </div>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Filtros e busca</CardTitle>
 </CardHeader>
 <CardContent>
 <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" method="get">
 <div className="space-y-1 xl:col-span-2">
 <label className="text-xs text-muted-foreground" htmlFor="sales-product-query">
 Busca de produtos (nome, slug, SKU)
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.productQuery ?? ""}
 id="sales-product-query"
 name="productQuery"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="sales-product-status">
 Status de produto
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.productStatus}
 id="sales-product-status"
 name="productStatus"
 >
 <option value="todos">Todos</option>
 <option value="ativos">Ativos</option>
 <option value="inativos">Inativos</option>
 <option value="baixo_estoque">Baixo estoque</option>
 <option value="indisponiveis">Indisponiveis</option>
 </select>
 </div>

 <div className="space-y-1 xl:col-span-2">
 <label className="text-xs text-muted-foreground" htmlFor="sales-order-query">
 Busca de pedidos (número, cliente, rastreio)
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.orderQuery ?? ""}
 id="sales-order-query"
 name="orderQuery"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="sales-order-status">
 Status do pedido
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.orderStatus}
 id="sales-order-status"
 name="orderStatus"
 >
 <option value="todos">Todos</option>
 {Object.entries(storeOrderStatusLabels).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-end gap-2 xl:col-span-6">
 <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">
 Aplicar filtros
 </button>
 <Link
 className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
 href={ROUTES.private.salesStock}
 >
 Limpar
 </Link>
 </div>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
 <div className="space-y-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Produtos da loja</CardTitle>
 </CardHeader>
 <CardContent>
 {data.products.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum produto encontrado com os filtros atuais.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[760px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Produto</th>
 <th className="px-2 py-2">Categoria</th>
 <th className="px-2 py-2">Disponibilidade</th>
 <th className="px-2 py-2">Estoque</th>
 <th className="px-2 py-2">Ações</th>
 </tr>
 </thead>
 <tbody>
 {data.products.map((product) => (
 <tr className="border-b border-border/40" key={product.id}>
 <td className="px-2 py-2">
 <p className="font-medium">{product.name}</p>
 <p className="text-xs text-muted-foreground">{product.slug}</p>
 </td>
 <td className="px-2 py-2">{product.categoryName ?? "Sem categoria"}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={product.totalAvailable > 0 ? "Disponível" : "Sem disponibilidade"}
 tone={productTone(product.isActive, product.totalAvailable)}
 />
 </td>
 <td className="px-2 py-2">
 <p>{product.totalAvailable}</p>
 <p className="text-xs text-muted-foreground">Reservado: {product.totalReserved}</p>
 </td>
 <td className="px-2 py-2">
 <Link
 className="text-gold-400 hover:underline"
 href={buildSalesHref(filters, {
 selectedProduct: product.id,
 selectedOrder: undefined
 }) as Route}
 >
 Abrir painel
 </Link>
 </td>
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
 <CardTitle className="text-lg">Pedidos da loja</CardTitle>
 </CardHeader>
 <CardContent>
 {data.orders.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido encontrado com os filtros atuais.</p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[760px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Pedido</th>
 <th className="px-2 py-2">Cliente</th>
 <th className="px-2 py-2">Status</th>
 <th className="px-2 py-2">Pagamento</th>
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
 href={buildSalesHref(filters, {
 selectedOrder: order.publicId,
 selectedProduct: undefined
 }) as Route}
 >
 {order.orderNumber}
 </Link>
 </td>
 <td className="px-2 py-2">{order.clientName}</td>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={getSalesOrderStatusLabel(order.status)}
 tone={orderTone(order.status)}
 />
 </td>
 <td className="px-2 py-2">{getSalesPaymentStatusLabel(order.paymentStatus)}</td>
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
 </div>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Painel lateral operacional</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.selectedProduct ? (
 <>
 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Produto selecionado</p>
 <p className="text-sm font-medium">{data.selectedProduct.name}</p>
 <p className="text-xs text-muted-foreground">Slug: {data.selectedProduct.slug}</p>
 <p className="text-xs text-muted-foreground">
 Categoria: {data.selectedProduct.categoryName ?? "Sem categoria"}
 </p>
 <p className="text-xs text-muted-foreground">
 Colecao: {data.selectedProduct.collectionName ?? "Sem coleção"}
 </p>
 <p className="text-xs text-muted-foreground">Total disponivel: {data.selectedProduct.totalAvailable}</p>
 <p className="text-xs text-amber-300">
 Preço bloqueado neste painel: alterações de preço somente no financeiro.
 </p>
 </div>

 <div className="border-t border-border/70 pt-3">
 <SalesProductOperationalForm product={data.selectedProduct} />
 </div>

 <div className="space-y-2 border-t border-border/70 pt-3">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Variações e estoque</p>
 {data.selectedProduct.variants.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem variações cadastradas para este produto.</p>
 ) : (
 data.selectedProduct.variants.map((variant) => (
 <SalesVariantStockForm key={variant.id} variant={variant} />
 ))
 )}
 </div>
 </>
 ) : data.selectedOrder ? (
 <>
 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pedido selecionado</p>
 <p className="text-sm font-medium">{data.selectedOrder.orderNumber}</p>
 <p className="text-sm text-muted-foreground">{data.selectedOrder.clientName}</p>
 <p className="text-sm text-muted-foreground">
 Status: {getSalesOrderStatusLabel(data.selectedOrder.status)}
 </p>
 <p className="text-sm text-muted-foreground">
 Pagamento: {getSalesPaymentStatusLabel(data.selectedOrder.paymentStatus)}
 </p>
 <p className="text-sm text-muted-foreground">
 Transportadora: {data.selectedOrder.shippingCarrier ?? "Não informada"}
 </p>
 <p className="text-sm text-muted-foreground">
 Total: {formatCurrencyBRL(data.selectedOrder.totalAmount)}
 </p>
 </div>

 <div className="border-t border-border/70 pt-3">
 <SalesOrderShippingForm orderPublicId={data.selectedOrder.publicId} />
 </div>
 </>
 ) : (
 <p className="text-sm text-muted-foreground">
 Selecione um produto ou pedido na lista para abrir os controles operacionais.
 </p>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}






