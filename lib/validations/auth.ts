import { z } from "zod";
import {
 isValidBrazilPhone,
 isValidCep,
 isValidCpf,
 normalizeStateCode,
 onlyDigits
} from "@/lib/validations/br";
import { internalUserRoles } from "@/types/auth";

const minimumPasswordLength = 8;

const addressSchema = z.object({
 id: z.string().uuid().optional(),
 label: z
 .string()
 .trim()
 .max(60, "Use no máximo 60 caracteres no identificador do endereço.")
 .optional()
 .transform((value) => (value ? value : undefined)),
 recipientName: z
 .string()
 .trim()
 .min(3, "Informe o nome de quem recebe neste endereço."),
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

export const signInSchema = z.object({
 email: z.string().trim().email("Informe um e-mail valido."),
 password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.")
});

export const clientSignUpSchema = z
 .object({
 fullName: z.string().trim().min(3, "Informe o nome completo."),
 email: z.string().trim().email("Informe um e-mail valido."),
 password: z
 .string()
 .min(
 minimumPasswordLength,
 `A senha deve ter ao menos ${minimumPasswordLength} caracteres.`
 ),
 confirmPassword: z
 .string()
 .min(
 minimumPasswordLength,
 `A senha deve ter ao menos ${minimumPasswordLength} caracteres.`
 ),
 contact: z
 .string()
 .trim()
 .refine(isValidBrazilPhone, "Informe um contato valido com DDD.")
 .transform(onlyDigits),
 acceptedTerms: z.boolean(),
 acceptedPrivacyPolicy: z.boolean()
 })
 .superRefine((value, context) => {
 if (value.password !== value.confirmPassword) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 message: "As senhas não coincidem.",
 path: ["confirmPassword"]
 });
 }

 if (!value.acceptedTerms) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 message: "Você precisa aceitar os termos para continuar.",
 path: ["acceptedTerms"]
 });
 }

 if (!value.acceptedPrivacyPolicy) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 message: "Você precisa aceitar a política de privacidade para continuar.",
 path: ["acceptedPrivacyPolicy"]
 });
 }
 });

export const clientProfileUpdateSchema = z.object({
 fullName: z.string().trim().min(3, "Informe o nome completo."),
 email: z.string().trim().email("Informe um e-mail valido."),
 whatsapp: z
 .string()
 .trim()
 .refine(isValidBrazilPhone, "Informe um WhatsApp valido com DDD.")
 .transform(onlyDigits),
 cpf: z
 .string()
 .trim()
 .refine(isValidCpf, "Informe um CPF valido.")
 .transform(onlyDigits),
 mainAddress: addressSchema,
 additionalAddresses: z.array(addressSchema).max(5, "Limite de 5 endereços extras.")
});

export const passwordRecoverySchema = z.object({
 email: z.string().trim().email("Informe um e-mail valido.")
});

export const internalSectorSignInSchema = signInSchema.extend({
 expectedRole: z.enum(internalUserRoles)
});

export const internalAccessVerificationSchema = z.object({
 code: z.string().trim().regex(/^\d{6}$/, "Informe o codigo de 6 digitos."),
 expectedRole: z.enum(internalUserRoles)
});

export const resetPasswordSchema = z
 .object({
 password: z
 .string()
 .min(
 minimumPasswordLength,
 `A senha deve ter ao menos ${minimumPasswordLength} caracteres.`
 ),
 confirmPassword: z
 .string()
 .min(
 minimumPasswordLength,
 `A senha deve ter ao menos ${minimumPasswordLength} caracteres.`
 )
 })
 .superRefine((value, context) => {
 if (value.password !== value.confirmPassword) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 message: "As senhas não coincidem.",
 path: ["confirmPassword"]
 });
 }
 });

export type AddressInput = z.input<typeof addressSchema>;
export type AddressPayload = z.output<typeof addressSchema>;

export type SignInInput = z.input<typeof signInSchema>;

export type ClientSignUpInput = z.input<typeof clientSignUpSchema>;
export type ClientSignUpPayload = z.output<typeof clientSignUpSchema>;

export type ClientProfileUpdateInput = z.input<typeof clientProfileUpdateSchema>;
export type ClientProfileUpdatePayload = z.output<typeof clientProfileUpdateSchema>;

export type PasswordRecoveryInput = z.input<typeof passwordRecoverySchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type InternalSectorSignInInput = z.input<typeof internalSectorSignInSchema>;
export type InternalAccessVerificationInput = z.input<typeof internalAccessVerificationSchema>;
