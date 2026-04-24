"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateFinanceOrderAction } from "@/actions/finance/update-finance-order-action";
import { paymentStatusOptions } from "@/lib/constants/internal-panels";
import { financeUpdateOrderSchema } from "@/lib/validations/internal-panels";
import type { FinanceOrderDetail } from "@/types/internal-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FinanceFormValues {
 unlockPassword: string;
 notifyChannel: "in_app" | "email" | "whatsapp";
 operationSummary: string;
 finalAmount: string;
 quoteSummary: string;
 paymentStatus: string;
 paymentMethod: string;
 paymentReference: string;
 shippingCost: string;
 trackingCode: string;
 trackingLink: string;
 invoiceUrl: string;
 invoicePayloadNote: string;
}

interface FinanceOrderUpdateFormProps {
 order: FinanceOrderDetail;
}

function toOptionalString(value: string): string | undefined {
 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalNumber(value: string): number | undefined {
 const trimmed = value.trim();
 if (trimmed.length === 0) {
 return undefined;
 }

 const parsed = Number(trimmed);
 return Number.isFinite(parsed) ? parsed : undefined;
}

export function FinanceOrderUpdateForm({ order }: FinanceOrderUpdateFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const defaultValues = useMemo<FinanceFormValues>(
 () => ({
 unlockPassword: "",
 notifyChannel: "in_app",
 operationSummary: "",
 finalAmount: order.type === "custom_order" && order.totalAmount > 0 ? String(order.totalAmount) : "",
 quoteSummary: order.quoteSummary ?? "",
 paymentStatus: order.paymentStatus,
 paymentMethod:
 order.paymentMethod === "pix" || order.paymentMethod === "cartao"
 ? order.paymentMethod
 : "",
 paymentReference: order.paymentReference ?? "",
 shippingCost: order.type === "store_order" ? String(order.shippingCost) : "",
 trackingCode: order.trackingCode ?? "",
 trackingLink: order.trackingLink ?? "",
 invoiceUrl: order.invoiceUrl ?? "",
 invoicePayloadNote: ""
 }),
 [order]
 );

 const {
 register,
 handleSubmit
 } = useForm<FinanceFormValues>({
 defaultValues
 });

 function onSubmit(values: FinanceFormValues) {
 setFeedback(null);

 const candidate = {
 orderType: order.type,
 orderPublicId: order.publicId,
 unlockPassword: values.unlockPassword,
 notifyChannel: values.notifyChannel,
 finalAmount: toOptionalNumber(values.finalAmount),
 quoteSummary: toOptionalString(values.quoteSummary),
 paymentStatus: toOptionalString(values.paymentStatus),
 paymentMethod: toOptionalString(values.paymentMethod),
 paymentReference: toOptionalString(values.paymentReference),
 shippingCost: toOptionalNumber(values.shippingCost),
 trackingCode: toOptionalString(values.trackingCode),
 trackingLink: toOptionalString(values.trackingLink),
 invoiceUrl: toOptionalString(values.invoiceUrl),
 invoicePayloadNote: toOptionalString(values.invoicePayloadNote),
 operationSummary: toOptionalString(values.operationSummary)
 };

 const parsed = financeUpdateOrderSchema.safeParse(candidate);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para atualização financeira."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateFinanceOrderAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-notify-channel">
 Canal de notificação previa
 </label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" id="finance-notify-channel" {...register("notifyChannel")}>
 <option value="in_app">In-app</option>
 <option value="email">E-mail</option>
 <option value="whatsapp">WhatsApp</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-unlock-password">
 Senha de desbloqueio
 </label>
 <Input id="finance-unlock-password" placeholder="Digite a senha de desbloqueio" type="password" {...register("unlockPassword")} />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-operation-summary">
 Resumo da operação
 </label>
 <Input id="finance-operation-summary" placeholder="Ex.: ajuste de frete e aprovação de pagamento" {...register("operationSummary")} />
 </div>

 {order.type === "custom_order" ? (
 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-final-amount">
 Orçamento final (BRL)
 </label>
 <Input id="finance-final-amount" min="0" step="0.01" type="number" {...register("finalAmount")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-payment-status">
 Status de pagamento
 </label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" id="finance-payment-status" {...register("paymentStatus")}>
 {paymentStatusOptions.map((statusOption) => (
 <option key={statusOption} value={statusOption}>
 {statusOption}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-quote-summary">
 Resumo do orçamento
 </label>
 <Textarea id="finance-quote-summary" {...register("quoteSummary")} />
 </div>
 </div>
 ) : (
 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-shipping-cost">
 Frete (BRL)
 </label>
 <Input id="finance-shipping-cost" min="0" step="0.01" type="number" {...register("shippingCost")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-store-payment-status">
 Status de pagamento
 </label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" id="finance-store-payment-status" {...register("paymentStatus")}>
 <option value="">Não alterar</option>
 {paymentStatusOptions.map((statusOption) => (
 <option key={statusOption} value={statusOption}>
 {statusOption}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-payment-method">
 Forma de pagamento
 </label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" id="finance-payment-method" {...register("paymentMethod")}>
 <option value="">Não alterar</option>
 <option value="pix">PIX</option>
 <option value="cartao">Cartao</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-payment-reference">
 Referência de pagamento
 </label>
 <Input id="finance-payment-reference" {...register("paymentReference")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-tracking-code">
 Codigo de rastreio
 </label>
 <Input id="finance-tracking-code" {...register("trackingCode")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-tracking-link">
 Link de rastreio
 </label>
 <Input id="finance-tracking-link" {...register("trackingLink")} />
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-invoice-url">
 URL da nota fiscal
 </label>
 <Input id="finance-invoice-url" {...register("invoiceUrl")} />
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="finance-invoice-note">
 Observação da nota fiscal
 </label>
 <Textarea id="finance-invoice-note" {...register("invoicePayloadNote")} />
 </div>
 </div>
 )}

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Aplicando..." : "Aplicar alterações financeiras"}
 </Button>
 </form>
 );
}
