import { z } from "zod";
import { isValidCep, isValidCpf, normalizeStateCode, onlyDigits } from "@/lib/validations/br";
import { storeSortOptions } from "@/types/store";

const quantitySchema = z
 .number()
 .int("Quantidade invalida.")
 .min(1, "Quantidade minima: 1.")
 .max(20, "Quantidade maxima por item: 20.");

const optionalTrimmedString = z
 .string()
 .trim()
 .optional()
 .transform((value) => (value && value.length > 0 ? value : undefined));

export const storeCatalogSearchSchema = z.object({
 categoria: optionalTrimmedString,
 colecao: optionalTrimmedString,
 tamanho: optionalTrimmedString,
 cor: optionalTrimmedString,
 precoMin: z
 .string()
 .trim()
 .optional()
 .transform((value) => {
 if (!value) {
 return undefined;
 }

 const parsed = Number(value.replace(",", "."));
 return Number.isFinite(parsed) ? parsed : undefined;
 }),
 precoMax: z
 .string()
 .trim()
 .optional()
 .transform((value) => {
 if (!value) {
 return undefined;
 }

 const parsed = Number(value.replace(",", "."));
 return Number.isFinite(parsed) ? parsed : undefined;
 }),
 sort: z.enum(storeSortOptions).optional().default("destaque")
});

export const addToCartSchema = z.object({
 variantId: z.string().uuid("Variação invalida."),
 quantity: quantitySchema.default(1)
});

export const updateCartItemSchema = z.object({
 cartItemId: z.string().uuid("Item de carrinho invalido."),
 quantity: quantitySchema
});

export const removeCartItemSchema = z.object({
 cartItemId: z.string().uuid("Item de carrinho invalido.")
});

export const moveCartItemSchema = z.object({
 cartItemId: z.string().uuid("Item de carrinho invalido.")
});

export const moveSavedItemSchema = z.object({
 savedItemId: z.string().uuid("Item salvo invalido.")
});

export const removeSavedItemSchema = z.object({
 savedItemId: z.string().uuid("Item salvo invalido.")
});

export const toggleWishlistSchema = z.object({
 productId: z.string().uuid("Produto invalido."),
 variantId: z
 .string()
 .uuid("Variação invalida.")
 .optional(),
 notifyOnRestock: z.boolean().optional().default(true)
});

export const checkoutAddressSchema = z.object({
 label: z
 .string()
 .trim()
 .max(60, "Use no máximo 60 caracteres para o identificador.")
 .optional()
 .transform((value) => (value ? value : undefined)),
 recipientName: z.string().trim().min(3, "Informe quem recebe."),
 zipCode: z
 .string()
 .trim()
 .refine(isValidCep, "Informe um CEP valido.")
 .transform(onlyDigits),
 street: z.string().trim().min(3, "Informe a rua."),
 number: z.string().trim().min(1, "Informe o número."),
 complement: z
 .string()
 .trim()
 .max(80, "Use no máximo 80 caracteres no complemento.")
 .optional()
 .transform((value) => (value ? value : undefined)),
 neighborhood: z.string().trim().min(2, "Informe o bairro."),
 city: z.string().trim().min(2, "Informe a cidade."),
 state: z
 .string()
 .trim()
 .refine((value) => normalizeStateCode(value).length === 2, "Informe o UF com 2 letras.")
 .transform(normalizeStateCode)
});

export const createStoreOrderSchema = z
 .object({
 shippingMode: z.enum(["saved", "new"], {
 message: "Selecione endereço salvo ou novo."
 }),
 savedAddressId: z.string().uuid("Endereço invalido.").optional(),
 newAddress: checkoutAddressSchema.optional(),
 useSameAddressForBilling: z.boolean().default(true),
 requiresCpf: z.boolean().default(false),
 customerCpf: z
 .string()
 .trim()
 .optional()
 .transform((value) => (value ? value : undefined)),
 paymentMethod: z.enum(["pix", "cartao"], {
 message: "Selecione PIX ou cartao."
 }),
 notes: optionalTrimmedString
 })
 .superRefine((data, context) => {
 if (data.shippingMode === "saved" && !data.savedAddressId) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["savedAddressId"],
 message: "Selecione um endereço salvo."
 });
 }

 if (data.shippingMode === "new" && !data.newAddress) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["newAddress"],
 message: "Informe o novo endereço para entrega."
 });
 }

 if (data.customerCpf && !isValidCpf(data.customerCpf)) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["customerCpf"],
 message: "Informe um CPF valido."
 });
 }

 if (data.requiresCpf && !data.customerCpf) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["customerCpf"],
 message: "Informe o CPF para seguir para pagamento."
 });
 }
 });

export const confirmStorePaymentSchema = z.object({
 orderPublicId: z.string().uuid("Pedido invalido."),
 paymentReference: optionalTrimmedString
});

export type StoreCatalogSearchInput = z.input<typeof storeCatalogSearchSchema>;
export type AddToCartInput = z.input<typeof addToCartSchema>;
export type UpdateCartItemInput = z.input<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.input<typeof removeCartItemSchema>;
export type MoveCartItemInput = z.input<typeof moveCartItemSchema>;
export type MoveSavedItemInput = z.input<typeof moveSavedItemSchema>;
export type RemoveSavedItemInput = z.input<typeof removeSavedItemSchema>;
export type ToggleWishlistInput = z.input<typeof toggleWishlistSchema>;
export type CreateStoreOrderInput = z.input<typeof createStoreOrderSchema>;
export type ConfirmStorePaymentInput = z.input<typeof confirmStorePaymentSchema>;
