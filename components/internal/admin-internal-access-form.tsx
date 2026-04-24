"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { manageInternalAccessAction } from "@/actions/admin/manage-internal-access-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 adminInternalAccessSchema,
 type AdminInternalAccessInput
} from "@/lib/validations/internal-panels";

interface AdminInternalAccessFormValues {
 fullName: string;
 email: string;
 role: "admin" | "finance" | "sales_stock";
 isPrimary: boolean;
}

export function AdminInternalAccessForm() {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const { register, handleSubmit, reset } = useForm<AdminInternalAccessFormValues>({
 defaultValues: {
 fullName: "",
 email: "",
 role: "finance",
 isPrimary: true
 }
 });

 function onSubmit(values: AdminInternalAccessFormValues) {
 setFeedback(null);

 const parsed = adminInternalAccessSchema.safeParse(values satisfies AdminInternalAccessInput);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para criar o acesso."
 });
 return;
 }

 startTransition(async () => {
 const response = await manageInternalAccessAction(parsed.data);

 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });

 if (response.success) {
 reset({
 fullName: "",
 email: "",
 role: values.role,
 isPrimary: true
 });
 }
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="internal-access-full-name">
 Nome completo
 </label>
 <Input id="internal-access-full-name" {...register("fullName")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="internal-access-email">
 E-mail corporativo
 </label>
 <Input
 id="internal-access-email"
 placeholder="colaborador@empresa.com.br"
 type="email"
 {...register("email")}
 />
 </div>
 </div>

 <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="internal-access-role">
 Setor
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 id="internal-access-role"
 {...register("role")}
 >
 <option value="admin">Admin</option>
 <option value="finance">Financeiro</option>
 <option value="sales_stock">Vendas e estoque</option>
 </select>
 </div>

 <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
 <input type="checkbox" {...register("isPrimary")} />
 Tornar acesso principal
 </label>
 </div>

 <p className="text-xs text-muted-foreground">
 Se o e-mail ainda não existir na base autenticada, o sistema tenta enviar um convite
 automaticamente.
 </p>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit">
 {isPending ? "Processando..." : "Criar ou atualizar acesso"}
 </Button>
 </form>
 );
}
