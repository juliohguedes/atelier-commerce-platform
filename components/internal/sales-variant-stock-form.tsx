"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateStoreVariantStockAction } from "@/actions/sales-stock/update-store-variant-stock-action";
import { salesUpdateVariantStockSchema } from "@/lib/validations/internal-panels";
import type { SalesStockVariantSummary } from "@/types/internal-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VariantStockFormValues {
 variantId: string;
 stockQuantity: number;
 isActive: boolean;
}

interface SalesVariantStockFormProps {
 variant: SalesStockVariantSummary;
}

export function SalesVariantStockForm({ variant }: SalesVariantStockFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const {
 register,
 handleSubmit
 } = useForm<VariantStockFormValues>({
 defaultValues: {
 variantId: variant.id,
 stockQuantity: variant.stockQuantity,
 isActive: variant.isActive
 }
 });

 function onSubmit(values: VariantStockFormValues) {
 setFeedback(null);

 const parsed = salesUpdateVariantStockSchema.safeParse(values);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para atualizar estoque."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateStoreVariantStockAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-2 rounded-md border border-border/70 bg-card/40 p-3" onSubmit={handleSubmit(onSubmit)}>
 <Input type="hidden" {...register("variantId")} />
 <p className="text-sm font-medium">
 {variant.sku} - {variant.sizeLabel} / {variant.colorLabel}
 </p>

 <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor={`variant-stock-${variant.id}`}>
 Quantidade em estoque
 </label>
 <Input
 id={`variant-stock-${variant.id}`}
 min={0}
 step={1}
 type="number"
 {...register("stockQuantity", { valueAsNumber: true })}
 />
 </div>

 <label className="flex items-center gap-2 text-xs">
 <input type="checkbox" {...register("isActive")} />
 Ativa
 </label>
 </div>

 <p className="text-xs text-muted-foreground">
 Reservado: {variant.reservedQuantity} | Disponivel: {variant.availableQuantity}
 </p>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-xs text-emerald-400" : "text-xs text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} size="sm" type="submit" variant="outline">
 {isPending ? "Atualizando..." : "Atualizar estoque"}
 </Button>
 </form>
 );
}
