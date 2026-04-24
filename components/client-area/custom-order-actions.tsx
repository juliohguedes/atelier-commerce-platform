"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Package, Wallet } from "lucide-react";
import { approveCustomOrderQuoteAction } from "@/actions/client/approve-custom-order-quote-action";
import { confirmCustomOrderPaymentAction } from "@/actions/client/confirm-custom-order-payment-action";
import { setCustomOrderDeliveryModeAction } from "@/actions/client/set-custom-order-delivery-mode-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { ClientDeliveryMode, ClientPaymentMethod, ClientPaymentStatus } from "@/types";

interface CustomOrderActionsProps {
 orderPublicId: string;
 protocolCode: string;
 finalAmount: number | null;
 quoteSummary: string | null;
 isQuoteAvailable: boolean;
 isQuoteApproved: boolean;
 paymentStatus: ClientPaymentStatus | null;
 selectedPaymentMethod: ClientPaymentMethod | null;
 deliveryMode: ClientDeliveryMode | null;
}

export function CustomOrderActions({
 orderPublicId,
 protocolCode,
 finalAmount,
 quoteSummary,
 isQuoteAvailable,
 isQuoteApproved,
 paymentStatus,
 selectedPaymentMethod,
 deliveryMode
}: CustomOrderActionsProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );
 const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>(
 selectedPaymentMethod ?? "pix"
 );
 const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
 const [deliveryModeValue, setDeliveryModeValue] = useState<ClientDeliveryMode>(
 deliveryMode ?? "entrega"
 );

 const paymentApproved = paymentStatus === "approved";

 const paymentStatusLabel = useMemo(() => {
 switch (paymentStatus) {
 case "awaiting_payment":
 return "Aguardando pagamento";
 case "approved":
 return "Pagamento aprovado";
 case "failed":
 return "Pagamento com falha";
 case "cancelled":
 return "Pagamento cancelado";
 case "refunded":
 return "Pagamento estornado";
 case "pending":
 default:
 return "Pagamento pendente";
 }
 }, [paymentStatus]);

 function handleApproveQuote() {
 startTransition(async () => {
 setFeedback(null);
 const result = await approveCustomOrderQuoteAction({
 orderPublicId
 });

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });
 });
 }

 function handleConfirmPayment() {
 startTransition(async () => {
 setFeedback(null);
 const result = await confirmCustomOrderPaymentAction({
 orderPublicId,
 paymentMethod,
 confirmationAccepted: true
 });

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });

 if (result.success) {
 setShowPaymentConfirmation(false);
 }
 });
 }

 function handleSaveDeliveryMode() {
 startTransition(async () => {
 setFeedback(null);
 const result = await setCustomOrderDeliveryModeAction({
 orderPublicId,
 deliveryMode: deliveryModeValue
 });

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });
 });
 }

 return (
 <div className="space-y-4">
 {isQuoteAvailable ? (
 <Card className="border-gold-500/40 bg-card/60">
 <CardContent className="space-y-4 p-4">
 <div className="space-y-1">
 <p className="text-sm font-medium">Orçamento final</p>
 <p className="text-xs text-muted-foreground">Protocolo {protocolCode}</p>
 <p className="text-lg font-semibold text-gold-400">
 {finalAmount !== null ? formatCurrencyBRL(finalAmount) : "Valor a definir"}
 </p>
 {quoteSummary ? (
 <p className="text-sm text-muted-foreground">{quoteSummary}</p>
 ) : null}
 </div>

 {!isQuoteApproved ? (
 <Button disabled={isPending} onClick={handleApproveQuote} type="button">
 {isPending ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Processando...
 </>
 ) : (
 <>
 <CheckCircle2 className="mr-2 h-4 w-4" />
 Aprovar orçamento final
 </>
 )}
 </Button>
 ) : !paymentApproved ? (
 <div className="space-y-3 rounded-lg border border-border/70 bg-card/40 p-3">
 <p className="text-sm font-medium">Pagamento</p>
 <p className="text-xs text-muted-foreground">Status atual: {paymentStatusLabel}</p>
 <div className="space-y-2">
 <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
 Metodo
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 onChange={(event) => setPaymentMethod(event.target.value as ClientPaymentMethod)}
 value={paymentMethod}
 >
 <option value="pix">PIX</option>
 <option value="cartao">Cartao</option>
 </select>
 </div>
 <Button
 disabled={isPending}
 onClick={() => setShowPaymentConfirmation(true)}
 type="button"
 variant="outline"
 >
 <Wallet className="mr-2 h-4 w-4" />
 Revisar confirmação de pagamento
 </Button>

 {showPaymentConfirmation ? (
 <div className="space-y-3 rounded-md border border-gold-500/45 bg-gold-500/10 p-3 text-sm">
 <p className="font-medium text-gold-400">Confirmação antes de pagar</p>
 <p>
 Valor final: <strong>{finalAmount !== null ? formatCurrencyBRL(finalAmount) : "-"}</strong>
 </p>
 <p>Resumo: {quoteSummary ?? "Pedido sob medida personalizado."}</p>
 <p className="text-xs text-muted-foreground">
 Após a confirmação do pagamento, o pedido entra em produção.
 </p>
 <div className="flex flex-wrap gap-2">
 <Button disabled={isPending} onClick={handleConfirmPayment} type="button">
 {isPending ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Confirmando...
 </>
 ) : (
 "Confirmar pagamento"
 )}
 </Button>
 <Button
 onClick={() => setShowPaymentConfirmation(false)}
 type="button"
 variant="ghost"
 >
 Voltar
 </Button>
 </div>
 </div>
 ) : null}
 </div>
 ) : (
 <div className="rounded-md border border-green-500/35 bg-green-500/10 p-3 text-sm text-green-500">
 Pagamento aprovado. Pedido em produção.
 </div>
 )}
 </CardContent>
 </Card>
 ) : (
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm text-muted-foreground">
 Orçamento final ainda não disponível.
 </div>
 )}

 <Card className="border-border/70 bg-card/60">
 <CardContent className="space-y-3 p-4">
 <p className="text-sm font-medium">Entrega ou retirada</p>
 <p className="text-xs text-muted-foreground">
 A escolha fica registrada no pedido e dispara os avisos da plataforma, e-mail e WhatsApp.
 </p>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 onChange={(event) => setDeliveryModeValue(event.target.value as ClientDeliveryMode)}
 value={deliveryModeValue}
 >
 <option value="entrega">Entrega</option>
 <option value="retirada">Retirada</option>
 </select>
 <Button disabled={isPending} onClick={handleSaveDeliveryMode} type="button" variant="outline">
 {isPending ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Salvando...
 </>
 ) : (
 <>
 <Package className="mr-2 h-4 w-4" />
 Salvar preferência
 </>
 )}
 </Button>
 </CardContent>
 </Card>

 {feedback ? (
 <div
 className={cn(
 "rounded-md border px-3 py-2 text-sm",
 feedback.type === "success"
 ? "border-green-500/40 bg-green-500/10 text-green-500"
 : "border-destructive/40 bg-destructive/10 text-destructive"
 )}
 >
 {feedback.message}
 </div>
 ) : null}
 </div>
 );
}
