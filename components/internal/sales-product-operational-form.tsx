"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateStoreProductOperationalAction } from "@/actions/sales-stock/update-store-product-operational-action";
import { salesUpdateProductOperationalSchema } from "@/lib/validations/internal-panels";
import type { SalesStockProductDetail } from "@/types/internal-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductOperationalFormValues {
 productId: string;
 name: string;
 shortDescription: string;
 description: string;
 categoryId: string;
 collectionId: string;
 isActive: boolean;
 isFeatured: boolean;
 sortOrder: number;
}

interface SalesProductOperationalFormProps {
 product: SalesStockProductDetail;
}

export function SalesProductOperationalForm({
 product
}: SalesProductOperationalFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const defaultValues = useMemo<ProductOperationalFormValues>(
 () => ({
 productId: product.id,
 name: product.name,
 shortDescription: product.shortDescription ?? "",
 description: product.description ?? "",
 categoryId: product.categoryId ?? "",
 collectionId: product.collectionId ?? "",
 isActive: product.isActive,
 isFeatured: product.isFeatured,
 sortOrder: 0
 }),
 [product]
 );

 const {
 register,
 handleSubmit
 } = useForm<ProductOperationalFormValues>({
 defaultValues
 });

 function onSubmit(values: ProductOperationalFormValues) {
 setFeedback(null);

 const parsed = salesUpdateProductOperationalSchema.safeParse({
 productId: values.productId,
 name: values.name,
 shortDescription: values.shortDescription,
 description: values.description,
 categoryId: values.categoryId,
 collectionId: values.collectionId,
 isActive: values.isActive,
 isFeatured: values.isFeatured,
 sortOrder: values.sortOrder
 });

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para atualização do produto."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateStoreProductOperationalAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <Input type="hidden" {...register("productId")} />

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-name">
 Nome
 </label>
 <Input id="sales-product-name" {...register("name")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-short-description">
 Descrição curta
 </label>
 <Textarea className="min-h-[72px]" id="sales-product-short-description" {...register("shortDescription")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-description">
 Descrição completa
 </label>
 <Textarea id="sales-product-description" {...register("description")} />
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-category-id">
 Categoria (ID)
 </label>
 <Input id="sales-product-category-id" placeholder="UUID da categoria" {...register("categoryId")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-collection-id">
 Coleção (ID)
 </label>
 <Input id="sales-product-collection-id" placeholder="UUID da coleção" {...register("collectionId")} />
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-3">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="sales-product-sort-order">
 Ordem
 </label>
 <Input id="sales-product-sort-order" min={0} step={1} type="number" {...register("sortOrder", { valueAsNumber: true })} />
 </div>

 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" {...register("isActive")} />
 Disponível na loja
 </label>

 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" {...register("isFeatured")} />
 Produto em destaque
 </label>
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar dados operacionais"}
 </Button>
 </form>
 );
}
