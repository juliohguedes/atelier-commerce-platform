"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { requestAccountDeletionAction } from "@/actions/client/request-account-deletion-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
 accountDeletionRequestSchema,
 type AccountDeletionRequestInput
} from "@/lib/validations/client-area";
import { cn } from "@/lib/utils";
import type { ClientAccountDeletionRequestSummary } from "@/types";

interface AccountDeletionRequestFormProps {
 latestRequest: ClientAccountDeletionRequestSummary | null;
}

const deletionStatusLabels: Record<
 ClientAccountDeletionRequestSummary["status"],
 string
> = {
 pending: "Pendente",
 in_review: "Em análise",
 approved: "Aprovada",
 rejected: "Recusada",
 completed: "Concluída"
};

export function AccountDeletionRequestForm({ latestRequest }: AccountDeletionRequestFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const form = useForm<AccountDeletionRequestInput>({
 resolver: zodResolver(accountDeletionRequestSchema),
 defaultValues: {
 reason: ""
 }
 });

 function handleSubmit(values: AccountDeletionRequestInput) {
 startTransition(async () => {
 setFeedback(null);
 const result = await requestAccountDeletionAction(values);

 setFeedback({
 type: result.success ? "success" : "error",
 message: result.message
 });

 if (result.success) {
 form.reset({ reason: "" });
 }
 });
 }

 return (
 <div className="space-y-4">
 {latestRequest ? (
 <div className="rounded-md border border-border/70 bg-card/40 p-3 text-sm">
 <p>
 Ultima solicitação: <strong>{deletionStatusLabels[latestRequest.status]}</strong>
 </p>
 <p className="mt-1 text-xs text-muted-foreground">Motivo: {latestRequest.reason}</p>
 {latestRequest.resolutionNote ? (
 <p className="mt-1 text-xs text-muted-foreground">
 Retorno da equipe: {latestRequest.resolutionNote}
 </p>
 ) : null}
 </div>
 ) : null}

 <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
 <div className="space-y-2">
 <label className="text-sm font-medium">Motivo da solicitação</label>
 <Textarea
 placeholder="Explique o motivo da solicitação de exclusão da conta."
 {...form.register("reason")}
 />
 {form.formState.errors.reason ? (
 <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
 ) : null}
 </div>

 <Button
 className="border-destructive/50 text-destructive hover:bg-destructive/10"
 disabled={isPending}
 type="submit"
 variant="outline"
 >
 {isPending ? "Enviando solicitação..." : "Solicitar exclusão da conta"}
 </Button>
 </form>

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
 </div>
 );
}
