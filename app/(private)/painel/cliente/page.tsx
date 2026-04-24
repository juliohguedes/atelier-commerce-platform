import Link from "next/link";
import { Bell, Boxes, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { ROUTES } from "@/lib/constants/routes";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { getClientDashboardData } from "@/services/client-area/get-client-dashboard-data";

export default async function ClientDashboardPage() {
 const { userId } = await requireRole(["client", "admin"]);
 const data = await getClientDashboardData(userId);

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Área da cliente</p>
 <h1 className="text-4xl">Dashboard da cliente</h1>
 <p className="text-muted-foreground">
 Um único login para pedidos sob medida e compras da loja, com separação clara das
 jornadas.
 </p>
 </header>

 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Sob medida em andamento</CardTitle>
 </CardHeader>
 <CardContent className="text-3xl font-semibold text-gold-400">
 {data.metrics.customOrdersInProgress}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Histórico sob medida</CardTitle>
 </CardHeader>
 <CardContent className="text-3xl font-semibold text-gold-400">
 {data.metrics.customOrdersHistory}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Pedidos da loja ativos</CardTitle>
 </CardHeader>
 <CardContent className="text-3xl font-semibold text-gold-400">
 {data.metrics.storeOrdersInProgress}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Notificações pendentes</CardTitle>
 </CardHeader>
 <CardContent className="text-3xl font-semibold text-gold-400">
 {data.metrics.notificationsPending}
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Package className="h-5 w-5 text-gold-400" />
 1. Área de pedidos sob medida
 </CardTitle>
 <CardDescription>
 Acompanhe análise, modelos enviados, orçamento final, pagamento e produção.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {data.customOrdersInProgress.slice(0, 3).map((order) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3" key={order.publicId}>
 <p className="text-sm font-medium">
 {order.protocolCode} - {order.pieceTypeLabel}
 </p>
 <p className="text-xs text-muted-foreground">Status: {order.workflowStatusLabel}</p>
 <p className="text-xs text-muted-foreground">
 Estimativa inicial: {formatCurrencyBRL(order.estimatedPrice)}
 </p>
 </div>
 ))}

 {data.customOrdersInProgress.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido sob medida em andamento.</p>
 ) : null}

 <Link className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")} href={ROUTES.private.clientTailored}>
 Ir para área sob medida
 </Link>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <ShoppingBag className="h-5 w-5 text-gold-400" />
 2. Área da loja online
 </CardTitle>
 <CardDescription>
 Consulte dados de compra, rastreio, histórico de pedidos e avaliações.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {data.storeOrdersInProgress.slice(0, 3).map((storeOrder) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3" key={storeOrder.publicId}>
 <p className="text-sm font-medium">{storeOrder.orderNumber}</p>
 <p className="text-xs text-muted-foreground">Status: {storeOrder.statusLabel}</p>
 <p className="text-xs text-muted-foreground">
 Total: {formatCurrencyBRL(storeOrder.totalAmount)}
 </p>
 </div>
 ))}

 {data.storeOrdersInProgress.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido da loja em andamento.</p>
 ) : null}

 <Link className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")} href={ROUTES.private.clientStore}>
 Ir para área da loja
 </Link>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Bell className="h-5 w-5 text-gold-400" />
 Notificações recentes
 </CardTitle>
 <CardDescription>
 Eventos de orçamento final, pagamento aprovado, produção, envio e entrega.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 {data.notifications.slice(0, 6).map((notification) => (
 <div className="rounded-md border border-border/70 bg-card/30 p-3" key={notification.id}>
 <p className="text-sm font-medium">{notification.title}</p>
 <p className="text-xs text-muted-foreground">{notification.body}</p>
 <p className="mt-1 text-[11px] uppercase tracking-wide text-gold-400">
 Canal: {notification.channel}
 </p>
 </div>
 ))}

 {data.notifications.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem notificações no momento.</p>
 ) : null}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Boxes className="h-5 w-5 text-gold-400" />
 Ações da cliente
 </CardTitle>
 <CardDescription>
 Edite dados, gerencie endereços e acompanhe solicitações da sua conta.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <Link className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")} href={ROUTES.private.clientAccount}>
 Abrir minha conta
 </Link>
 </CardContent>
 </Card>
 </div>
 );
}
