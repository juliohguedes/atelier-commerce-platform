import type { Route } from "next";
import Link from "next/link";
import { AdminBrandSettingsForm } from "@/components/internal/admin-brand-settings-form";
import { AdminCalendarEventForm } from "@/components/internal/admin-calendar-event-form";
import { AdminInternalAccessForm } from "@/components/internal/admin-internal-access-form";
import { AdminMaintenanceModeForm } from "@/components/internal/admin-maintenance-mode-form";
import { AdminOrderStatusForm } from "@/components/internal/admin-order-status-form";
import { AdminTechnicalModeForm } from "@/components/internal/admin-technical-mode-form";
import { InternalKpiLinkCard } from "@/components/internal/internal-kpi-link-card";
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
 adminDashboardBlocks,
 customOrderInternalStatusOptions
} from "@/lib/constants/internal-panels";
import { ROUTES } from "@/lib/constants/routes";
import { adminPanelFiltersSchema } from "@/lib/validations/internal-panels";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { getAdminPanelData } from "@/services/internal/get-admin-panel-data";
import { getAdminControlCenterData } from "@/services/internal/get-admin-control-center-data";
import { userRoleLabels } from "@/types/auth";

interface AdminPanelPageProps {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeSearchParams(
 raw: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
 return Object.fromEntries(
 Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
 );
}

function buildAdminHref(
 current: ReturnType<typeof adminPanelFiltersSchema.parse>,
 overrides: Partial<ReturnType<typeof adminPanelFiltersSchema.parse>>
): string {
 const params = new URLSearchParams();
 const merged = { ...current, ...overrides };

 for (const [key, value] of Object.entries(merged)) {
 if (!value) {
 continue;
 }

 params.set(key, String(value));
 }

 const query = params.toString();
 return query.length > 0 ? `${ROUTES.private.admin}?${query}` : ROUTES.private.admin;
}

function statusTone(status: string): "neutral" | "warning" | "success" | "danger" {
 if (["cancelado_interno", "cancelado_pela_cliente"].includes(status)) {
 return "danger";
 }

 if (status === "pedido_encerrado") {
 return "success";
 }

 if (
 [
 "em_analise_inicial",
 "em_avaliacao_pela_equipe",
 "aguardando_confirmacao_da_cliente",
 "pedido_aprovado_para_orcamento_final"
 ].includes(status)
 ) {
 return "warning";
 }

 return "neutral";
}

export default async function AdminPanelPage({ searchParams }: AdminPanelPageProps) {
 const { userId } = await requireRole(["admin"]);

 const resolvedSearchParams = await searchParams;
 const normalized = normalizeSearchParams(resolvedSearchParams);
 const parsedFilters = adminPanelFiltersSchema.safeParse(normalized);

 const filters = parsedFilters.success
 ? parsedFilters.data
 : adminPanelFiltersSchema.parse({ status: "todos" });

 const [data, controlCenter] = await Promise.all([
 getAdminPanelData(filters),
 getAdminControlCenterData(userId)
 ]);

 const metricValues = {
 novos: data.metrics.novos,
 em_analise: data.metrics.emAnalise,
 aguardando_pagamento: data.metrics.aguardandoPagamento,
 em_producao: data.metrics.emProducao,
 pronto_para_envio: data.metrics.prontoParaEnvio,
 enviados: data.metrics.enviados,
 entregues: data.metrics.entregues,
 vendas_mes: data.metrics.vendasMes
 } as const;

 const selectedOrderStatus = data.selectedOrder?.status;
 const normalizedSelectedStatus =
 selectedOrderStatus &&
 customOrderInternalStatusOptions.includes(
 selectedOrderStatus as (typeof customOrderInternalStatusOptions)[number]
 )
 ? (selectedOrderStatus as (typeof customOrderInternalStatusOptions)[number])
 : "pedido_recebido";

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Administração</p>
 <h1 className="text-4xl">Painel admin por setor</h1>
 <p className="max-w-3xl text-sm text-muted-foreground">
 Controle central da operação, identidade da marca, acessos internos,
 manutenção e histórico crítico da empresa.
 </p>
 </header>

 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
 {adminDashboardBlocks.map((block) => (
 <InternalKpiLinkCard
 href={buildAdminHref(filters, {
 status: block.id === "vendas_mes" ? "todos" : block.id,
 selected: undefined
 })}
 isCurrency={block.id === "vendas_mes"}
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
 <label className="text-xs text-muted-foreground" htmlFor="admin-query">
 Busca (nome, protocolo, e-mail, WhatsApp)
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.query ?? ""}
 id="admin-query"
 name="query"
 placeholder="Ex.: PED-000123"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-status">
 Status
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.status}
 id="admin-status"
 name="status"
 >
 <option value="todos">Todos</option>
 <option value="novos">Pedidos novos</option>
 <option value="em_analise">Em análise</option>
 <option value="aguardando_pagamento">Aguardando pagamento</option>
 <option value="em_producao">Em produção</option>
 <option value="pronto_para_envio">Pronto para envio</option>
 <option value="enviados">Enviados</option>
 <option value="entregues">Entregues</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-protocol">
 Protocolo
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.protocol ?? ""}
 id="admin-protocol"
 name="protocol"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-name">
 Nome
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.name ?? ""}
 id="admin-name"
 name="name"
 />
 </div>

 <div className="grid gap-3 md:grid-cols-2 xl:col-span-6">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-date-from">
 Data inicial
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateFrom ?? ""}
 id="admin-date-from"
 name="dateFrom"
 type="date"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-date-to">
 Data final
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 defaultValue={filters.dateTo ?? ""}
 id="admin-date-to"
 name="dateTo"
 type="date"
 />
 </div>
 </div>

 <div className="flex items-end gap-2 xl:col-span-6">
 <button
 className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
 type="submit"
 >
 Aplicar filtros
 </button>
 <Link
 className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
 href={ROUTES.private.admin}
 >
 Limpar
 </Link>
 </div>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Pedidos sob medida</CardTitle>
 <CardDescription>
 Lista executiva com protocolo, status, cliente e tipo da peça.
 </CardDescription>
 </CardHeader>
 <CardContent>
 {data.orders.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum pedido encontrado com os filtros atuais.
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[740px] text-left text-sm">
 <thead>
 <tr className="border-b border-border/70 text-xs uppercase tracking-[0.14em] text-muted-foreground">
 <th className="px-2 py-2">Status</th>
 <th className="px-2 py-2">Protocolo</th>
 <th className="px-2 py-2">Nome</th>
 <th className="px-2 py-2">Tipo de peça</th>
 <th className="px-2 py-2">Pré-orçamento</th>
 <th className="px-2 py-2">Data</th>
 </tr>
 </thead>
 <tbody>
 {data.orders.map((order) => (
 <tr className="border-b border-border/40" key={order.publicId}>
 <td className="px-2 py-2">
 <InternalStatusChip
 label={order.statusLabel}
 tone={statusTone(order.status)}
 />
 </td>
 <td className="px-2 py-2">
 <Link
 className="text-gold-400 hover:underline"
 href={buildAdminHref(filters, { selected: order.publicId }) as Route}
 >
 {order.protocolCode}
 </Link>
 </td>
 <td className="px-2 py-2">{order.clientName}</td>
 <td className="px-2 py-2">{order.pieceTypeLabel}</td>
 <td className="px-2 py-2">
 {formatCurrencyBRL(order.estimatedPrice)}
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
 <CardTitle className="text-lg">Painel lateral do pedido</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.selectedOrder ? (
 <>
 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Dados da cliente
 </p>
 <p className="text-sm font-medium">{data.selectedOrder.clientName}</p>
 <p className="text-sm text-muted-foreground">
 {data.selectedOrder.clientEmail ?? "E-mail não informado"}
 </p>
 <p className="text-sm text-muted-foreground">
 {data.selectedOrder.clientWhatsapp ?? "WhatsApp não informado"}
 </p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Status e resumo
 </p>
 <InternalStatusChip
 label={data.selectedOrder.statusLabel}
 tone={statusTone(data.selectedOrder.status)}
 />
 <p className="text-sm text-muted-foreground">
 Protocolo: {data.selectedOrder.protocolCode}
 </p>
 <p className="text-sm text-muted-foreground">
 Peça: {data.selectedOrder.pieceTypeLabel}
 </p>
 <p className="text-sm text-muted-foreground">
 Pre-orcamento: {formatCurrencyBRL(data.selectedOrder.estimatedPrice)}
 </p>
 <p className="text-sm text-muted-foreground">
 Orcamento final:{" "}
 {data.selectedOrder.finalAmount
 ? formatCurrencyBRL(data.selectedOrder.finalAmount)
 : "Aguardando"}
 </p>
 <p className="text-sm text-muted-foreground">
 Entrega: {data.selectedOrder.deliveryMode ?? "Não definida"}
 </p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Medidas e modelagem
 </p>
 <p className="text-sm text-muted-foreground">
 Modelagem: {data.selectedOrder.modeling ?? "Não informada"}
 </p>
 <p className="text-sm text-muted-foreground">
 Comprimento: {data.selectedOrder.pieceLength ?? "Não informado"}
 </p>
 {Object.keys(data.selectedOrder.measurements).length > 0 ? (
 <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
 {Object.entries(data.selectedOrder.measurements).map(([field, value]) => (
 <p key={field}>
 {field}: {value}
 </p>
 ))}
 </div>
 ) : (
 <p className="text-xs text-muted-foreground">
 Sem medidas registradas.
 </p>
 )}
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Observações e orçamento
 </p>
 <p className="text-sm text-muted-foreground">
 Resumo final: {data.selectedOrder.quoteSummary ?? "Não informado"}
 </p>
 <p className="text-sm text-muted-foreground">
 Referencias: {data.selectedOrder.referenceNotes ?? "Sem observações"}
 </p>
 <p className="text-sm text-muted-foreground">
 Visual: {data.selectedOrder.visualNotes ?? "Sem observações"}
 </p>
 <p className="text-sm text-muted-foreground">
 Tecnico: {data.selectedOrder.finalNotes ?? "Sem observações"}
 </p>
 </div>

 <div className="space-y-1">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Histórico
 </p>
 {data.selectedOrder.history.length === 0 ? (
 <p className="text-xs text-muted-foreground">
 Sem histórico de alterações.
 </p>
 ) : (
 <ul className="space-y-2">
 {data.selectedOrder.history.slice(0, 6).map((item) => (
 <li className="rounded-md border border-border/60 p-2 text-xs" key={item.id}>
 <p className="font-medium">{item.statusLabel}</p>
 <p className="text-muted-foreground">
 {formatDateBR(item.changedAt)}
 {item.changedByName ? ` • ${item.changedByName}` : ""}
 </p>
 {item.note ? (
 <p className="text-muted-foreground">{item.note}</p>
 ) : null}
 </li>
 ))}
 </ul>
 )}
 </div>

 <div className="space-y-1 border-t border-border/70 pt-3">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Atualizar status
 </p>
 <AdminOrderStatusForm
 currentStatus={normalizedSelectedStatus}
 orderPublicId={data.selectedOrder.publicId}
 />
 </div>
 </>
 ) : (
 <p className="text-sm text-muted-foreground">
 Selecione um pedido na lista para abrir o painel lateral com dados completos.
 </p>
 )}
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Operação visual e relatórios</CardTitle>
 <CardDescription>
 Homepage, banners, textos, fotos, logo, cores, anuncios, identidade visual,
 páginas institucionais e governanca executiva da marca.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <div className="rounded-xl border border-border/70 bg-card/50 p-4">
 <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
 Acessos ativos
 </p>
 <p className="mt-2 text-2xl font-semibold text-gold-400">
 {controlCenter.summary.activeInternalUsers}
 </p>
 </div>
 <div className="rounded-xl border border-border/70 bg-card/50 p-4">
 <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
 Notificações pendentes
 </p>
 <p className="mt-2 text-2xl font-semibold text-gold-400">
 {controlCenter.summary.pendingNotifications}
 </p>
 </div>
 <div className="rounded-xl border border-border/70 bg-card/50 p-4">
 <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
 Eventos futuros
 </p>
 <p className="mt-2 text-2xl font-semibold text-gold-400">
 {controlCenter.summary.upcomingCalendarEvents}
 </p>
 </div>
 <div className="rounded-xl border border-border/70 bg-card/50 p-4">
 <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
 Alterações recentes
 </p>
 <p className="mt-2 text-2xl font-semibold text-gold-400">
 {controlCenter.summary.recentCriticalChanges}
 </p>
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div className="rounded-xl border border-border/70 bg-card/40 p-4">
 <p className="text-sm font-medium">Modo visual</p>
 <p className="mt-2 text-sm text-muted-foreground">
 Fluxo facilitado para atualizar identidade da marca, página inicial,
 textos institucionais e configurações publicas sem expor detalhes tecnicos.
 </p>
 </div>
 <div className="rounded-xl border border-border/70 bg-card/40 p-4">
 <p className="text-sm font-medium">Governanca admin</p>
 <p className="mt-2 text-sm text-muted-foreground">
 Acesso interno, relatórios, calendário, manutenção e histórico de alterações
 importantes centralizados no mesmo painel.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Acessos internos</CardTitle>
 <CardDescription>
 Criação e controle dos logins separados por setor.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <AdminInternalAccessForm />

 <div className="space-y-2 border-t border-border/70 pt-4">
 {controlCenter.internalAccesses.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum acesso interno ativo encontrado.
 </p>
 ) : (
 controlCenter.internalAccesses.map((access) => (
 <div
 className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-3"
 key={access.id}
 >
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-medium">{access.fullName}</p>
 <p className="text-xs text-muted-foreground">
 {access.email ?? "E-mail não informado"}
 </p>
 </div>
 <InternalStatusChip
 label={userRoleLabels[access.role]}
 tone={access.role === "admin" ? "warning" : "neutral"}
 />
 </div>
 <p className="text-xs text-muted-foreground">
 {access.isPrimary ? "Acesso principal" : "Acesso complementar"} • criado em{" "}
 {formatDateBR(access.createdAt)}
 </p>
 </div>
 ))
 )}
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Calendário interno</CardTitle>
 <CardDescription>
 Agenda operacional para admin, financeiro, vendas/estoque e eventos compartilhados.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <AdminCalendarEventForm />

 <div className="space-y-2 border-t border-border/70 pt-4">
 {controlCenter.calendarEvents.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum evento futuro cadastrado.
 </p>
 ) : (
 controlCenter.calendarEvents.map((event) => (
 <div
 className="rounded-xl border border-border/70 bg-card/40 p-3"
 key={event.id}
 >
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-medium">{event.title}</p>
 <p className="text-xs text-muted-foreground">
 {formatDateBR(event.startsAt)}
 {event.endsAt ? ` ate ${formatDateBR(event.endsAt)}` : ""}
 </p>
 </div>
 <InternalStatusChip
 label={
 event.responsibleRole
 ? userRoleLabels[event.responsibleRole]
 : "Sem papel fixo"
 }
 />
 </div>
 {event.description ? (
 <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
 ) : null}
 </div>
 ))
 )}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Modo manutenção</CardTitle>
 <CardDescription>
 Controle central para janelas técnicas e bloqueio parcial do site.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="rounded-xl border border-border/70 bg-card/40 p-4">
 <p className="text-sm font-medium">
 Estado atual:{" "}
 {controlCenter.maintenanceMode.enabled ? "Ativo" : "Desativado"}
 </p>
 <p className="mt-2 text-sm text-muted-foreground">
 Liberado para:{" "}
 {controlCenter.maintenanceMode.allowRoles
 .map((role) => userRoleLabels[role])
 .join(", ")}
 </p>
 <p className="text-sm text-muted-foreground">
 Ultima atualizacao:{" "}
 {controlCenter.maintenanceMode.updatedAt
 ? formatDateBR(controlCenter.maintenanceMode.updatedAt)
 : "Não registrada"}
 </p>
 </div>

 <AdminMaintenanceModeForm initialValues={controlCenter.maintenanceMode} />
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Configurações gerais da marca</CardTitle>
 <CardDescription>
 Somente admin altera nome da empresa, WhatsApp, e-mail, endereço, horário,
 redes sociais e CNPJ.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <AdminBrandSettingsForm initialValues={controlCenter.brandSettings} />
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Modo visual e modo técnico</CardTitle>
 <CardDescription>
 O modo técnico exige senha, gera backup antes da publicação, mantem rascunho
 privado por admin e permite restaurar a ultima versão publicada.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 <div className="rounded-xl border border-border/70 bg-card/40 p-4 text-sm text-muted-foreground">
 <p>
 Rascunho atual visivel para:{" "}
 {controlCenter.technicalDraftOwnerName ?? "Nenhum responsável no momento"}.
 </p>
 </div>
 <AdminTechnicalModeForm
 draftOwnerName={controlCenter.technicalDraftOwnerName}
 draftPayload={controlCenter.brandSettings.technicalDraftPayload}
 isCurrentUserDraftOwner={controlCenter.isCurrentUserDraftOwner}
 publishedPayload={controlCenter.brandSettings.technicalPublishedPayload}
 />
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Histórico de alterações importantes</CardTitle>
 </CardHeader>
 <CardContent>
 {controlCenter.recentAudit.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhuma alteração importante registrada até o momento.
 </p>
 ) : (
 <div className="grid gap-3 md:grid-cols-2">
 {controlCenter.recentAudit.map((item) => (
 <div
 className="rounded-xl border border-border/70 bg-card/40 p-4"
 key={item.id}
 >
 <p className="text-sm font-medium">{item.summary}</p>
 <p className="mt-2 text-xs text-muted-foreground">
 {item.actorName ?? "Sistema"}
 {item.actorRole ? ` • ${userRoleLabels[item.actorRole]}` : ""}
 </p>
 <p className="text-xs text-muted-foreground">
 Origem: {item.entityTable}
 {item.entityId ? ` • ${item.entityId}` : ""}
 </p>
 <p className="text-xs text-muted-foreground">
 {formatDateBR(item.createdAt)}
 </p>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
