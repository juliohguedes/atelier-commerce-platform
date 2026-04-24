import Image from "next/image";
import { CalendarClock, FileText, Scissors, Truck } from "lucide-react";
import { ClientAppointmentForm } from "@/components/client-area/client-appointment-form";
import { ClientReviewForm } from "@/components/client-area/client-review-form";
import { CustomOrderActions } from "@/components/client-area/custom-order-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { formatCurrencyBRL } from "@/lib/utils";
import { getPublicBrandSettings } from "@/services/brand/get-public-brand-settings";
import { getClientDashboardData } from "@/services/client-area/get-client-dashboard-data";
import { getSiteAuxiliaryContent } from "@/services/content/get-site-auxiliary-content";

function formatDateTimeBR(value: string): string {
 return new Intl.DateTimeFormat("pt-BR", {
 dateStyle: "short",
 timeStyle: "short"
 }).format(new Date(value));
}

function formatDateBR(value: string): string {
 return new Intl.DateTimeFormat("pt-BR", {
 dateStyle: "short"
 }).format(new Date(value));
}

export default async function ClientTailoredAreaPage() {
 const { userId } = await requireRole(["client", "admin"]);
 const [data, brandSettings, auxiliaryContent] = await Promise.all([
 getClientDashboardData(userId),
 getPublicBrandSettings(),
 getSiteAuxiliaryContent()
 ]);

 const reviewedOrderIds = new Set(
 data.reviews
 .filter((review) => review.targetType === "custom_order" && review.targetPublicId)
 .map((review) => review.targetPublicId as string)
 );

 return (
 <div className="space-y-6">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Área da cliente</p>
 <h1 className="text-4xl">Pedidos sob medida</h1>
 <p className="text-muted-foreground">
 Acompanhe pedidos em andamento, histórico, modelos enviados, orçamento final e evolução
 de produção/entrega.
 </p>
 </header>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Scissors className="h-5 w-5 text-gold-400" />
 Pedidos em andamento
 </CardTitle>
 <CardDescription>
 Fluxo principal: orçamento final disponível, pagamento aprovado, em produção, pronto
 para envio, enviado e entregue.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-5">
 {data.customOrdersInProgress.map((order) => (
 <article className="space-y-4 rounded-xl border border-border/70 bg-card/40 p-4" key={order.publicId}>
 <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
 <div>
 <p className="text-xs text-muted-foreground">Protocolo</p>
 <p className="font-semibold text-gold-400">{order.protocolCode}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Status</p>
 <p className="font-medium">{order.workflowStatusLabel}</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Resumo</p>
 <p className="font-medium">
 {order.pieceTypeLabel} - {order.productionModeLabel}
 </p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground">Estimativa inicial</p>
 <p className="font-medium">{formatCurrencyBRL(order.estimatedPrice)}</p>
 </div>
 </div>

 <div className="space-y-2">
 <p className="text-sm font-medium">Modelos enviados pela equipe</p>
 {order.designOptions.length > 0 ? (
 <div className="grid gap-3 lg:grid-cols-3">
 {order.designOptions.slice(0, 6).map((designOption) => (
 <div className="rounded-lg border border-border/70 bg-card/60 p-3" key={designOption.id}>
 <p className="text-sm font-semibold">
 {designOption.optionCode} - {designOption.title}
 </p>
 {designOption.previewImageUrl ? (
 <Image
 alt={designOption.title}
 className="mt-2 h-36 w-full rounded-md object-cover"
 height={144}
 src={designOption.previewImageUrl}
 unoptimized
 width={360}
 />
 ) : null}
 {designOption.referencePdfUrl ? (
 <a
 className="mt-2 inline-flex text-xs text-gold-400 hover:underline"
 href={designOption.referencePdfUrl}
 rel="noopener noreferrer"
 target="_blank"
 >
 Abrir PDF da opção
 </a>
 ) : null}
 {designOption.teamNote ? (
 <p className="mt-2 text-xs text-muted-foreground">{designOption.teamNote}</p>
 ) : null}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">
 Aguardando envio de 3 ou mais opções desenhadas pela equipe.
 </p>
 )}
 </div>

 <div className="space-y-2">
 <p className="text-sm font-medium">Modelos e anexos do pedido</p>
 {order.attachments.length > 0 ? (
 <div className="grid gap-2 md:grid-cols-2">
 {order.attachments.map((attachment) => (
 <div className="rounded-md border border-border/70 bg-card/50 p-2 text-xs" key={attachment.id}>
 <p className="font-medium">{attachment.fileName}</p>
 <p className="text-muted-foreground">{attachment.mimeType}</p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">Sem anexos vinculados.</p>
 )}
 </div>

 <CustomOrderActions
 deliveryMode={order.fulfillment?.deliveryMode ?? null}
 finalAmount={order.finalQuote?.finalAmount ?? null}
 isQuoteApproved={Boolean(order.finalQuote?.approvedByClientAt)}
 isQuoteAvailable={Boolean(order.finalQuote)}
 orderPublicId={order.publicId}
 paymentStatus={order.finalQuote?.paymentStatus ?? null}
 protocolCode={order.protocolCode}
 quoteSummary={order.finalQuote?.quoteSummary ?? null}
 selectedPaymentMethod={order.finalQuote?.paymentMethod ?? null}
 />

 {order.finalQuote?.paymentStatus === "approved" ? (
 <div className="space-y-2 rounded-lg border border-border/70 bg-card/50 p-3 text-sm">
 <p className="font-medium">Produção e entrega</p>
 <p>
 Em processo: {order.finalQuote.productionStartedAt ? "Sim" : "Aguardando início"}
 </p>
 <p>
 Pronto para envio: {order.finalQuote.readyToShipAt ? formatDateBR(order.finalQuote.readyToShipAt) : "Não"}
 </p>
 <p>Enviado: {order.finalQuote.shippedAt ? formatDateBR(order.finalQuote.shippedAt) : "Não"}</p>
 <p>Entregue: {order.finalQuote.deliveredAt ? formatDateBR(order.finalQuote.deliveredAt) : "Não"}</p>
 <p>
 Rastreio: {order.fulfillment?.trackingCode ?? "Aguardando codigo"}
 {order.fulfillment?.trackingLink ? (
 <a
 className="ml-2 text-gold-400 hover:underline"
 href={order.fulfillment.trackingLink}
 rel="noopener noreferrer"
 target="_blank"
 >
 abrir link
 </a>
 ) : null}
 </p>
 </div>
 ) : null}
 </article>
 ))}

 {data.customOrdersInProgress.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum pedido sob medida em andamento.</p>
 ) : null}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <CalendarClock className="h-5 w-5 text-gold-400" />
 Atendimento presencial ou online
 </CardTitle>
 <CardDescription>
 Agende tirar medidas, alinhamento do pedido ou retirada. Se presencial, o endereço da
 loja será enviado na confirmação.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm">
 <p className="font-medium">Endereço para atendimento presencial</p>
 <p className="text-xs text-muted-foreground">{brandSettings.addressText}</p>
 <p className="mt-2 text-xs text-muted-foreground">{brandSettings.businessHours}</p>
 </div>

 <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40 p-2">
 <iframe
 className="h-[280px] w-full rounded-lg"
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 src={auxiliaryContent.locationInfo.mapEmbedUrl}
 title="Mapa para agendamento presencial"
 />
 </div>

 <ClientAppointmentForm
 customOrderOptions={data.customOrdersInProgress.map((order) => ({
 publicId: order.publicId,
 label: `${order.protocolCode} - ${order.pieceTypeLabel}`
 }))}
 />

 <div className="space-y-2">
 <p className="text-sm font-medium">Agendamentos solicitados</p>
 {data.appointments.length > 0 ? (
 <div className="grid gap-2">
 {data.appointments.slice(0, 8).map((appointment) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm" key={appointment.id}>
 <p className="font-medium">
 {appointment.appointmentType} - {appointment.attendanceMode}
 </p>
 <p className="text-xs text-muted-foreground">
 {formatDateTimeBR(appointment.scheduledFor)} | Status: {appointment.status}
 </p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">Sem agendamentos no momento.</p>
 )}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <FileText className="h-5 w-5 text-gold-400" />
 Histórico e avaliações
 </CardTitle>
 <CardDescription>
 Avalie seus pedidos finalizados de sob medida diretamente na plataforma.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {data.customOrdersHistory.map((order) => (
 <div className="rounded-lg border border-border/70 bg-card/40 p-4" key={order.publicId}>
 <p className="font-medium">
 {order.protocolCode} - {order.pieceTypeLabel}
 </p>
 <p className="text-xs text-muted-foreground">Encerrado em {formatDateBR(order.createdAt)}</p>
 <p className="text-xs text-muted-foreground">Status final: {order.workflowStatusLabel}</p>

 {!reviewedOrderIds.has(order.publicId) ? (
 <div className="mt-3">
 <ClientReviewForm orderPublicId={order.publicId} targetType="custom_order" />
 </div>
 ) : (
 <p className="mt-2 text-xs text-green-500">Pedido já avaliado.</p>
 )}
 </div>
 ))}

 {data.customOrdersHistory.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem histórico de pedidos sob medida.</p>
 ) : null}

 {data.reviews.filter((review) => review.targetType === "custom_order").length > 0 ? (
 <div className="space-y-2 rounded-lg border border-border/70 bg-card/40 p-4">
 <p className="text-sm font-medium">Avaliações registradas (sob medida)</p>
 {data.reviews
 .filter((review) => review.targetType === "custom_order")
 .slice(0, 6)
 .map((review) => (
 <div className="rounded-md border border-border/70 bg-card/60 p-2 text-sm" key={review.id}>
 <p className="font-medium">
 {review.orderReference} - Nota {review.rating}/5
 </p>
 {review.headline ? <p>{review.headline}</p> : null}
 <p className="text-xs text-muted-foreground">{review.comment}</p>
 </div>
 ))}
 </div>
 ) : null}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <Truck className="h-5 w-5 text-gold-400" />
 Notificações críticas do pedido
 </CardTitle>
 <CardDescription>
 Orçamento final disponível, pagamento aprovado, em produção, pronto para envio, enviado
 e entregue.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-2">
 {data.notifications.map((notification) => (
 <div className="rounded-md border border-border/70 bg-card/40 p-3" key={notification.id}>
 <p className="text-sm font-medium">{notification.title}</p>
 <p className="text-xs text-muted-foreground">{notification.body}</p>
 <p className="text-[11px] uppercase tracking-wide text-gold-400">
 Canal: {notification.channel}
 </p>
 </div>
 ))}

 {data.notifications.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem notificações no momento.</p>
 ) : null}
 </CardContent>
 </Card>
 </div>
 );
}
