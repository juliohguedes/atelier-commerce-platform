import { z } from "zod";
import {
 customOrderInternalStatusOptions,
 paymentStatusOptions,
 storeOrderInternalStatusOptions
} from "@/lib/constants/internal-panels";
import { userRoles } from "@/types/auth";

const localDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const localDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
 z.preprocess((value) => {
 if (typeof value !== "string") {
 return value;
 }

 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : undefined;
 }, schema.optional());

const positiveCurrencyField = emptyToUndefined(
 z.coerce
 .number()
 .min(0, "Valor não pode ser negativo.")
 .max(1000000, "Valor acima do limite permitido.")
);

export const adminPanelFiltersSchema = z.object({
 status: z
 .enum([
 "todos",
 "novos",
 "em_analise",
 "aguardando_pagamento",
 "em_producao",
 "pronto_para_envio",
 "enviados",
 "entregues"
 ])
 .default("todos"),
 protocol: emptyToUndefined(z.string().max(80)),
 name: emptyToUndefined(z.string().max(120)),
 dateFrom: emptyToUndefined(z.string().regex(localDateRegex)),
 dateTo: emptyToUndefined(z.string().regex(localDateRegex)),
 query: emptyToUndefined(z.string().max(160)),
 selected: emptyToUndefined(z.string().uuid())
});

export const financePanelFiltersSchema = z.object({
 status: z
 .enum([
 "todos",
 "aguardando_orcamento",
 "aguardando_pagamento",
 "pagamentos_aprovados",
 "frete_pendente",
 "nota_fiscal_pendente",
 "notas_emitidas"
 ])
 .default("todos"),
 protocol: emptyToUndefined(z.string().max(80)),
 name: emptyToUndefined(z.string().max(120)),
 paymentStatus: z.enum(["todos", ...paymentStatusOptions]).default("todos"),
 invoiceStatus: z.enum(["todos", "com_nota", "sem_nota"]).default("todos"),
 financialStatus: z
 .enum([
 "todos",
 "pending_quote",
 "pending_payment",
 "payment_approved",
 "pending_shipping",
 "pending_invoice",
 "invoice_issued"
 ])
 .default("todos"),
 dateFrom: emptyToUndefined(z.string().regex(localDateRegex)),
 dateTo: emptyToUndefined(z.string().regex(localDateRegex)),
 query: emptyToUndefined(z.string().max(160)),
 selected: emptyToUndefined(z.string().uuid())
});

export const salesStockPanelFiltersSchema = z.object({
 productStatus: z
 .enum(["todos", "ativos", "inativos", "baixo_estoque", "indisponiveis"])
 .default("todos"),
 orderStatus: z.enum(["todos", ...storeOrderInternalStatusOptions]).default("todos"),
 productQuery: emptyToUndefined(z.string().max(160)),
 orderQuery: emptyToUndefined(z.string().max(160)),
 selectedProduct: emptyToUndefined(z.string().uuid()),
 selectedOrder: emptyToUndefined(z.string().uuid())
});

export const adminUpdateOrderStatusSchema = z.object({
 orderPublicId: z.string().uuid("Pedido invalido."),
 status: z.enum(customOrderInternalStatusOptions),
 note: emptyToUndefined(z.string().max(240))
});

export const adminInternalAccessSchema = z.object({
 fullName: z.string().trim().min(2, "Informe o nome completo.").max(120),
 email: z.string().trim().email("E-mail invalido."),
 role: z.enum(["admin", "finance", "sales_stock"]),
 isPrimary: z.boolean().default(true)
});

export const adminCalendarEventSchema = z
 .object({
 title: z.string().trim().min(2, "Informe um titulo para o evento.").max(120),
 description: emptyToUndefined(z.string().max(500)),
 startsAt: z.string().regex(localDateTimeRegex, "Data inicial invalida."),
 endsAt: emptyToUndefined(z.string().regex(localDateTimeRegex, "Data final invalida.")),
 responsibleRole: emptyToUndefined(z.enum(userRoles)),
 isAllDay: z.boolean().default(false)
 })
 .refine((value) => !value.endsAt || value.endsAt >= value.startsAt, {
 message: "A data final não pode ser anterior a data inicial.",
 path: ["endsAt"]
 });

export const adminMaintenanceModeSchema = z
 .object({
 enabled: z.boolean(),
 message: z.string().trim().min(4, "Informe a mensagem da manutenção.").max(220),
 startsAt: emptyToUndefined(z.string().regex(localDateTimeRegex, "Data inicial invalida.")),
 endsAt: emptyToUndefined(z.string().regex(localDateTimeRegex, "Data final invalida.")),
 allowRoles: z
 .array(z.enum(userRoles))
 .min(1, "Selecione ao menos um papel liberado durante a manutenção.")
 })
 .refine((value) => !value.endsAt || !value.startsAt || value.endsAt >= value.startsAt, {
 message: "A data final não pode ser anterior a data inicial.",
 path: ["endsAt"]
 });

export const financeUpdateOrderSchema = z
 .object({
 orderType: z.enum(["custom_order", "store_order"]),
 orderPublicId: z.string().uuid("Pedido invalido."),
 unlockPassword: z.string().min(4, "Senha de desbloqueio obrigatória."),
 notifyChannel: z.enum(["in_app", "email", "whatsapp"]).default("in_app"),
 finalAmount: positiveCurrencyField,
 quoteSummary: emptyToUndefined(z.string().max(1200)),
 paymentStatus: z.enum(paymentStatusOptions).optional(),
 paymentMethod: z.enum(["pix", "cartao"]).optional(),
 paymentReference: emptyToUndefined(z.string().max(120)),
 shippingCost: positiveCurrencyField,
 trackingCode: emptyToUndefined(z.string().max(120)),
 trackingLink: emptyToUndefined(z.string().url("Link de rastreio invalido.")),
 invoiceUrl: emptyToUndefined(z.string().url("URL da nota fiscal invalida.")),
 invoicePayloadNote: emptyToUndefined(z.string().max(1000)),
 operationSummary: emptyToUndefined(z.string().max(240))
 })
 .refine(
 (value) =>
 value.finalAmount !== undefined ||
 value.quoteSummary !== undefined ||
 value.paymentStatus !== undefined ||
 value.paymentMethod !== undefined ||
 value.paymentReference !== undefined ||
 value.shippingCost !== undefined ||
 value.trackingCode !== undefined ||
 value.trackingLink !== undefined ||
 value.invoiceUrl !== undefined ||
 value.invoicePayloadNote !== undefined,
 {
 message: "Informe ao menos um campo para atualizar.",
 path: ["operationSummary"]
 }
 );

export const salesUpdateProductOperationalSchema = z.object({
 productId: z.string().uuid("Produto invalido."),
 name: z.string().trim().min(2).max(120),
 shortDescription: emptyToUndefined(z.string().max(220)),
 description: emptyToUndefined(z.string().max(5000)),
 categoryId: emptyToUndefined(z.string().uuid()),
 collectionId: emptyToUndefined(z.string().uuid()),
 isActive: z.boolean(),
 isFeatured: z.boolean(),
 sortOrder: z.coerce.number().int().min(0).max(9999)
});

export const salesUpdateVariantStockSchema = z.object({
 variantId: z.string().uuid("Variação invalida."),
 stockQuantity: z.coerce.number().int().min(0).max(100000),
 isActive: z.boolean()
});

export type AdminPanelFiltersInput = z.input<typeof adminPanelFiltersSchema>;
export type AdminPanelFilters = z.output<typeof adminPanelFiltersSchema>;

export type FinancePanelFiltersInput = z.input<typeof financePanelFiltersSchema>;
export type FinancePanelFilters = z.output<typeof financePanelFiltersSchema>;

export type SalesStockPanelFiltersInput = z.input<typeof salesStockPanelFiltersSchema>;
export type SalesStockPanelFilters = z.output<typeof salesStockPanelFiltersSchema>;

export type AdminUpdateOrderStatusInput = z.output<typeof adminUpdateOrderStatusSchema>;
export type AdminInternalAccessInput = z.output<typeof adminInternalAccessSchema>;
export type AdminCalendarEventInput = z.output<typeof adminCalendarEventSchema>;
export type AdminMaintenanceModeInput = z.output<typeof adminMaintenanceModeSchema>;

export type FinanceUpdateOrderInput = z.output<typeof financeUpdateOrderSchema>;

export type SalesUpdateProductOperationalInput = z.output<
 typeof salesUpdateProductOperationalSchema
>;

export type SalesUpdateVariantStockInput = z.output<typeof salesUpdateVariantStockSchema>;
