import { z } from "zod";

const paymentMethodValues = ["pix", "cartao"] as const;
const deliveryModeValues = ["entrega", "retirada"] as const;
const appointmentTypeValues = ["tirar_medidas", "alinhamento_pedido", "retirada"] as const;
const appointmentModeValues = ["online", "presencial"] as const;
const reviewTargetTypeValues = ["custom_order", "store_order"] as const;

const optionalTrimmedString = z
 .string()
 .trim()
 .optional()
 .transform((value) => (value && value.length > 0 ? value : undefined));

function isValidDateTime(value: string): boolean {
 const parsedDate = new Date(value);
 return !Number.isNaN(parsedDate.getTime());
}

export const customOrderQuoteApprovalSchema = z.object({
 orderPublicId: z.string().uuid()
});

export const customOrderPaymentConfirmationSchema = z.object({
 orderPublicId: z.string().uuid(),
 paymentMethod: z.enum(paymentMethodValues),
 confirmationAccepted: z
 .boolean()
 .refine((value) => value, "Confirme que o pagamento inicia a produção.")
});

export const customOrderDeliveryPreferenceSchema = z.object({
 orderPublicId: z.string().uuid(),
 deliveryMode: z.enum(deliveryModeValues)
});

export const customOrderAppointmentSchema = z.object({
 orderPublicId: z.string().uuid().optional(),
 appointmentType: z.enum(appointmentTypeValues),
 attendanceMode: z.enum(appointmentModeValues),
 scheduledFor: z
 .string()
 .trim()
 .refine(isValidDateTime, "Informe uma data e horário validos."),
 notes: optionalTrimmedString
});

export const clientReviewSubmissionSchema = z
 .object({
 targetType: z.enum(reviewTargetTypeValues),
 customOrderPublicId: z.string().uuid().optional(),
 storeOrderPublicId: z.string().uuid().optional(),
 rating: z.number().int().min(1).max(5),
 headline: optionalTrimmedString,
 comment: z.string().trim().min(10, "Escreva ao menos 10 caracteres.")
 })
 .superRefine((data, context) => {
 if (data.targetType === "custom_order" && !data.customOrderPublicId) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["customOrderPublicId"],
 message: "Pedido sob medida não informado."
 });
 }

 if (data.targetType === "store_order" && !data.storeOrderPublicId) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["storeOrderPublicId"],
 message: "Pedido da loja não informado."
 });
 }
 });

export const accountDeletionRequestSchema = z.object({
 reason: z
 .string()
 .trim()
 .min(10, "Informe o motivo com mais detalhes.")
 .max(1000, "Use até 1000 caracteres no motivo.")
});

export type CustomOrderQuoteApprovalInput = z.input<typeof customOrderQuoteApprovalSchema>;
export type CustomOrderQuoteApprovalPayload = z.output<typeof customOrderQuoteApprovalSchema>;

export type CustomOrderPaymentConfirmationInput = z.input<
 typeof customOrderPaymentConfirmationSchema
>;
export type CustomOrderPaymentConfirmationPayload = z.output<
 typeof customOrderPaymentConfirmationSchema
>;

export type CustomOrderDeliveryPreferenceInput = z.input<
 typeof customOrderDeliveryPreferenceSchema
>;
export type CustomOrderDeliveryPreferencePayload = z.output<
 typeof customOrderDeliveryPreferenceSchema
>;

export type CustomOrderAppointmentInput = z.input<typeof customOrderAppointmentSchema>;
export type CustomOrderAppointmentPayload = z.output<typeof customOrderAppointmentSchema>;

export type ClientReviewSubmissionInput = z.input<typeof clientReviewSubmissionSchema>;
export type ClientReviewSubmissionPayload = z.output<typeof clientReviewSubmissionSchema>;

export type AccountDeletionRequestInput = z.input<typeof accountDeletionRequestSchema>;
export type AccountDeletionRequestPayload = z.output<typeof accountDeletionRequestSchema>;
