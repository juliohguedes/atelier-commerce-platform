"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateAdminOrderStatusAction } from "@/actions/internal/update-admin-order-status-action";
import {
 customOrderInternalStatusOptions,
 customOrderStatusLabels
} from "@/lib/constants/internal-panels";
import { adminUpdateOrderStatusSchema } from "@/lib/validations/internal-panels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdminStatusFormValues {
 status: (typeof customOrderInternalStatusOptions)[number];
 note: string;
}

interface AdminOrderStatusFormProps {
 orderPublicId: string;
 currentStatus: (typeof customOrderInternalStatusOptions)[number];
}

export function AdminOrderStatusForm({
 orderPublicId,
 currentStatus
}: AdminOrderStatusFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const {
 register,
 handleSubmit,
 reset,
 formState: { errors }
 } = useForm<AdminStatusFormValues>({
 defaultValues: {
 status: currentStatus,
 note: ""
 }
 });

 function onSubmit(values: AdminStatusFormValues) {
 setFeedback(null);

 const parsed = adminUpdateOrderStatusSchema.safeParse({
 orderPublicId,
 status: values.status,
 note: values.note
 });

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para atualizar status."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateAdminOrderStatusAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });

 if (response.success) {
 reset({
 status: values.status,
 note: ""
 });
 }
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="admin-order-status">
 Status do pedido
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 id="admin-order-status"
 {...register("status")}
 >
 {customOrderInternalStatusOptions.map((statusOption) => (
 <option key={statusOption} value={statusOption}>
 {customOrderStatusLabels[statusOption] ?? statusOption}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" htmlFor="admin-order-note">
 Observação interna
 </label>
 <Textarea
 id="admin-order-note"
 maxLength={240}
 placeholder="Registre o motivo da mudanca de status..."
 {...register("note")}
 />
 {errors.note?.message ? <p className="text-xs text-destructive">{errors.note.message}</p> : null}
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar status"}
 </Button>
 </form>
 );
}
