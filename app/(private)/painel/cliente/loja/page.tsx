import Link from "next/link";
import { MapPinned, ReceiptText, ShoppingBag, Star } from "lucide-react";
import { ClientReviewForm } from "@/components/client-area/client-review-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { ROUTES } from "@/lib/constants/routes";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { getClientDashboardData } from "@/services/client-area/get-client-dashboard-data";

function formatDateBR(value: string): string {
 return new Intl.DateTimeFormat("pt-BR", {
 dateStyle: "short"
 }).format(new Date(value));
}

export default async function ClientStoreAreaPage() {
 const { userId } = await requireRole(["client", "admin"]);
 const data = await getClientDashboardData(userId);

 const reviewedStoreOrderIds = new Set(
 data.reviews
 .filter((review) => review.targetType === "store_order" && review.targetPublicId)
 .map((review) => review.targetPublicId as string)
 );

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Área da cliente</p>
 <h1 className="text-4xl">Loja online</h1>
 <p className="text-muted-foreground">
 Rastreie pedidos, consulte histórico de compras e registre avaliações da experiência.
 </p>
 <div className="flex flex-wrap gap-2 pt-2">
 <Link className={cn(buttonVariants({ variant: "outline" }))} href={ROUTES.private.clientStoreCart}>
 Carrinho e checkout
 </Link>
 <Link className={cn(buttonVariants({ variant: "ghost" }))} href={ROUTES.public.shop}>
 Ir para vitrine publica
 </Link>
 </div>
 </header>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <ShoppingBag className="h-5 w-5 text-gold-400" />
 Pedidos da loja em andamento
 </CardTitle>
 <CardDescription>Dados de compra, pagamento e status de separação/envio.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.storeOrdersInProgress.map((storeOrder) => (
 <div className="space-y-3 rounded-lg border border-border/70 bg-card/40 p-4" key={storeOrder.publicId}>
 <div className="grid gap-3 md:grid-cols-4">
 <div>
 <p className="text-xs text-muted-foreground">Pedido</p>
 <p className="font-semibold text-gold-400">{storeOrder.orderNumber}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Status</p>
 <p className="font-medium">{storeOrder.statusLabel}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Pagamento</p>
 <p className="font-medium">{storeOrder.paymentStatus}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Total</p>
 <p className="font-medium">{formatCurrencyBRL(storeOrder.totalAmount)}</p>
 </div>
 </div>

 <div className="space-y-2">
 <p className="text-sm font-medium">Itens</p>
 <div className="grid gap-2">
 {storeOrder.items.map((item) => (
 <div className="rounded-md border border-border/70 bg-card/60 p-2 text-sm" key={item.id}>
 <p className="font-medium">{item.productName}</p>
 <p className="text-xs text-muted-foreground">
 {item.variantDescription ?? "Sem variação"} | Qtd: {item.quantity} | Unit:
 {" "}
 {formatCurrencyBRL(item.unitPrice)}
 </p>
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-md border border-border/70 bg-card/60 p-3 text-sm">
 <p className="font-medium">Rastreio</p>
 <p className="text-xs text-muted-foreground">
 Codigo: {storeOrder.trackingCode ?? "Aguardando codigo"}
 </p>
 {storeOrder.trackingLink ? (
 <a
 className="text-xs text-gold-400 hover:underline"
 href={storeOrder.trackingLink}
 rel="noopener noreferrer"
 target="_blank"
 >
 Abrir link de rastreio
 </a>
 ) : (
 <p className="text-xs text-muted-foreground">
 Link será exibido quando o envio for liberado.
 </p>
 )}
 </div>
 </div>
 ))}

 {data.storeOrdersInProgress.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido da loja em andamento.</p>
 ) : null}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <ReceiptText className="h-5 w-5 text-gold-400" />
 Histórico de compras
 </CardTitle>
 <CardDescription>Compras anteriores com dados do pedido e avaliação.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.storeOrdersHistory.map((storeOrder) => (
 <div className="rounded-lg border border-border/70 bg-card/40 p-4" key={storeOrder.publicId}>
 <p className="font-medium">
 {storeOrder.orderNumber} - {storeOrder.statusLabel}
 </p>
 <p className="text-xs text-muted-foreground">
 Criado em {formatDateBR(storeOrder.createdAt)} | Total {formatCurrencyBRL(storeOrder.totalAmount)}
 </p>
 {storeOrder.deliveredAt ? (
 <p className="text-xs text-muted-foreground">Entregue em {formatDateBR(storeOrder.deliveredAt)}</p>
 ) : null}

 {!reviewedStoreOrderIds.has(storeOrder.publicId) ? (
 <div className="mt-3">
 <ClientReviewForm compact orderPublicId={storeOrder.publicId} targetType="store_order" />
 </div>
 ) : (
 <p className="mt-2 text-xs text-green-500">Compra já avaliada.</p>
 )}
 </div>
 ))}

 {data.storeOrdersHistory.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem histórico de compras na loja.</p>
 ) : null}
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <MapPinned className="h-5 w-5 text-gold-400" />
 Rastreios
 </CardTitle>
 <CardDescription>
 Acompanhe codigos e links de envio atualizados em tempo real.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 {[...data.storeOrdersInProgress, ...data.storeOrdersHistory]
 .filter((storeOrder) => storeOrder.trackingCode || storeOrder.trackingLink)
 .slice(0, 8)
 .map((storeOrder) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm" key={`tracking-${storeOrder.publicId}`}>
 <p className="font-medium">{storeOrder.orderNumber}</p>
 <p className="text-xs text-muted-foreground">Codigo: {storeOrder.trackingCode ?? "-"}</p>
 {storeOrder.trackingLink ? (
 <a
 className="text-xs text-gold-400 hover:underline"
 href={storeOrder.trackingLink}
 rel="noopener noreferrer"
 target="_blank"
 >
 Abrir link
 </a>
 ) : null}
 </div>
 ))}

 {[...data.storeOrdersInProgress, ...data.storeOrdersHistory].filter(
 (storeOrder) => storeOrder.trackingCode || storeOrder.trackingLink
 ).length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum rastreio disponível.</p>
 ) : null}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Star className="h-5 w-5 text-gold-400" />
 Avaliações da loja
 </CardTitle>
 <CardDescription>
 Comentarios e notas registradas para pedidos da loja online.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 {data.reviews
 .filter((review) => review.targetType === "store_order")
 .slice(0, 8)
 .map((review) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm" key={review.id}>
 <p className="font-medium">
 {review.orderReference} - Nota {review.rating}/5
 </p>
 {review.headline ? <p>{review.headline}</p> : null}
 <p className="text-xs text-muted-foreground">{review.comment}</p>
 </div>
 ))}

 {data.reviews.filter((review) => review.targetType === "store_order").length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem avaliações da loja até o momento.</p>
 ) : null}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
