"use client";

import { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { updateClientProfileAction } from "@/actions/profile/update-client-profile-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 clientProfileUpdateSchema,
 type AddressInput,
 type ClientProfileUpdateInput
} from "@/lib/validations/auth";
import { formatCep, formatCpf, formatPhoneBR, normalizeStateCode } from "@/lib/validations/br";

export interface ClientProfileInitialData {
 fullName: string;
 email: string;
 whatsapp: string;
 cpf: string;
 mainAddress: AddressInput;
 additionalAddresses: AddressInput[];
}

interface ClientProfileFormProps {
 initialData: ClientProfileInitialData;
}

interface AddressEditorProps {
 title: string;
 description: string;
 baseName: `mainAddress` | `additionalAddresses.${number}`;
 register: ReturnType<typeof useForm<ClientProfileUpdateInput>>["register"];
 control: ReturnType<typeof useForm<ClientProfileUpdateInput>>["control"];
 errors: ReturnType<typeof useForm<ClientProfileUpdateInput>>["formState"]["errors"];
 onRemove?: () => void;
}

function AddressEditor({
 title,
 description,
 baseName,
 register,
 control,
 errors,
 onRemove
}: AddressEditorProps) {
 const baseErrors =
 baseName === "mainAddress"
 ? errors.mainAddress
 : errors.additionalAddresses?.[Number(baseName.split(".")[1])];

 return (
 <div className="space-y-3 rounded-lg border border-border/70 p-4">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-sm font-semibold text-foreground">{title}</p>
 <p className="text-xs text-muted-foreground">{description}</p>
 </div>
 {onRemove ? (
 <Button onClick={onRemove} size="sm" type="button" variant="ghost">
 Remover
 </Button>
 ) : null}
 </div>

 <input type="hidden" {...register(`${baseName}.id` as const)} />

 <div className="grid gap-3 md:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium">Identificador</label>
 <Input placeholder="Principal, Atelier, etc." {...register(`${baseName}.label` as const)} />
 {baseErrors?.label ? (
 <p className="text-xs text-destructive">{baseErrors.label.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Destinatario</label>
 <Input placeholder="Nome de quem recebe" {...register(`${baseName}.recipientName` as const)} />
 {baseErrors?.recipientName ? (
 <p className="text-xs text-destructive">{baseErrors.recipientName.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">CEP</label>
 <Controller
 control={control}
 name={`${baseName}.zipCode` as const}
 render={({ field }) => (
 <Input
 inputMode="numeric"
 placeholder="00000-000"
 value={field.value ?? ""}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatCep(event.target.value))}
 />
 )}
 />
 {baseErrors?.zipCode ? (
 <p className="text-xs text-destructive">{baseErrors.zipCode.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Rua</label>
 <Input placeholder="Rua, avenida, etc." {...register(`${baseName}.street` as const)} />
 {baseErrors?.street ? (
 <p className="text-xs text-destructive">{baseErrors.street.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Número</label>
 <Input placeholder="123" {...register(`${baseName}.number` as const)} />
 {baseErrors?.number ? (
 <p className="text-xs text-destructive">{baseErrors.number.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Complemento</label>
 <Input placeholder="Apto, bloco, referência..." {...register(`${baseName}.complement` as const)} />
 {baseErrors?.complement ? (
 <p className="text-xs text-destructive">{baseErrors.complement.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Bairro</label>
 <Input placeholder="Seu bairro" {...register(`${baseName}.neighborhood` as const)} />
 {baseErrors?.neighborhood ? (
 <p className="text-xs text-destructive">{baseErrors.neighborhood.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">Cidade</label>
 <Input placeholder="Sua cidade" {...register(`${baseName}.city` as const)} />
 {baseErrors?.city ? (
 <p className="text-xs text-destructive">{baseErrors.city.message}</p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium">UF</label>
 <Controller
 control={control}
 name={`${baseName}.state` as const}
 render={({ field }) => (
 <Input
 maxLength={2}
 placeholder="SP"
 value={field.value ?? ""}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(normalizeStateCode(event.target.value))}
 />
 )}
 />
 {baseErrors?.state ? (
 <p className="text-xs text-destructive">{baseErrors.state.message}</p>
 ) : null}
 </div>
 </div>
 </div>
 );
}

function createEmptyAddress(label: string): AddressInput {
 return {
 id: undefined,
 label,
 recipientName: "",
 zipCode: "",
 street: "",
 number: "",
 complement: "",
 neighborhood: "",
 city: "",
 state: ""
 };
}

export function ClientProfileForm({ initialData }: ClientProfileFormProps) {
 const [resultMessage, setResultMessage] = useState<string | null>(null);
 const [resultState, setResultState] = useState<"success" | "error" | null>(null);
 const [isPending, startTransition] = useTransition();

 const form = useForm<ClientProfileUpdateInput>({
 resolver: zodResolver(clientProfileUpdateSchema),
 defaultValues: initialData
 });

 const additionalAddresses = useFieldArray({
 control: form.control,
 name: "additionalAddresses"
 });

 const onSubmit = form.handleSubmit((values) => {
 setResultMessage(null);
 setResultState(null);

 startTransition(async () => {
 const response = await updateClientProfileAction(values);
 setResultState(response.success ? "success" : "error");
 setResultMessage(response.message);
 });
 });

 return (
 <form className="space-y-6" onSubmit={onSubmit}>
 <div className="grid gap-4 md:grid-cols-2">
 <div className="space-y-2 md:col-span-2">
 <label className="text-sm font-medium">Nome completo</label>
 <Input placeholder="Seu nome completo" {...form.register("fullName")} />
 {form.formState.errors.fullName ? (
 <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">E-mail</label>
 <Input placeholder="voce@empresa.com.br" type="email" {...form.register("email")} />
 {form.formState.errors.email ? (
 <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">WhatsApp</label>
 <Controller
 control={form.control}
 name="whatsapp"
 render={({ field }) => (
 <Input
 inputMode="numeric"
 placeholder="(11) 99999-9999"
 value={field.value ?? ""}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatPhoneBR(event.target.value))}
 />
 )}
 />
 {form.formState.errors.whatsapp ? (
 <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
 ) : null}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium">CPF</label>
 <Controller
 control={form.control}
 name="cpf"
 render={({ field }) => (
 <Input
 inputMode="numeric"
 placeholder="000.000.000-00"
 value={field.value ?? ""}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatCpf(event.target.value))}
 />
 )}
 />
 {form.formState.errors.cpf ? (
 <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>
 ) : null}
 </div>
 </div>

 <AddressEditor
 baseName="mainAddress"
 control={form.control}
 description="Endereço principal para entregas e contato."
 errors={form.formState.errors}
 register={form.register}
 title="Endereço principal"
 />

 <div className="space-y-3">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-semibold text-foreground">Outros endereços</p>
 <p className="text-xs text-muted-foreground">
 Adicione até 5 endereços extras para entrega.
 </p>
 </div>

 <Button
 disabled={additionalAddresses.fields.length >= 5}
 onClick={() =>
 additionalAddresses.append(
 createEmptyAddress(`Endereco ${additionalAddresses.fields.length + 2}`)
 )
 }
 size="sm"
 type="button"
 variant="outline"
 >
 Adicionar endereço
 </Button>
 </div>

 {additionalAddresses.fields.map((field, index) => (
 <AddressEditor
 baseName={`additionalAddresses.${index}`}
 control={form.control}
 description="Endereço complementar para uso quando necessário."
 errors={form.formState.errors}
 key={field.id}
 onRemove={() => additionalAddresses.remove(index)}
 register={form.register}
 title={`Endereco adicional ${index + 1}`}
 />
 ))}
 </div>

 {resultMessage ? (
 <p className={resultState === "success" ? "text-sm text-green-500" : "text-sm text-destructive"}>
 {resultMessage}
 </p>
 ) : null}

 <Button className="w-full md:w-auto" disabled={isPending} type="submit">
 {isPending ? "Salvando..." : "Salvar alterações"}
 </Button>
 </form>
 );
}
