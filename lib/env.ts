import { z } from "zod";

const toOptional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_STAGE: z.enum(["development", "staging", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  EMAIL_PROVIDER: z.enum(["mock"]).default("mock"),
  WHATSAPP_PROVIDER: z.enum(["mock"]).default("mock"),
  PAYMENT_PROVIDER: z.enum(["mock"]).default("mock"),
  SHIPPING_PROVIDER: z.enum(["mock"]).default("mock"),
  INVOICE_PROVIDER: z.enum(["mock"]).default("mock"),
  PASSWORD_RECOVERY_PROVIDER: z.enum(["mock"]).default("mock"),
  INTERNAL_FINANCE_UNLOCK_PASSWORD: z.string().min(4).optional(),
  INTERNAL_ADMIN_TECHNICAL_PASSWORD: z.string().min(4).optional(),
  INTERNAL_ACCESS_COOKIE_NAME: z.string().min(4).optional(),
  INTERNAL_ACCESS_CODE_TTL_MINUTES: z.coerce.number().int().min(5).max(30).default(10),
  INTERNAL_ACCESS_SESSION_HOURS: z.coerce.number().int().min(1).max(24).default(12)
});

const envResult = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: toOptional(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_APP_STAGE: toOptional(process.env.NEXT_PUBLIC_APP_STAGE),
  NEXT_PUBLIC_SUPABASE_URL: toOptional(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: toOptional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: toOptional(process.env.SUPABASE_SERVICE_ROLE_KEY),
  EMAIL_PROVIDER: toOptional(process.env.EMAIL_PROVIDER),
  WHATSAPP_PROVIDER: toOptional(process.env.WHATSAPP_PROVIDER),
  PAYMENT_PROVIDER: toOptional(process.env.PAYMENT_PROVIDER),
  SHIPPING_PROVIDER: toOptional(process.env.SHIPPING_PROVIDER),
  INVOICE_PROVIDER: toOptional(process.env.INVOICE_PROVIDER),
  PASSWORD_RECOVERY_PROVIDER: toOptional(process.env.PASSWORD_RECOVERY_PROVIDER),
  INTERNAL_FINANCE_UNLOCK_PASSWORD: toOptional(process.env.INTERNAL_FINANCE_UNLOCK_PASSWORD),
  INTERNAL_ADMIN_TECHNICAL_PASSWORD: toOptional(process.env.INTERNAL_ADMIN_TECHNICAL_PASSWORD),
  INTERNAL_ACCESS_COOKIE_NAME: toOptional(process.env.INTERNAL_ACCESS_COOKIE_NAME),
  INTERNAL_ACCESS_CODE_TTL_MINUTES: toOptional(process.env.INTERNAL_ACCESS_CODE_TTL_MINUTES),
  INTERNAL_ACCESS_SESSION_HOURS: toOptional(process.env.INTERNAL_ACCESS_SESSION_HOURS)
});

if (!envResult.success) {
  throw new Error(
    `Variaveis de ambiente invalidas:
${JSON.stringify(
      envResult.error.flatten().fieldErrors,
      null,
      2
    )}`
  );
}

export const env = envResult.data;

const requiredProductionEnv: Array<keyof typeof env> = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "INTERNAL_FINANCE_UNLOCK_PASSWORD",
  "INTERNAL_ADMIN_TECHNICAL_PASSWORD"
];

if (env.NEXT_PUBLIC_APP_STAGE === "production") {
  const missingVariables = requiredProductionEnv.filter((key) => !env[key]);

  if (missingVariables.length > 0) {
    throw new Error(
      `Variaveis obrigatorias ausentes para producao: ${missingVariables.join(", ")}`
    );
  }
}

export const isSupabaseConfigured = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const isProductionStage = env.NEXT_PUBLIC_APP_STAGE === "production";
