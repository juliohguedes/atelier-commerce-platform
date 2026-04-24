"use client";

import { useState, useTransition } from "react";
import { updateBrandYearsAction } from "@/actions/admin/update-brand-years-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminBrandYearsFormProps {
 initialYears: number;
}

export function AdminBrandYearsForm({ initialYears }: AdminBrandYearsFormProps) {
 const [yearsValue, setYearsValue] = useState(String(initialYears));
 const [feedback, setFeedback] = useState<string | null>(null);
 const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
 const [isPending, startTransition] = useTransition();

 function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
 event.preventDefault();

 setFeedback(null);
 setFeedbackType(null);

 startTransition(async () => {
 const response = await updateBrandYearsAction({
 yearsInBusiness: yearsValue
 });

 setFeedback(response.message);
 setFeedbackType(response.success ? "success" : "error");
 });
 }

 return (
 <form className="space-y-3" onSubmit={handleSubmit}>
 <div className="max-w-xs space-y-1">
 <label className="text-sm font-medium" htmlFor="years-in-business">
 Anos no ramo
 </label>
 <Input
 id="years-in-business"
 inputMode="numeric"
 min={0}
 max={200}
 onChange={(event) => setYearsValue(event.target.value)}
 type="number"
 value={yearsValue}
 />
 <p className="text-xs text-muted-foreground">
 Esse valor aparece automaticamente na homepage institucional.
 </p>
 </div>

 {feedback ? (
 <p className={feedbackType === "success" ? "text-sm text-green-500" : "text-sm text-destructive"}>
 {feedback}
 </p>
 ) : null}

 <Button disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar anos no ramo"}
 </Button>
 </form>
 );
}
