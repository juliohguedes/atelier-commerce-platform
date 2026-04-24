"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { manageAdminTechnicalModeAction } from "@/actions/admin/manage-admin-technical-mode-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { adminTechnicalDraftSchema } from "@/lib/validations/admin-panel";

interface AdminTechnicalFormValues {
 mode: "save_draft" | "publish" | "restore_last_published";
 unlockPassword: string;
 payloadJson: string;
 operationNote: string;
}

interface AdminTechnicalModeFormProps {
 draftPayload: Record<string, unknown> | null;
 publishedPayload: Record<string, unknown> | null;
 draftOwnerName: string | null;
 isCurrentUserDraftOwner: boolean;
}

export function AdminTechnicalModeForm({
 draftPayload,
 publishedPayload,
 draftOwnerName,
 isCurrentUserDraftOwner
}: AdminTechnicalModeFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const defaultPayload = useMemo(
 () => JSON.stringify(draftPayload ?? publishedPayload ?? {}, null, 2),
 [draftPayload, publishedPayload]
 );

 const [mode, setMode] = useState<AdminTechnicalFormValues["mode"]>("save_draft");
 const [confirmPublish, setConfirmPublish] = useState(false);
 const [payloadJsonState, setPayloadJsonState] = useState(defaultPayload);

 const {
 register,
 handleSubmit,
 setValue
 } = useForm<AdminTechnicalFormValues>({
 defaultValues: {
 mode: "save_draft",
 unlockPassword: "",
 payloadJson: defaultPayload,
 operationNote: ""
 }
 });

 const preview = useMemo(() => {
 try {
 if (!payloadJsonState || payloadJsonState.trim().length === 0) {
 return "{}";
 }

 return JSON.stringify(JSON.parse(payloadJsonState), null, 2);
 } catch {
 return "JSON invalido";
 }
 }, [payloadJsonState]);

 function onSubmit(values: AdminTechnicalFormValues) {
 setFeedback(null);

 if (values.mode === "publish" && !confirmPublish) {
 setFeedback({
 type: "error",
 message: "Confirme a publicação final antes de publicar."
 });
 return;
 }

 const parsed = adminTechnicalDraftSchema.safeParse(values);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para modo técnico."
 });
 return;
 }

 startTransition(async () => {
 const response = await manageAdminTechnicalModeAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <div className="rounded-md border border-border/70 bg-card/50 p-3 text-xs text-muted-foreground">
 <p>
 Rascunho visivel para: {draftOwnerName ?? "Nenhum responsável"}.
 {isCurrentUserDraftOwner ? " Você e a proprietaria atual do rascunho." : ""}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-technical-mode">
 Operação
 </label>
 <select
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 id="admin-technical-mode"
 {...register("mode")}
 onChange={(event) => {
 const nextMode = event.target.value as AdminTechnicalFormValues["mode"];
 setMode(nextMode);
 setValue("mode", nextMode);
 }}
 value={mode}
 >
 <option value="save_draft">Salvar como rascunho</option>
 <option value="publish">Publicar versão técnica</option>
 <option value="restore_last_published">Restaurar ultima versão publicada</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-technical-payload">
 Payload técnico (JSON)
 </label>
 <Textarea
 className="min-h-[220px] font-mono text-xs"
 id="admin-technical-payload"
 {...register("payloadJson")}
 onChange={(event) => {
 setValue("payloadJson", event.target.value);
 setPayloadJsonState(event.target.value);
 }}
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground">Previa antes de publicar</label>
 <pre className="max-h-44 overflow-auto rounded-md border border-border/70 bg-card/40 p-3 text-[11px] text-muted-foreground">
 {preview}
 </pre>
 </div>

 {mode === "publish" ? (
 <label className="flex items-center gap-2 text-sm">
 <input
 checked={confirmPublish}
 onChange={(event) => setConfirmPublish(event.target.checked)}
 type="checkbox"
 />
 Confirmo a publicação final após revisar a previa.
 </label>
 ) : null}

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-technical-note">
 Aviso de risco e observação interna
 </label>
 <Textarea className="min-h-[88px]" id="admin-technical-note" {...register("operationNote")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="admin-technical-password">
 Senha do modo técnico
 </label>
 <input
 className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
 id="admin-technical-password"
 type="password"
 {...register("unlockPassword")}
 />
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button className="w-full" disabled={isPending} type="submit" variant="outline">
 {isPending ? "Processando..." : "Executar operação técnica"}
 </Button>
 </form>
 );
}
