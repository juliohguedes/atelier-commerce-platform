"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateAdminBrandSettingsAction } from "@/actions/admin/update-brand-settings-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminBrandSettingsSchema } from "@/lib/validations/admin-panel";

interface AdminBrandSettingsFormValues {
 brandName: string;
 supportWhatsapp: string;
 supportEmail: string;
 addressText: string;
 businessHours: string;
 instagramUrl: string;
 facebookUrl: string;
 tiktokUrl: string;
 cnpj: string;
 maintenanceBanner: string;
}

interface AdminBrandSettingsFormProps {
 initialValues: {
 brandName: string;
 supportWhatsapp: string | null;
 supportEmail: string | null;
 addressText: string | null;
 businessHours: string | null;
 instagramUrl: string | null;
 facebookUrl: string | null;
 tiktokUrl: string | null;
 cnpj: string | null;
 maintenanceBanner: string | null;
 };
}

export function AdminBrandSettingsForm({ initialValues }: AdminBrandSettingsFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const {
 register,
 handleSubmit,
 formState: { errors }
 } = useForm<AdminBrandSettingsFormValues>({
 defaultValues: {
 brandName: initialValues.brandName,
 supportWhatsapp: initialValues.supportWhatsapp ?? "",
 supportEmail: initialValues.supportEmail ?? "",
 addressText: initialValues.addressText ?? "",
 businessHours: initialValues.businessHours ?? "",
 instagramUrl: initialValues.instagramUrl ?? "",
 facebookUrl: initialValues.facebookUrl ?? "",
 tiktokUrl: initialValues.tiktokUrl ?? "",
 cnpj: initialValues.cnpj ?? "",
 maintenanceBanner: initialValues.maintenanceBanner ?? ""
 }
 });

 function onSubmit(values: AdminBrandSettingsFormValues) {
 setFeedback(null);

 const parsed = adminBrandSettingsSchema.safeParse(values);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Dados invalidos para salvar configurações."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateAdminBrandSettingsAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-name">
 Nome da empresa
 </label>
 <Input id="brand-name" {...register("brandName")} />
 {errors.brandName?.message ? <p className="text-xs text-destructive">{errors.brandName.message}</p> : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-cnpj">
 CNPJ (somente numeros)
 </label>
 <Input id="brand-cnpj" {...register("cnpj")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-whatsapp">
 WhatsApp
 </label>
 <Input id="brand-whatsapp" {...register("supportWhatsapp")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-email">
 E-mail
 </label>
 <Input id="brand-email" type="email" {...register("supportEmail")} />
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs text-muted-foreground" htmlFor="brand-address">
 Endereço
 </label>
 <Input id="brand-address" {...register("addressText")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-hours">
 Horário de atendimento
 </label>
 <Input id="brand-hours" {...register("businessHours")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-maintenance-banner">
 Banner de manutenção
 </label>
 <Input id="brand-maintenance-banner" {...register("maintenanceBanner")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-instagram">
 Instagram
 </label>
 <Input id="brand-instagram" {...register("instagramUrl")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-facebook">
 Facebook
 </label>
 <Input id="brand-facebook" {...register("facebookUrl")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs text-muted-foreground" htmlFor="brand-tiktok">
 TikTok
 </label>
 <Input id="brand-tiktok" {...register("tiktokUrl")} />
 </div>
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar configurações da marca"}
 </Button>
 </form>
 );
}
