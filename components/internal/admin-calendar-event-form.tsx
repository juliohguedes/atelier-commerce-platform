"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { upsertInternalCalendarEventAction } from "@/actions/admin/upsert-internal-calendar-event-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
 adminCalendarEventSchema,
 type AdminCalendarEventInput
} from "@/lib/validations/internal-panels";

interface AdminCalendarEventFormValues {
 title: string;
 description: string;
 startsAt: string;
 endsAt: string;
 responsibleRole: "" | "admin" | "finance" | "sales_stock" | "client";
 isAllDay: boolean;
}

export function AdminCalendarEventForm() {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const { register, handleSubmit, reset } = useForm<AdminCalendarEventFormValues>({
 defaultValues: {
 title: "",
 description: "",
 startsAt: "",
 endsAt: "",
 responsibleRole: "admin",
 isAllDay: false
 }
 });

 function onSubmit(values: AdminCalendarEventFormValues) {
 setFeedback(null);

 const parsed = adminCalendarEventSchema.safeParse({
 title: values.title,
 description: values.description,
 startsAt: values.startsAt,
 endsAt: values.endsAt,
 responsibleRole: values.responsibleRole || undefined,
 isAllDay: values.isAllDay
 } satisfies AdminCalendarEventInput);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para criar o evento."
 });
 return;
 }

 startTransition(async () => {
 const response = await upsertInternalCalendarEventAction(parsed.data);

 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });

 if (response.success) {
 reset({
 title: "",
 description: "",
 startsAt: "",
 endsAt: "",
 responsibleRole: values.responsibleRole,
 isAllDay: false
 });
 }
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="calendar-event-title">
 Titulo do evento
 </label>
 <Input id="calendar-event-title" {...register("title")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="calendar-event-description">
 Descrição
 </label>
 <Textarea
 className="min-h-[84px]"
 id="calendar-event-description"
 {...register("description")}
 />
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="calendar-event-starts-at">
 Início
 </label>
 <Input id="calendar-event-starts-at" type="datetime-local" {...register("startsAt")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="calendar-event-ends-at">
 Fim
 </label>
 <Input id="calendar-event-ends-at" type="datetime-local" {...register("endsAt")} />
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="calendar-event-role">
 Papel responsável
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 id="calendar-event-role"
 {...register("responsibleRole")}
 >
 <option value="admin">Admin</option>
 <option value="finance">Financeiro</option>
 <option value="sales_stock">Vendas e estoque</option>
 <option value="client">Cliente</option>
 <option value="">Sem papel fixo</option>
 </select>
 </div>

 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" {...register("isAllDay")} />
 Evento de dia inteiro
 </label>
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit" variant="outline">
 {isPending ? "Salvando..." : "Adicionar ao calendário"}
 </Button>
 </form>
 );
}
