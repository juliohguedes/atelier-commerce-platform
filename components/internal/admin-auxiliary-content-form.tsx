"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateSiteAuxiliaryContentAction } from "@/actions/admin/update-site-auxiliary-content-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
 adminAuxiliaryContentFormSchema,
 type AdminAuxiliaryContentFormInput
} from "@/lib/validations/site-content";

interface AdminAuxiliaryContentFormProps {
 initialValues: {
 galleryJson: string;
 collectionsJson: string;
 testimonialsJson: string;
 faqJson: string;
 legalJson: string;
 locationJson: string;
 };
}

const fieldDescriptions: Record<keyof AdminAuxiliaryContentFormInput, string> = {
 galleryJson: "Galeria principal de peças exibidas na home.",
 collectionsJson: "Coleções e selos em destaque.",
 testimonialsJson: "Depoimentos e avaliações publicas.",
 faqJson: "Perguntas frequentes do site.",
 legalJson: "Termos e política de privacidade.",
 locationJson: "Mapa, showroom e dados de localização."
};

export function AdminAuxiliaryContentForm({
 initialValues
}: AdminAuxiliaryContentFormProps) {
 const [isPending, startTransition] = useTransition();
 const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
 null
 );

 const { register, handleSubmit } = useForm<AdminAuxiliaryContentFormInput>({
 defaultValues: initialValues
 });

 function onSubmit(values: AdminAuxiliaryContentFormInput) {
 setFeedback(null);

 const parsed = adminAuxiliaryContentFormSchema.safeParse(values);

 if (!parsed.success) {
 setFeedback({
 type: "error",
 message: parsed.error.issues[0]?.message ?? "Blocos invalidos para salvar."
 });
 return;
 }

 startTransition(async () => {
 const response = await updateSiteAuxiliaryContentAction(parsed.data);
 setFeedback({
 type: response.success ? "success" : "error",
 message: response.message
 });
 });
 }

 return (
 <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
 <div className="grid gap-4 xl:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="gallery-json">
 Galeria de peças
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.galleryJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="gallery-json" {...register("galleryJson")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="collections-json">
 Coleções em destaque
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.collectionsJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="collections-json" {...register("collectionsJson")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="testimonials-json">
 Depoimentos
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.testimonialsJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="testimonials-json" {...register("testimonialsJson")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="faq-json">
 FAQ
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.faqJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="faq-json" {...register("faqJson")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="legal-json">
 Termos e privacidade
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.legalJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="legal-json" {...register("legalJson")} />
 </div>

 <div className="space-y-1">
 <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground" htmlFor="location-json">
 Mapa e localização
 </label>
 <p className="text-xs text-muted-foreground">{fieldDescriptions.locationJson}</p>
 <Textarea className="min-h-[260px] font-mono text-xs" id="location-json" {...register("locationJson")} />
 </div>
 </div>

 {feedback ? (
 <p className={feedback.type === "success" ? "text-sm text-emerald-400" : "text-sm text-destructive"}>
 {feedback.message}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar áreas auxiliares"}
 </Button>
 </form>
 );
}
