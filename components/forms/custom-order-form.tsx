"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, FileText, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { cancelCustomOrderAction } from "@/actions/custom-order/cancel-custom-order-action";
import { registerCustomOrderAttachmentsAction } from "@/actions/custom-order/register-custom-order-attachments-action";
import { upsertCustomOrderAction } from "@/actions/custom-order/upsert-custom-order-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import {
 customOrderAllowedAttachmentMimeTypes,
 customOrderAttachmentsBucket,
 customOrderAudienceOptions,
 customOrderCancellationPolicyText,
 customOrderComplexityOptions,
 customOrderEstimateDisclaimer,
 customOrderFabricOptions,
 customOrderFabricTierAdjustments,
 customOrderInitialStatusFlow,
 customOrderLargeScaleLengthLabels,
 customOrderMeasurementFields,
 customOrderMaxAttachmentSizeBytes,
 customOrderMaxAttachments,
 customOrderModelingOptions,
 customOrderNotionOptions,
 customOrderPieceLengthOptions,
 customOrderPieceOptions,
 customOrderProductionModeOptions,
 customOrderRequestTypeOptions,
 customOrderSizeOptions,
 customOrderStatusLabels,
 customOrderSuggestedNotionsByPiece
} from "@/lib/constants/custom-order";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
 customOrderPayloadSchema,
 type CustomOrderPayloadInput
} from "@/lib/validations/custom-order";
import { formatPhoneBR, onlyDigits } from "@/lib/validations/br";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { calculatePreEstimate, findFabricTierByType } from "@/services/custom-order/calculate-pre-estimate";
import { cancellableStatusesBeforePayment } from "@/services/custom-order/order-status";
import type {
 CustomOrderFabricTier,
 CustomOrderNotion,
 CustomOrderPieceType,
 CustomOrderStatus
} from "@/types/custom-order";

type PersistOperation = "save_draft" | "submit_analysis";

interface PersistedOrder {
 id: number;
 publicId: string;
 protocolCode: string;
 status: CustomOrderStatus;
 statusLabel: string;
 estimatedTotal: number;
 pieceTypeLabel: string;
 productionModeLabel: string;
 audienceLabel: string;
}

interface AttachmentItem {
 localId: string;
 file: File;
 previewUrl: string | null;
 isImage: boolean;
 uploaded: boolean;
 storagePath?: string;
}

interface CustomOrderFormInitialContact {
 fullName: string;
 email: string;
 contact: string;
 hasSavedContact: boolean;
}

type MeasurementKey = keyof NonNullable<CustomOrderPayloadInput["measurements"]>;
type MeasurementField = {
 key: MeasurementKey;
 label: string;
};

const nativeSelectClassName =
 "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function sanitizeFileName(value: string): string {
 return value
 .toLowerCase()
 .replace(/[^a-z0-9.\\-_]/g, "-")
 .replace(/-+/g, "-");
}

function getPieceLabel(pieceType: CustomOrderPieceType): string {
 return customOrderPieceOptions.find((option) => option.value === pieceType)?.label ?? pieceType;
}

function getAudienceLabel(audience: string): string {
 return customOrderAudienceOptions.find((option) => option.value === audience)?.label ?? audience;
}

function getStatusIndex(status: CustomOrderStatus): number {
 return customOrderInitialStatusFlow.findIndex((item) => item === status);
}

function buildWhatsappLink(protocolCode: string): string {
 const digits = onlyDigits(BRAND_CONFIG.contactPhone) || "5511999999999";
 const message = `Ola! Meu protocolo de encomenda e ${protocolCode}. Gostaria de prosseguir com o atendimento.`;
 return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

interface CustomOrderFormProps {
 initialContact?: CustomOrderFormInitialContact | null;
}

export function CustomOrderForm({ initialContact }: CustomOrderFormProps) {
 const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
 const [persistingOperation, setPersistingOperation] = useState<PersistOperation | null>(null);
 const [isCancelling, setIsCancelling] = useState(false);
 const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
 const [feedbackType, setFeedbackType] = useState<"success" | "error" | "warning" | null>(null);
 const [persistedOrder, setPersistedOrder] = useState<PersistedOrder | null>(null);
 const hasSavedContact = initialContact?.hasSavedContact ?? false;
 const savedContactLabel =
 hasSavedContact && initialContact?.contact
 ? formatPhoneBR(initialContact.contact)
 : null;

 const form = useForm<CustomOrderPayloadInput>({
 resolver: zodResolver(customOrderPayloadSchema),
 defaultValues: {
 operation: "save_draft",
 existingOrderPublicId: undefined,
 audience: "feminino",
 productionMode: "larga_escala",
 requestType: "referencia_imagem",
 pieceType: "blazer",
 pieceTypeOther: "",
 sizeStandard: "M",
 sizeOther: "",
 modeling: "padrao",
 pieceLength: customOrderPieceLengthOptions.blazer?.[0] ?? "Classico",
 measurements: {},
 attachmentCount: 0,
 referenceNotes: "",
 exclusiveStyle: "",
 exclusiveClosure: "",
 exclusiveSpecificDetails: "",
 fabricType: "algodao",
 fabricTier: "simples",
 hasElastane: false,
 hasLining: false,
 notions: customOrderSuggestedNotionsByPiece.blazer as CustomOrderNotion[],
 complexity: "basica",
 desiredDeadline: "",
 desiredDeadlineReason: "",
 exclusiveColor: "",
 exclusivePrint: "",
 visualObservations: "",
 finalNotes: "",
 requiresContact: !hasSavedContact,
 contactFullName: initialContact?.fullName ?? "",
 contactEmail: initialContact?.email ?? "",
 contactWhatsapp: initialContact?.contact ? formatPhoneBR(initialContact.contact) : "",
 acceptedTerms: false,
 acceptedEstimateAwareness: false
 }
 });

 const audience = useWatch({
 control: form.control,
 name: "audience"
 });
 const productionMode = useWatch({
 control: form.control,
 name: "productionMode"
 });
 const requestType = useWatch({
 control: form.control,
 name: "requestType"
 });
 const pieceType = useWatch({
 control: form.control,
 name: "pieceType"
 });
 const sizeStandard = useWatch({
 control: form.control,
 name: "sizeStandard"
 });
 const fabricType = useWatch({
 control: form.control,
 name: "fabricType"
 });
 const fabricTier = useWatch({
 control: form.control,
 name: "fabricTier"
 });
 const complexity = useWatch({
 control: form.control,
 name: "complexity"
 });
 const selectedNotions = useWatch({
 control: form.control,
 name: "notions"
 });
 const contactEmail = useWatch({
 control: form.control,
 name: "contactEmail"
 });
 const contactWhatsapp = useWatch({
 control: form.control,
 name: "contactWhatsapp"
 });

 const safeAudience = audience ?? "feminino";
 const safeProductionMode = productionMode ?? "larga_escala";
 const safeRequestType = requestType ?? "referencia_imagem";
 const safePieceType = pieceType ?? "blazer";
 const safeSizeStandard = sizeStandard ?? "M";
 const safeFabricType = fabricType ?? "algodao";
 const safeFabricTier = fabricTier ?? "simples";
 const safeComplexity = complexity ?? "basica";
 const safeSelectedNotions = useMemo(
 () => selectedNotions ?? [],
 [selectedNotions]
 );

 const estimatedBreakdown = useMemo(
 () =>
 calculatePreEstimate({
 pieceType: safePieceType,
 complexity: safeComplexity,
 fabricTier: safeFabricTier,
 selectedNotions: safeSelectedNotions
 }),
 [safePieceType, safeComplexity, safeFabricTier, safeSelectedNotions]
 );

 const measurementFields = useMemo<ReadonlyArray<MeasurementField>>(
 () =>
 (customOrderMeasurementFields[safeAudience] ?? customOrderMeasurementFields.feminino) as ReadonlyArray<MeasurementField>,
 [safeAudience]
 );

 const currentLengthOptions = useMemo(
 () => customOrderPieceLengthOptions[safePieceType] ?? ["Definir no briefing"],
 [safePieceType]
 );
 const currentLengthLabel = useMemo(
 () => customOrderLargeScaleLengthLabels[safePieceType] ?? "Comprimento da peça",
 [safePieceType]
 );

 const attachmentCount = attachments.length;
 const canCancelCurrentOrder = Boolean(
 persistedOrder && cancellableStatusesBeforePayment.includes(persistedOrder.status)
 );

 useEffect(() => {
 form.setValue("attachmentCount", attachmentCount, { shouldValidate: false });
 }, [attachmentCount, form]);

 useEffect(() => {
 const suggestedNotions = customOrderSuggestedNotionsByPiece[safePieceType] ?? [];
 form.setValue("notions", suggestedNotions as CustomOrderNotion[], {
 shouldDirty: true,
 shouldValidate: true
 });
 }, [safePieceType, form]);

 useEffect(() => {
 const suggestedTier = findFabricTierByType(safeFabricType);
 form.setValue("fabricTier", suggestedTier as CustomOrderFabricTier, {
 shouldValidate: true
 });
 }, [safeFabricType, form]);

 useEffect(() => {
 const currentLengthValue = form.getValues("pieceLength");
 if (!currentLengthValue || !currentLengthOptions.includes(currentLengthValue)) {
 form.setValue("pieceLength", currentLengthOptions[0], {
 shouldValidate: true
 });
 }
 }, [currentLengthOptions, form]);

 useEffect(() => {
 return () => {
 attachments.forEach((attachment) => {
 if (attachment.previewUrl) {
 URL.revokeObjectURL(attachment.previewUrl);
 }
 });
 };
 }, [attachments]);

 function setFeedback(type: "success" | "error" | "warning", message: string) {
 setFeedbackType(type);
 setFeedbackMessage(message);
 }

 function handleAttachmentSelect(event: React.ChangeEvent<HTMLInputElement>) {
 const fileList = event.target.files;
 if (!fileList) {
 return;
 }

 const selectedFiles = Array.from(fileList);
 const availableSlots = customOrderMaxAttachments - attachments.length;

 if (availableSlots <= 0) {
 setFeedback("warning", `Limite de ${customOrderMaxAttachments} anexos atingido.`);
 return;
 }

 const nextItems: AttachmentItem[] = [];

 selectedFiles.slice(0, availableSlots).forEach((file) => {
 if (!customOrderAllowedAttachmentMimeTypes.includes(file.type as (typeof customOrderAllowedAttachmentMimeTypes)[number])) {
 return;
 }

 if (file.size > customOrderMaxAttachmentSizeBytes) {
 return;
 }

 const isImage = file.type.startsWith("image/");

 nextItems.push({
 localId: crypto.randomUUID(),
 file,
 previewUrl: isImage ? URL.createObjectURL(file) : null,
 isImage,
 uploaded: false
 });
 });

 if (nextItems.length === 0) {
 setFeedback(
 "warning",
 "Nenhum arquivo valido foi selecionado. Use JPG, PNG, WEBP ou PDF até 15MB."
 );
 event.target.value = "";
 return;
 }

 setAttachments((previous) => [...previous, ...nextItems]);
 setFeedback("success", `${nextItems.length} arquivo(s) adicionado(s) para envio.`);
 event.target.value = "";
 }

 function removeAttachment(localId: string) {
 setAttachments((previous) => {
 const currentAttachment = previous.find((item) => item.localId === localId);
 if (currentAttachment?.uploaded) {
 return previous;
 }

 if (currentAttachment?.previewUrl) {
 URL.revokeObjectURL(currentAttachment.previewUrl);
 }

 return previous.filter((item) => item.localId !== localId);
 });
 }

 function toggleNotion(notionValue: CustomOrderNotion) {
 const currentValues = form.getValues("notions") ?? [];
 const exists = currentValues.includes(notionValue);
 const nextValues = exists
 ? currentValues.filter((value) => value !== notionValue)
 : [...currentValues, notionValue];

 form.setValue("notions", nextValues, {
 shouldDirty: true,
 shouldValidate: true
 });
 }

 async function uploadPendingAttachments(orderPublicId: string): Promise<{
 success: boolean;
 message?: string;
 }> {
 const pendingAttachments = attachments.filter((attachment) => !attachment.uploaded);

 if (pendingAttachments.length === 0) {
 return {
 success: true
 };
 }

 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para upload de anexos."
 };
 }

 try {
 const supabase = createSupabaseBrowserClient();
 const uploadedRows: Array<{
 localId: string;
 storagePath: string;
 originalFileName: string;
 mimeType: string;
 fileSizeBytes: number;
 }> = [];

 for (const attachment of pendingAttachments) {
 const sanitizedName = sanitizeFileName(attachment.file.name);
 const storagePath = `orders/${orderPublicId}/${Date.now()}-${attachment.localId}-${sanitizedName}`;

 const { error } = await supabase.storage
 .from(customOrderAttachmentsBucket)
 .upload(storagePath, attachment.file, {
 cacheControl: "3600",
 upsert: false,
 contentType: attachment.file.type
 });

 if (error) {
 return {
 success: false,
 message: `Falha ao enviar anexo ${attachment.file.name}: ${error.message}`
 };
 }

 uploadedRows.push({
 localId: attachment.localId,
 storagePath,
 originalFileName: attachment.file.name,
 mimeType: attachment.file.type,
 fileSizeBytes: attachment.file.size
 });
 }

 const registerResult = await registerCustomOrderAttachmentsAction({
 orderPublicId,
 contactEmail: contactEmail ?? undefined,
 attachments: uploadedRows.map((row) => ({
 storagePath: row.storagePath,
 originalFileName: row.originalFileName,
 mimeType: row.mimeType,
 fileSizeBytes: row.fileSizeBytes
 }))
 });

 if (!registerResult.success) {
 return {
 success: false,
 message: registerResult.message
 };
 }

 setAttachments((previous) =>
 previous.map((attachment) => {
 const uploadedItem = uploadedRows.find((row) => row.localId === attachment.localId);
 if (!uploadedItem) {
 return attachment;
 }

 return {
 ...attachment,
 uploaded: true,
 storagePath: uploadedItem.storagePath
 };
 })
 );

 return {
 success: true
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada no upload de anexos."
 };
 }
 }

 async function persistOrder(operation: PersistOperation) {
 setFeedbackMessage(null);
 setFeedbackType(null);
 setPersistingOperation(operation);

 form.setValue("operation", operation, { shouldValidate: false });
 form.setValue("attachmentCount", attachments.length, { shouldValidate: false });

 const isValid = await form.trigger();
 if (!isValid) {
 setPersistingOperation(null);
 setFeedback(
 "error",
 operation === "submit_analysis"
 ? "Revise os campos obrigatorios para enviar o pedido."
 : "Revise os campos destacados para salvar o rascunho."
 );
 return;
 }

 const payload = form.getValues();

 const persistResult = await upsertCustomOrderAction(payload);

 if (!persistResult.success || !persistResult.order) {
 setPersistingOperation(null);
 setFeedback("error", persistResult.message);
 return;
 }

 form.setValue("existingOrderPublicId", persistResult.order.publicId, {
 shouldValidate: false,
 shouldDirty: false
 });

 const uploadResult = await uploadPendingAttachments(persistResult.order.publicId);
 if (!uploadResult.success) {
 if (form.getValues("contactWhatsapp")) {
 form.setValue("requiresContact", false, { shouldValidate: false, shouldDirty: false });
 }
 setPersistingOperation(null);
 setFeedback(
 "warning",
 `${persistResult.message} Porem houve problema nos anexos: ${uploadResult.message}`
 );
 setPersistedOrder(persistResult.order);
 return;
 }

 if (form.getValues("contactWhatsapp")) {
 form.setValue("requiresContact", false, { shouldValidate: false, shouldDirty: false });
 }
 setPersistedOrder(persistResult.order);
 setPersistingOperation(null);
 setFeedback("success", persistResult.message);
 }

 async function handleCancelOrder() {
 if (!persistedOrder) {
 return;
 }

 setIsCancelling(true);
 setFeedbackMessage(null);
 setFeedbackType(null);

 const cancelResult = await cancelCustomOrderAction({
 orderPublicId: persistedOrder.publicId,
 contactEmail: (form.getValues("contactEmail") ?? "").trim().toLowerCase(),
 whatsapp: form.getValues("contactWhatsapp")
 });

 if (!cancelResult.success) {
 setIsCancelling(false);
 setFeedback("error", cancelResult.message);
 return;
 }

 setPersistedOrder((previous) =>
 previous
 ? {
 ...previous,
 status: "cancelado_pela_cliente",
 statusLabel: cancelResult.statusLabel ?? "Cancelado pela cliente"
 }
 : previous
 );

 setIsCancelling(false);
 setFeedback("success", cancelResult.message);
 }

 return (
 <div className="space-y-8">
 <Card className="border-gold-600/35 bg-card/80">
 <CardHeader>
 <CardTitle>Fluxo de encomenda personalizada</CardTitle>
 <CardDescription>
 Preencha o briefing da peça, veja o pré-orçamento e envie para análise da equipe.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-8">
 <input type="hidden" {...form.register("requiresContact")} />

 <section className="space-y-4">
 <h3 className="text-xl">1. Entrada do fluxo</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Público</label>
 <select className={nativeSelectClassName} {...form.register("audience")}>
 {customOrderAudienceOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Tipo de produção</label>
 <select className={nativeSelectClassName} {...form.register("productionMode")}>
 {customOrderProductionModeOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>
 </div>
 </section>

 <section className="space-y-4">
 <h3 className="text-xl">2. Tipo de peça</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Peça</label>
 <select className={nativeSelectClassName} {...form.register("pieceType")}>
 {customOrderPieceOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 {safePieceType === "outros" ? (
 <div className="space-y-2">
 <label className="text-sm font-medium">Descreva a peça</label>
 <Input
 placeholder="Ex.: capa com recortes assimetricos"
 {...form.register("pieceTypeOther")}
 />
 {form.formState.errors.pieceTypeOther ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.pieceTypeOther.message}
 </p>
 ) : null}
 </div>
 ) : null}
 </div>
 </section>

 {safeProductionMode === "larga_escala" ? (
 <section className="space-y-4">
 <h3 className="text-xl">3. Larga escala</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Tamanho</label>
 <select className={nativeSelectClassName} {...form.register("sizeStandard")}>
 {customOrderSizeOptions.map((size) => (
 <option key={size} value={size}>
 {size}
 </option>
 ))}
 </select>
 {form.formState.errors.sizeStandard ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.sizeStandard.message}
 </p>
 ) : null}
 </div>

 {safeSizeStandard === "OUTROS" ? (
 <div className="space-y-2">
 <label className="text-sm font-medium">Tamanho em Outros</label>
 <Input placeholder="Ex.: G1, G2, G3" {...form.register("sizeOther")} />
 {form.formState.errors.sizeOther ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.sizeOther.message}
 </p>
 ) : null}
 </div>
 ) : null}

 <div className="space-y-2">
 <label className="text-sm font-medium">Modelagem</label>
 <select className={nativeSelectClassName} {...form.register("modeling")}>
 {customOrderModelingOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 {form.formState.errors.modeling ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.modeling.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">{currentLengthLabel}</label>
 <select className={nativeSelectClassName} {...form.register("pieceLength")}>
 {currentLengthOptions.map((lengthOption) => (
 <option key={lengthOption} value={lengthOption}>
 {lengthOption}
 </option>
 ))}
 </select>
 {form.formState.errors.pieceLength ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.pieceLength.message}
 </p>
 ) : null}
 </div>
 </div>
 </section>
 ) : (
 <section className="space-y-4">
 <h3 className="text-xl">3. Sob medida</h3>
 <p className="text-sm text-muted-foreground">
 Informe as medidas em centimetros para {getAudienceLabel(safeAudience).toLowerCase()}.
 </p>
 <div className="grid gap-3 md:grid-cols-3">
 {measurementFields.map((measurementField) => {
 const fieldPath = `measurements.${measurementField.key}` as const;
 const fieldError = form.formState.errors.measurements?.[measurementField.key];

 return (
 <div className="space-y-1" key={measurementField.key}>
 <label className="text-sm font-medium">{measurementField.label}</label>
 <Input
 inputMode="decimal"
 placeholder="0"
 {...form.register(fieldPath, {
 setValueAs: (value) => (value === "" ? undefined : value)
 })}
 />
 {fieldError?.message ? (
 <p className="text-xs text-destructive">{String(fieldError.message)}</p>
 ) : null}
 </div>
 );
 })}
 </div>
 </section>
 )}

 <section className="space-y-4">
 <h3 className="text-xl">4. Tipo de pedido</h3>
 <div className="grid gap-4 md:grid-cols-2">
 {customOrderRequestTypeOptions.map((option) => (
 <label
 className={cn(
 "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
 safeRequestType === option.value
 ? "border-gold-500/55 bg-gold-500/10"
 : "border-border/70 bg-card/40"
 )}
 key={option.value}
 >
 <input
 className="mt-1"
 type="radio"
 value={option.value}
 {...form.register("requestType")}
 />
 <span className="text-sm">{option.label}</span>
 </label>
 ))}
 </div>

 {safeRequestType === "criacao_exclusiva" ? (
 <div className="grid gap-4 rounded-xl border border-border/70 bg-card/40 p-5 md:grid-cols-2">
 <div className="space-y-2 md:col-span-2">
 <p className="text-xs uppercase tracking-[0.24em] text-gold-400">
 Criação exclusiva pelas modelistas
 </p>
 <p className="text-sm text-muted-foreground">
 Tipo de peça selecionada: <strong>{getPieceLabel(safePieceType)}</strong>
 </p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Estilo</label>
 <Input placeholder="Ex.: romantico contemporaneo" {...form.register("exclusiveStyle")} />
 {form.formState.errors.exclusiveStyle ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.exclusiveStyle.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Fechamento</label>
 <Input placeholder="Ex.: botoes frontais, ziper lateral..." {...form.register("exclusiveClosure")} />
 {form.formState.errors.exclusiveClosure ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.exclusiveClosure.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Detalhes específicos</label>
 <Textarea placeholder="Recortes, drapeados, volumes, acabamentos..." {...form.register("exclusiveSpecificDetails")} />
 {form.formState.errors.exclusiveSpecificDetails ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.exclusiveSpecificDetails.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Cor desejada</label>
 <Input placeholder="Ex.: preto fosco, vinho profundo..." {...form.register("exclusiveColor")} />
 {form.formState.errors.exclusiveColor ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.exclusiveColor.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Estampa</label>
 <Input placeholder="Ex.: lisa, floral discreta, geometrica..." {...form.register("exclusivePrint")} />
 {form.formState.errors.exclusivePrint ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.exclusivePrint.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Observações visuais</label>
 <Textarea
 placeholder="Mood desejado, referências de proporção, nivel de estrutura..."
 {...form.register("visualObservations")}
 />
 {form.formState.errors.visualObservations ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.visualObservations.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Campo livre final</label>
 <Textarea
 placeholder="Adicione qualquer instru\u00e7\u00e3o final importante para a equipe."
 {...form.register("finalNotes")}
 />
 </div>
 </div>
 ) : (
 <div className="space-y-2">
 <label className="text-sm font-medium">Observações da referência</label>
 <Textarea
 placeholder="Explique o que deseja manter ou adaptar nas referências enviadas."
 {...form.register("referenceNotes")}
 />
 </div>
 )}
 </section>

 <section className="space-y-4">
 <h3 className="text-xl">5. Tecidos, classificação e aviamentos</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Tipo de tecido</label>
 <select className={nativeSelectClassName} {...form.register("fabricType")}>
 {customOrderFabricOptions.map((fabric) => (
 <option key={fabric.value} value={fabric.value}>
 {fabric.label}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Classificação do tecido</label>
 <select className={nativeSelectClassName} {...form.register("fabricTier")}>
 {customOrderFabricTierAdjustments.map((tierOption) => (
 <option key={tierOption.value} value={tierOption.value}>
 {tierOption.label}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Complexidade</label>
 <select className={nativeSelectClassName} {...form.register("complexity")}>
 {customOrderComplexityOptions.map((complexityOption) => (
 <option key={complexityOption.value} value={complexityOption.value}>
 {complexityOption.label}
 </option>
 ))}
 </select>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 p-3 text-sm">
 <input type="checkbox" {...form.register("hasElastane")} />
 Tem elastano ?
 </label>
 <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/40 p-3 text-sm">
 <input type="checkbox" {...form.register("hasLining")} />
 Havera forro ?
 </label>
 </div>
 </div>

 <div className="space-y-3">
 <p className="text-sm font-medium">Aviamentos (seleção multipla)</p>
 <div className="grid gap-2 md:grid-cols-2">
 {customOrderNotionOptions.map((notion) => {
 const selected = safeSelectedNotions.includes(notion.value as CustomOrderNotion);
 return (
 <label
 className={cn(
 "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
 selected
 ? "border-gold-500/60 bg-gold-500/10"
 : "border-border/70 bg-card/40"
 )}
 key={notion.value}
 >
 <span className="inline-flex items-center gap-2">
 <input
 checked={selected}
 onChange={() => toggleNotion(notion.value as CustomOrderNotion)}
 type="checkbox"
 />
 {notion.label}
 </span>
 <strong>+{formatCurrencyBRL(notion.extraCost)}</strong>
 </label>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground">
 Aviamentos sugeridos são pre-marcados automaticamente conforme a peça escolhida.
 </p>
 </div>
 </section>

 <section className="space-y-4">
 <h3 className="text-xl">6. Anexos</h3>
 <div className="rounded-xl border border-dashed border-gold-500/45 bg-card/35 p-5">
 <div className="flex flex-wrap items-center gap-3">
 <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:border-gold-500 hover:text-gold-400">
 <UploadCloud className="h-4 w-4" />
 Adicionar imagem/PDF
 <input
 accept=".jpg,.jpeg,.png,.webp,.pdf"
 className="hidden"
 multiple
 onChange={handleAttachmentSelect}
 type="file"
 />
 </label>
 <p className="text-xs text-muted-foreground">
 Ate {customOrderMaxAttachments} arquivos (JPG, PNG, WEBP e PDF, max 15MB cada).
 </p>
 </div>

 {form.formState.errors.attachmentCount ? (
 <p className="mt-2 text-xs text-destructive">
 {form.formState.errors.attachmentCount.message}
 </p>
 ) : null}

 {attachments.length > 0 ? (
 <div className="mt-4 grid gap-3 md:grid-cols-2">
 {attachments.map((attachment) => (
 <div
 className="rounded-lg border border-border/70 bg-card/60 p-3"
 key={attachment.localId}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 space-y-1">
 <p className="truncate text-sm font-medium">{attachment.file.name}</p>
 <p className="text-xs text-muted-foreground">
 {(attachment.file.size / (1024 * 1024)).toFixed(2)} MB
 </p>
 <p className="text-xs text-muted-foreground">
 {attachment.uploaded ? "Anexo já salvo no pedido." : "Aguardando upload"}
 </p>
 </div>
 {!attachment.uploaded ? (
 <Button
 onClick={() => removeAttachment(attachment.localId)}
 size="icon"
 type="button"
 variant="ghost"
 >
 <X className="h-4 w-4" />
 </Button>
 ) : null}
 </div>

 {attachment.isImage && attachment.previewUrl ? (
 <Image
 alt={attachment.file.name}
 className="mt-3 h-40 w-full rounded-md border border-border/70 object-cover"
 height={160}
 src={attachment.previewUrl}
 unoptimized
 width={320}
 />
 ) : (
 <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-xs">
 <FileText className="h-4 w-4 text-gold-400" />
 Preview de PDF disponível após download
 </div>
 )}
 </div>
 ))}
 </div>
 ) : null}
 </div>
 </section>

 <section className="space-y-4">
 <h3 className="text-xl">7. Prazo e pré-orçamento</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2">
 <label className="text-sm font-medium">Prazo desejado</label>
 <Input type="date" {...form.register("desiredDeadline")} />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">Motivo do prazo desejado</label>
 <Input
 placeholder="Ex.: evento social em data específica"
 {...form.register("desiredDeadlineReason")}
 />
 </div>
 </div>

 <Card className="border-gold-500/45 bg-gold-500/10">
 <CardContent className="space-y-3 p-5">
 <p className="text-xs uppercase tracking-[0.24em] text-gold-400">Pré-orçamento</p>
 <p className="text-3xl font-semibold text-gold-400">
 a partir de {formatCurrencyBRL(estimatedBreakdown.estimatedTotal)}
 </p>
 <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
 <p>Base da peça: {formatCurrencyBRL(estimatedBreakdown.basePrice)}</p>
 <p>
 Complexidade: +{(estimatedBreakdown.complexityPercentage * 100).toFixed(0)}%
 </p>
 <p>
 Tecido: +{(estimatedBreakdown.fabricTierPercentage * 100).toFixed(0)}%
 </p>
 <p>Aviamentos: {formatCurrencyBRL(estimatedBreakdown.notionsTotal)}</p>
 </div>
 <p className="text-xs leading-relaxed text-muted-foreground">
 {customOrderEstimateDisclaimer}
 </p>
 </CardContent>
 </Card>
 </section>

 <section className="space-y-4">
 <h3 className="text-xl">8. Enviar para análise</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Nome completo</label>
 <Input placeholder="Seu nome completo" {...form.register("contactFullName")} />
 {form.formState.errors.contactFullName ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.contactFullName.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">E-mail</label>
 <Input
 placeholder="voce@email.com"
 type="email"
 {...form.register("contactEmail")}
 />
 {form.formState.errors.contactEmail ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.contactEmail.message}
 </p>
 ) : null}
 </div>

 {hasSavedContact ? (
 <div className="space-y-2">
 <label className="text-sm font-medium">Contato já salvo</label>
 <div className="rounded-lg border border-gold-500/35 bg-gold-500/10 px-3 py-2 text-sm text-muted-foreground">
 Vamos reutilizar o contato do seu perfil neste pedido:{" "}
 <strong className="text-foreground">{savedContactLabel}</strong>.
 </div>
 </div>
 ) : (
 <div className="space-y-2">
 <label className="text-sm font-medium">Informe seu contato</label>
 <Input
 inputMode="numeric"
 onChange={(event) => {
 form.setValue("contactWhatsapp", formatPhoneBR(event.target.value), {
 shouldDirty: true,
 shouldValidate: true
 });
 }}
 placeholder="(11) 99999-9999"
 value={contactWhatsapp ?? ""}
 />
 <p className="text-xs text-muted-foreground">
 Pode ser telefone ou WhatsApp com DDD para a equipe retornar sobre a encomenda.
 </p>
 {form.formState.errors.contactWhatsapp ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.contactWhatsapp.message}
 </p>
 ) : null}
 </div>
 )}
 </div>

 <div className="space-y-2 rounded-lg border border-border/70 bg-card/40 p-4">
 <label className="flex items-start gap-2 text-sm">
 <input type="checkbox" {...form.register("acceptedTerms")} />
 <span>Li e aceito os Termos e Condições do pedido sob medida.</span>
 </label>
 {form.formState.errors.acceptedTerms ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.acceptedTerms.message}
 </p>
 ) : null}

 <label className="flex items-start gap-2 text-sm">
 <input type="checkbox" {...form.register("acceptedEstimateAwareness")} />
 <span>
 Estou ciente de que o valor exibido e apenas estimado e pode mudar após análise técnica.
 </span>
 </label>
 {form.formState.errors.acceptedEstimateAwareness ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.acceptedEstimateAwareness.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1 text-xs text-muted-foreground">
 <p>{customOrderCancellationPolicyText.beforeAnalysis}</p>
 <p>{customOrderCancellationPolicyText.afterAnalysisBeforePayment}</p>
 <p>{customOrderCancellationPolicyText.afterPayment}</p>
 </div>
 </section>

 {feedbackMessage ? (
 <div
 className={cn(
 "rounded-md border px-3 py-2 text-sm",
 feedbackType === "success" && "border-green-500/40 bg-green-500/10 text-green-500",
 feedbackType === "warning" && "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
 feedbackType === "error" && "border-destructive/40 bg-destructive/10 text-destructive"
 )}
 >
 {feedbackMessage}
 </div>
 ) : null}

 <div className="flex flex-wrap items-center gap-3">
 <Button
 disabled={Boolean(persistingOperation)}
 onClick={() => persistOrder("save_draft")}
 type="button"
 variant="outline"
 >
 {persistingOperation === "save_draft" ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Salvando rascunho...
 </>
 ) : (
 "Salvar como rascunho"
 )}
 </Button>

 <Button
 disabled={Boolean(persistingOperation)}
 onClick={() => persistOrder("submit_analysis")}
 type="button"
 >
 {persistingOperation === "submit_analysis" ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Enviando...
 </>
 ) : (
 "Enviar para análise"
 )}
 </Button>

 {canCancelCurrentOrder ? (
 <Button
 disabled={isCancelling}
 onClick={handleCancelOrder}
 type="button"
 variant="ghost"
 >
 {isCancelling ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Cancelando...
 </>
 ) : (
 "Cancelar pedido"
 )}
 </Button>
 ) : null}
 </div>
 </CardContent>
 </Card>

 {persistedOrder ? (
 <Card className="border-gold-600/35">
 <CardHeader>
 <CardTitle className="inline-flex items-center gap-2">
 <CheckCircle2 className="h-5 w-5 text-gold-400" />
 Resumo do pedido
 </CardTitle>
 <CardDescription>
 Protocolo {persistedOrder.protocolCode} registrado com status atual:{" "}
 <strong>{persistedOrder.statusLabel}</strong>.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 <div className="rounded-lg border border-border/70 bg-card/40 p-3">
 <p className="text-xs text-muted-foreground">Protocolo</p>
 <p className="mt-1 font-semibold text-gold-400">{persistedOrder.protocolCode}</p>
 </div>
 <div className="rounded-lg border border-border/70 bg-card/40 p-3">
 <p className="text-xs text-muted-foreground">Público</p>
 <p className="mt-1 font-semibold">{persistedOrder.audienceLabel}</p>
 </div>
 <div className="rounded-lg border border-border/70 bg-card/40 p-3">
 <p className="text-xs text-muted-foreground">Modo</p>
 <p className="mt-1 font-semibold">{persistedOrder.productionModeLabel}</p>
 </div>
 <div className="rounded-lg border border-border/70 bg-card/40 p-3">
 <p className="text-xs text-muted-foreground">Pré-orçamento</p>
 <p className="mt-1 font-semibold text-gold-400">
 a partir de {formatCurrencyBRL(persistedOrder.estimatedTotal)}
 </p>
 </div>
 </div>

 <div className="space-y-3">
 <p className="text-sm font-medium">Faixa de atendimento / status inicial</p>
 <div className="grid gap-2">
 {customOrderInitialStatusFlow.map((status) => {
 const currentIndex = getStatusIndex(persistedOrder.status);
 const itemIndex = getStatusIndex(status);
 const isCompleted = currentIndex >= 0 && itemIndex <= currentIndex;
 const isCurrent = persistedOrder.status === status;

 return (
 <div
 className={cn(
 "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
 isCompleted
 ? "border-gold-500/45 bg-gold-500/10"
 : "border-border/70 bg-card/30"
 )}
 key={status}
 >
 {isCurrent ? (
 <CheckCircle2 className="h-4 w-4 text-gold-400" />
 ) : (
 <ImageIcon className="h-4 w-4 text-muted-foreground" />
 )}
 <span>{customOrderStatusLabels[status]}</span>
 </div>
 );
 })}
 </div>
 </div>

 <div className="rounded-lg border border-gold-500/40 bg-gold-500/10 p-4 text-sm">
 <p className="font-medium text-gold-400">Prosseguir via WhatsApp</p>
 <p className="mt-1 text-muted-foreground">
 Para acelerar o atendimento, envie seu protocolo para o WhatsApp da equipe.
 </p>
 <a
 className="mt-3 inline-flex items-center gap-2 text-gold-400 transition-colors hover:text-gold-500"
 href={buildWhatsappLink(persistedOrder.protocolCode)}
 rel="noopener noreferrer"
 target="_blank"
 >
 Abrir conversa no WhatsApp
 </a>
 </div>

 {persistedOrder.status === "cancelado_pela_cliente" ? (
 <div className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
 <AlertTriangle className="h-4 w-4" />
 Pedido cancelado pela cliente na plataforma.
 </div>
 ) : null}
 </CardContent>
 </Card>
 ) : null}
 </div>
 );
}
