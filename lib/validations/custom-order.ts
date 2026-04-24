import { z } from "zod";
import { isValidBrazilPhone, onlyDigits } from "@/lib/validations/br";

const customOrderAudienceValues = ["feminino", "masculino"] as const;
const customOrderProductionModeValues = ["larga_escala", "sob_medida"] as const;
const customOrderRequestTypeValues = ["referencia_imagem", "criacao_exclusiva"] as const;
const customOrderSizeValues = ["PP", "P", "M", "G", "GG", "OUTROS"] as const;
const customOrderModelingValues = ["justa", "padrao", "solta", "oversized"] as const;
const customOrderPieceValues = [
 "blazer",
 "blusa",
 "calca",
 "camisa",
 "casaco",
 "colete",
 "conjunto",
 "corset",
 "jaqueta",
 "macacao",
 "outros",
 "saia",
 "short",
 "sobretudo",
 "terno",
 "vestido"
] as const;
const customOrderFabricValues = [
 "algodao",
 "alfaiataria",
 "cetim",
 "chiffon",
 "couro_sintetico",
 "crepe",
 "jeans",
 "laise",
 "linho",
 "malha",
 "moletom",
 "organza",
 "renda",
 "seda",
 "tule",
 "veludo",
 "viscose",
 "outros"
] as const;
const customOrderFabricTierValues = ["simples", "intermediario", "nobre", "outros"] as const;
const customOrderComplexityValues = ["basica", "intermediaria", "avancada", "premium"] as const;
const customOrderNotionValues = [
 "botoes",
 "ziper_comum",
 "ziper_invisivel",
 "ziper_tratorado",
 "colchetes",
 "elastico",
 "entretela",
 "forro",
 "renda",
 "bojo",
 "ombreira",
 "amarracao",
 "barbatanas",
 "vies_acabamento"
] as const;

const operationValues = ["save_draft", "submit_analysis"] as const;

const optionalTrimmedString = z
 .string()
 .trim()
 .optional()
 .transform((value) => (value && value.length > 0 ? value : undefined));

const measurementValueSchema = z
 .union([z.string(), z.number()])
 .transform((value) => (typeof value === "string" ? Number(value.replace(",", ".")) : value))
 .refine((value) => Number.isFinite(value), "Informe um número valido.")
 .transform((value) => Number(value))
 .refine((value) => value > 0, "Informe um valor maior que zero.")
 .refine((value) => value <= 300, "Informe um valor de medida até 300 cm.");

export const customOrderMeasurementsSchema = z.object({
 pescoco: measurementValueSchema.optional(),
 braco: measurementValueSchema.optional(),
 ombro: measurementValueSchema.optional(),
 busto: measurementValueSchema.optional(),
 cintura: measurementValueSchema.optional(),
 quadril: measurementValueSchema.optional(),
 coxa: measurementValueSchema.optional(),
 comprimento_manga: measurementValueSchema.optional(),
 comprimento_pernas: measurementValueSchema.optional()
});

export const customOrderPayloadSchema = z
 .object({
 operation: z.enum(operationValues),
 existingOrderPublicId: z.string().uuid().optional(),
 audience: z.enum(customOrderAudienceValues),
 productionMode: z.enum(customOrderProductionModeValues),
 requestType: z.enum(customOrderRequestTypeValues),
 pieceType: z.enum(customOrderPieceValues),
 pieceTypeOther: optionalTrimmedString,
 sizeStandard: z.enum(customOrderSizeValues).optional(),
 sizeOther: optionalTrimmedString,
 modeling: z.enum(customOrderModelingValues).optional(),
 pieceLength: optionalTrimmedString,
 measurements: customOrderMeasurementsSchema,
 attachmentCount: z.number().int().min(0).max(10),
 referenceNotes: optionalTrimmedString,
 exclusiveStyle: optionalTrimmedString,
 exclusiveClosure: optionalTrimmedString,
 exclusiveSpecificDetails: optionalTrimmedString,
 fabricType: z.enum(customOrderFabricValues),
 fabricTier: z.enum(customOrderFabricTierValues),
 hasElastane: z.boolean().optional(),
 hasLining: z.boolean().optional(),
 notions: z.array(z.enum(customOrderNotionValues)).max(14),
 complexity: z.enum(customOrderComplexityValues),
 desiredDeadline: optionalTrimmedString,
 desiredDeadlineReason: optionalTrimmedString,
 exclusiveColor: optionalTrimmedString,
 exclusivePrint: optionalTrimmedString,
 visualObservations: optionalTrimmedString,
 finalNotes: optionalTrimmedString,
 requiresContact: z.boolean().default(true),
 contactFullName: optionalTrimmedString,
 contactEmail: optionalTrimmedString,
 contactWhatsapp: optionalTrimmedString,
 acceptedTerms: z.boolean(),
 acceptedEstimateAwareness: z.boolean()
 })
 .superRefine((data, context) => {
 const isSubmit = data.operation === "submit_analysis";

 if (data.pieceType === "outros" && !data.pieceTypeOther) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["pieceTypeOther"],
 message: "Descreva o tipo de peça em Outros."
 });
 }

 if (isSubmit && data.productionMode === "larga_escala") {
 if (!data.sizeStandard) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["sizeStandard"],
 message: "Selecione um tamanho."
 });
 }

 if (data.sizeStandard === "OUTROS" && !data.sizeOther) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["sizeOther"],
 message: "Informe o tamanho personalizado."
 });
 }

 if (!data.modeling) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["modeling"],
 message: "Selecione a modelagem."
 });
 }

 if (!data.pieceLength) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["pieceLength"],
 message: "Informe o comprimento desejado."
 });
 }
 }

 if (isSubmit && data.productionMode === "sob_medida") {
 const requiredMeasurements = [
 "pescoco",
 "braco",
 "ombro",
 "busto",
 "cintura",
 "quadril",
 "coxa",
 "comprimento_manga",
 "comprimento_pernas"
 ] as const;

 requiredMeasurements.forEach((measurementKey) => {
 if (typeof data.measurements[measurementKey] !== "number") {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["measurements", measurementKey],
 message: "Informe esta medida."
 });
 }
 });
 }

 if (isSubmit && data.requestType === "criacao_exclusiva") {
 const requiredExclusiveFields = [
 "exclusiveStyle",
 "exclusiveClosure",
 "exclusiveSpecificDetails",
 "exclusiveColor",
 "exclusivePrint",
 "visualObservations"
 ] as const;

 requiredExclusiveFields.forEach((fieldName) => {
 if (!data[fieldName]) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: [fieldName],
 message: "Preencha este campo para criação exclusiva."
 });
 }
 });
 }

 if (isSubmit && data.requestType === "referencia_imagem") {
 if (data.attachmentCount < 1) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["attachmentCount"],
 message: "Adicione ao menos uma imagem ou PDF de referência."
 });
 }
 }

 if (isSubmit) {
 if (!data.contactFullName || data.contactFullName.length < 3) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["contactFullName"],
 message: "Informe seu nome completo."
 });
 }

 if (!data.contactEmail || !z.string().email().safeParse(data.contactEmail).success) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["contactEmail"],
 message: "Informe um e-mail valido."
 });
 }

 if (
 data.requiresContact &&
 (!data.contactWhatsapp || !isValidBrazilPhone(data.contactWhatsapp))
 ) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["contactWhatsapp"],
 message: "Informe um contato valido com DDD."
 });
 }

 if (!data.acceptedTerms) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["acceptedTerms"],
 message: "Você precisa aceitar os termos para continuar."
 });
 }

 if (!data.acceptedEstimateAwareness) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["acceptedEstimateAwareness"],
 message: "Confirme a ciencia sobre valor estimado."
 });
 }
 }
 });

export const customOrderAttachmentRegistrationSchema = z.object({
 orderPublicId: z.string().uuid(),
 contactEmail: z
 .string()
 .trim()
 .email()
 .optional()
 .transform((value) => (value ? value.toLowerCase() : undefined)),
 attachments: z
 .array(
 z.object({
 storagePath: z.string().min(1),
 originalFileName: z.string().min(1),
 mimeType: z.string().min(1),
 fileSizeBytes: z.number().int().positive()
 })
 )
 .max(10)
});

export const customOrderCancelSchema = z.object({
 orderPublicId: z.string().uuid(),
 contactEmail: z
 .string()
 .trim()
 .email()
 .optional()
 .transform((value) => (value ? value.toLowerCase() : undefined)),
 whatsapp: z
 .string()
 .trim()
 .optional()
 .transform((value) => (value ? onlyDigits(value) : undefined))
});

export type CustomOrderPayloadInput = z.input<typeof customOrderPayloadSchema>;
export type CustomOrderPayload = z.output<typeof customOrderPayloadSchema>;

export type CustomOrderAttachmentRegistrationInput = z.input<
 typeof customOrderAttachmentRegistrationSchema
>;
export type CustomOrderAttachmentRegistrationPayload = z.output<
 typeof customOrderAttachmentRegistrationSchema
>;

export type CustomOrderCancelInput = z.input<typeof customOrderCancelSchema>;
export type CustomOrderCancelPayload = z.output<typeof customOrderCancelSchema>;
