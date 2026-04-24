"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { markStoreOrderShippedAction } from "@/actions/store/mark-store-order-shipped-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const salesOrderShippingSchema = z.object({
 orderPublicId: z.string().uuid(),
 shippingCarrier: z.string().max(120).optional(),
 trackingCode: z.string().max(80).optional(),
 trackingLink: z
 .string()
 .url("Informe um link valido")
 .optional()
 .or(z.literal(""))
});

type SalesOrderShippingValues = z.infer<typeof salesOrderShippingSchema>;

interface SalesOrderShippingFormProps {
 orderPublicId: string;
}

export function SalesOrderShippingForm({ orderPublicId }: SalesOrderShippingFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const {
 register,
 handleSubmit,
 formState: { errors }
 } = useForm<SalesOrderShippingValues>({
 resolver: zodResolver(salesOrderShippingSchema),
 defaultValues: {
 orderPublicId,
 shippingCarrier: "",
 trackingCode: "",
 trackingLink: ""
 }
 });

 function onSubmit(values: SalesOrderShippingValues) {
 setFeedback(null);

 startTransition(async () => {
 const response = await markStoreOrderShippedAction({
 orderPublicId: values.orderPublicId,
 shippingCarrier: values.shippingCarrier || undefined,
 trackingCode: values.trackingCode || undefined,
 trackingLink: values.trackingLink || undefined
 });

 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <Input type="hidden" {...register("orderPublicId")} />

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="sales-order-shipping-carrier">
 Transportadora ou Correios
 </label>
 <Input id="sales-order-shipping-carrier" {...register("shippingCarrier")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="sales-order-tracking-code">
 Codigo de rastreio
 </label>
 <Input id="sales-order-tracking-code" {...register("trackingCode")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="sales-order-tracking-link">
 Link de rastreio
 </label>
 <Input id="sales-order-tracking-link" {...register("trackingLink")} />
 {errors.trackingLink?.message ? (
 <p className="text-xs text-destructive">{errors.trackingLink.message}</p>
 ) : null}
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Processando..." : "Marcar como enviado"}
 </Button>
 </form>
 );
}
