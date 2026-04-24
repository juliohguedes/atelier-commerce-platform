"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { submitClientReviewAction } from "@/actions/client/submit-client-review-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
 clientReviewSubmissionSchema,
 type ClientReviewSubmissionInput
} from "@/lib/validations/client-area";
import { cn } from "@/lib/utils";
import type { ClientReviewTargetType } from "@/types";

interface ClientReviewFormProps {
 targetType: ClientReviewTargetType;
 orderPublicId: string;
 compact?: boolean;
}

export function ClientReviewForm({ targetType, orderPublicId, compact = false }: ClientReviewFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const form = useForm<ClientReviewSubmissionInput>({
 resolver: zodResolver(clientReviewSubmissionSchema),
 defaultValues: {
 targetType,
 customOrderPublicId: targetType === "custom_order" ? orderPublicId : undefined,
 storeOrderPublicId: targetType === "store_order" ? orderPublicId : undefined,
 rating: 5,
 headline: "",
 comment: ""
 }
 });

 function handleSubmit(values: ClientReviewSubmissionInput) {
 startTransition(async () => {
 setFeedback(null);
 const result = await submitClientReviewAction(values);

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });

 if (result.success) {
 form.reset({
 ...values,
 rating: 5,
 headline: "",
 comment: ""
 });
 }
 });
 }

 return (
 <form className={cn("space-y-3", compact ? "rounded-lg border border-border/70 bg-card/30 p-3" : "")} onSubmit={form.handleSubmit(handleSubmit)}>
 <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
 <div className="space-y-2">
 <label className="text-sm font-medium">Nota</label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 {...form.register("rating", {
 setValueAs: (value) => Number(value)
 })}
 >
 <option value={5}>5</option>
 <option value={4}>4</option>
 <option value={3}>3</option>
 <option value={2}>2</option>
 <option value={1}>1</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Titulo (opcional)</label>
 <Input placeholder="Ex.: Atendimento excelente" {...form.register("headline")} />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Comentario</label>
 <Textarea
 placeholder="Compartilhe sua experiência com detalhes."
 {...form.register("comment")}
 />
 {form.formState.errors.comment ? (
 <p className="text-xs text-destructive">{form.formState.errors.comment.message}</p>
 ) : null}
 </div>

 <Button disabled={isPending} type="submit" variant="outline">
 {isPending ? "Enviando..." : "Enviar avaliação"}
 </Button>

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
 </form>
 );
}
