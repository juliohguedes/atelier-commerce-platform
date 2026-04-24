"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createCustomOrderAppointmentAction } from "@/actions/client/create-custom-order-appointment-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
 customOrderAppointmentSchema,
 type CustomOrderAppointmentInput
} from "@/lib/validations/client-area";
import { cn } from "@/lib/utils";

interface CustomOrderOption {
 publicId: string;
 label: string;
}

interface ClientAppointmentFormProps {
 customOrderOptions: CustomOrderOption[];
}

export function ClientAppointmentForm({ customOrderOptions }: ClientAppointmentFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const form = useForm<CustomOrderAppointmentInput>({
 resolver: zodResolver(customOrderAppointmentSchema),
 defaultValues: {
 orderPublicId: undefined,
 appointmentType: "tirar_medidas",
 attendanceMode: "online",
 scheduledFor: "",
 notes: ""
 }
 });

 function handleSubmit(values: CustomOrderAppointmentInput) {
 startTransition(async () => {
 setFeedback(null);

 const result = await createCustomOrderAppointmentAction({
 ...values,
 orderPublicId: values.orderPublicId || undefined,
 notes: values.notes || undefined
 });

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });

 if (result.success) {
 form.reset({
 orderPublicId: values.orderPublicId,
 appointmentType: "tirar_medidas",
 attendanceMode: values.attendanceMode,
 scheduledFor: "",
 notes: ""
 });
 }
 });
 }

 return (
 <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
 <div className="space-y-2">
 <label className="text-sm font-medium">Pedido vinculado (opcional)</label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 {...form.register("orderPublicId", {
 setValueAs: (value) => (value ? value : undefined)
 })}
 >
 <option value="">Sem vinculo de pedido</option>
 {customOrderOptions.map((customOrderOption) => (
 <option key={customOrderOption.publicId} value={customOrderOption.publicId}>
 {customOrderOption.label}
 </option>
 ))}
 </select>
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Tipo de agendamento</label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" {...form.register("appointmentType")}>
 <option value="tirar_medidas">Tirar medidas</option>
 <option value="alinhamento_pedido">Alinhamento do pedido</option>
 <option value="retirada">Retirada</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Atendimento</label>
 <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" {...form.register("attendanceMode")}>
 <option value="online">Online</option>
 <option value="presencial">Presencial</option>
 </select>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Data e horário desejados</label>
 <Input type="datetime-local" {...form.register("scheduledFor")} />
 {form.formState.errors.scheduledFor ? (
 <p className="text-xs text-destructive">{form.formState.errors.scheduledFor.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Observações</label>
 <Textarea
 placeholder="Inclua detalhes importantes para o atendimento."
 {...form.register("notes")}
 />
 </div>

 <Button disabled={isPending} type="submit" variant="outline">
 {isPending ? "Solicitando..." : "Solicitar agendamento"}
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
