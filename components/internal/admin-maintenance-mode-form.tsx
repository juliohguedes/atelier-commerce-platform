"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateMaintenanceModeAction } from "@/actions/admin/update-maintenance-mode-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 adminMaintenanceModeSchema,
 type AdminMaintenanceModeInput
} from "@/lib/validations/internal-panels";
import type { UserRole } from "@/types/auth";
import type { AdminMaintenanceModeState } from "@/types/internal-panels";

interface AdminMaintenanceModeFormValues {
 enabled: boolean;
 message: string;
 startsAt: string;
 endsAt: string;
 allowRoles: UserRole[];
}

interface AdminMaintenanceModeFormProps {
 initialValues: AdminMaintenanceModeState;
}

function toDateTimeLocalValue(value: string | null): string {
 if (!value) {
 return "";
 }

 const date = new Date(value);
 const pad = (part: number) => String(part).padStart(2, "0");

 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AdminMaintenanceModeForm({
 initialValues
}: AdminMaintenanceModeFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const { register, handleSubmit } = useForm<AdminMaintenanceModeFormValues>({
 defaultValues: {
 enabled: initialValues.enabled,
 message: initialValues.message,
 startsAt: toDateTimeLocalValue(initialValues.startsAt),
 endsAt: toDateTimeLocalValue(initialValues.endsAt),
 allowRoles: initialValues.allowRoles
 }
 });

 function onSubmit(values: AdminMaintenanceModeFormValues) {
 setFeedback(null);

 const parsed = adminMaintenanceModeSchema.safeParse({
 enabled: values.enabled,
 message: values.message,
 startsAt: values.startsAt,
 endsAt: values.endsAt,
 allowRoles: values.allowRoles
 } satisfies AdminMaintenanceModeInput);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message:
 parsed.error.issues[0]?.message ?? "Dados invalidos para atualizar a manutenção."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateMaintenanceModeAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" {...register("enabled")} />
 Ativar modo manutenção
 </label>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="maintenance-message">
 Mensagem publica
 </label>
 <Input id="maintenance-message" {...register("message")} />
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="maintenance-starts-at">
 Início programado
 </label>
 <Input id="maintenance-starts-at" type="datetime-local" {...register("startsAt")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="maintenance-ends-at">
 Fim programado
 </label>
 <Input id="maintenance-ends-at" type="datetime-local" {...register("endsAt")} />
 </div>
 </div>

 <div className="space-y-2">
 <p className="text-xs text-muted-foreground">Papeis liberados durante a manutenção</p>
 <div className="grid gap-2 md:grid-cols-2">
 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" value="admin" {...register("allowRoles")} />
 Admin
 </label>
 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" value="finance" {...register("allowRoles")} />
 Financeiro
 </label>
 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" value="sales_stock" {...register("allowRoles")} />
 Vendas e estoque
 </label>
 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" value="client" {...register("allowRoles")} />
 Cliente
 </label>
 </div>
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit" variant="outline">
 {isPending ? "Salvando..." : "Salvar modo manutenção"}
 </Button>
 </form>
 );
}
