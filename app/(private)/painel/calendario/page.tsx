import { AdminCalendarEventForm } from "@/components/internal/admin-calendar-event-form";
import { InternalStatusChip } from "@/components/internal/internal-status-chip";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { internalCalendarTypeLabels } from "@/lib/constants/management";
import { getInternalCalendarData } from "@/services/internal/get-internal-calendar-data";
import type { InternalCalendarEntryType } from "@/types/management";

function formatDateLabel(value: string): string {
 return new Intl.DateTimeFormat("pt-BR", {
 dateStyle: "full"
 }).format(new Date(value));
}

function formatDateTimeLabel(value: string): string {
 return new Intl.DateTimeFormat("pt-BR", {
 dateStyle: "short",
 timeStyle: "short"
 }).format(new Date(value));
}

function getTypeTone(
 type: InternalCalendarEntryType
): "neutral" | "warning" | "success" {
 if (["pedido_em_producao", "retirada"].includes(type)) {
 return "warning";
 }

 if (type === "entrega_prevista") {
 return "success";
 }

 return "neutral";
}

export default async function InternalCalendarPage() {
 const { role } = await requireRole(["admin", "finance", "sales_stock"]);
 const data = await getInternalCalendarData();

 const groupedEntries = Object.entries(
 data.entries.reduce<Record<string, typeof data.entries>>((groups, entry) => {
 const key = entry.scheduledAt.slice(0, 10);
 groups[key] = [...(groups[key] ?? []), entry];
 return groups;
 }, {})
 );

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Gestão interna</p>
 <h1 className="text-4xl">Calendário interno</h1>
 <p className="max-w-3xl text-sm text-muted-foreground">
 Agenda unificada para agendamentos presenciais, retiradas, pedidos em produção e entregas previstas.
 </p>
 </header>

 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Agendamentos presenciais
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.metrics.appointments}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Retiradas
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.metrics.pickups}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Pedidos em produção
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.metrics.productionOrders}
 </p>
 </CardContent>
 </Card>
 <Card className="border-border/70 bg-card/60">
 <CardContent className="p-5">
 <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
 Entregas previstas
 </p>
 <p className="mt-2 text-3xl font-semibold text-gold-400">
 {data.metrics.projectedDeliveries}
 </p>
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Agenda consolidada</CardTitle>
 <CardDescription>
 Lista cronologica para acompanhar operação de showroom, produção e entregas.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-5">
 {groupedEntries.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Nenhum evento interno registrado no momento.
 </p>
 ) : (
 groupedEntries.map(([dateKey, entries]) => (
 <section className="space-y-3" key={dateKey}>
 <div className="border-b border-border/70 pb-2">
 <p className="text-sm font-medium">{formatDateLabel(dateKey)}</p>
 </div>

 <div className="space-y-3">
 {entries.map((entry) => (
 <div
 className="rounded-xl border border-border/70 bg-card/40 p-4"
 key={entry.id}
 >
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-sm font-medium">{entry.title}</p>
 <p className="text-xs text-muted-foreground">
 {formatDateTimeLabel(entry.scheduledAt)}
 </p>
 </div>
 <InternalStatusChip
 label={internalCalendarTypeLabels[entry.type]}
 tone={getTypeTone(entry.type)}
 />
 </div>

 <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
 <p>Setor: {entry.sectorLabel}</p>
 <p>Status: {entry.statusLabel ?? "Sem status"}</p>
 <p>Pedido: {entry.orderReference ?? "Não vinculado"}</p>
 <p>Cliente: {entry.clientName ?? "Não aplicavel"}</p>
 <p className="md:col-span-2">
 Local: {entry.locationLabel ?? "Sem local definido"}
 </p>
 </div>

 {entry.description ? (
 <p className="mt-3 text-sm text-muted-foreground">
 {entry.description}
 </p>
 ) : null}
 </div>
 ))}
 </div>
 </section>
 ))
 )}
 </CardContent>
 </Card>

 <div className="space-y-4">
 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Legenda operacional</CardTitle>
 <CardDescription>
 Os tipos abaixo representam os eventos que alimentam o calendário.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 {Object.entries(internalCalendarTypeLabels).map(([value, label]) => (
 <div
 className="flex items-center justify-between rounded-xl border border-border/70 bg-card/40 p-3"
 key={value}
 >
 <p className="text-sm">{label}</p>
 <InternalStatusChip
 label={label}
 tone={getTypeTone(value as InternalCalendarEntryType)}
 />
 </div>
 ))}
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="pb-3">
 <CardTitle className="text-lg">Gestão de eventos</CardTitle>
 <CardDescription>
 {role === "admin"
 ? "Admin pode incluir eventos compartilhados para toda a operação."
 : "Somente admin cria eventos manuais. Financeiro e vendas acompanham a agenda consolidada."}
 </CardDescription>
 </CardHeader>
 <CardContent>
 {role === "admin" ? (
 <AdminCalendarEventForm />
 ) : (
 <p className="text-sm text-muted-foreground">
 A visualização desta agenda já inclui eventos internos cadastrados pelo admin e itens operacionais derivados dos pedidos.
 </p>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
