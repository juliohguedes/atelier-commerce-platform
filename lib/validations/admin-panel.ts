import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
 if (typeof value !== "string") {
 return value;
 }

 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : undefined;
};

export const adminBrandSettingsSchema = z.object({
 brandName: z.string().trim().min(2).max(120),
 supportWhatsapp: z
 .preprocess(emptyToUndefined, z.string().regex(/^[0-9]{10,13}$/, "WhatsApp invalido").optional()),
 supportEmail: z.preprocess(emptyToUndefined, z.string().email("E-mail invalido").optional()),
 addressText: z.preprocess(emptyToUndefined, z.string().max(320).optional()),
 businessHours: z.preprocess(emptyToUndefined, z.string().max(220).optional()),
 instagramUrl: z.preprocess(emptyToUndefined, z.string().url("URL invalida").optional()),
 facebookUrl: z.preprocess(emptyToUndefined, z.string().url("URL invalida").optional()),
 tiktokUrl: z.preprocess(emptyToUndefined, z.string().url("URL invalida").optional()),
 cnpj: z.preprocess(emptyToUndefined, z.string().regex(/^[0-9]{14}$/, "CNPJ invalido").optional()),
 maintenanceBanner: z.preprocess(emptyToUndefined, z.string().max(220).optional())
});

export const adminTechnicalDraftSchema = z.object({
 mode: z.enum(["save_draft", "publish", "restore_last_published"]),
 unlockPassword: z.string().min(4),
 payloadJson: z.string().max(12000).optional(),
 operationNote: z.preprocess(emptyToUndefined, z.string().max(240).optional())
});

export type AdminBrandSettingsInput = z.output<typeof adminBrandSettingsSchema>;
export type AdminTechnicalDraftInput = z.output<typeof adminTechnicalDraftSchema>;
