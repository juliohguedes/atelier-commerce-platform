"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { addToCartAction } from "@/actions/store/add-to-cart-action";
import { createStoreOrderAction } from "@/actions/store/create-store-order-action";
import {
 moveCartItemToSavedAction,
 moveSavedItemToCartAction,
 removeSavedItemAction
} from "@/actions/store/saved-items-actions";
import {
 removeCartItemAction,
 updateCartItemQuantityAction
} from "@/actions/store/update-cart-item-quantity-action";
import { toggleWishlistItemAction } from "@/actions/store/toggle-wishlist-item-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storeOrderPolicyHighlights, storePaymentMethodOptions } from "@/lib/constants/store";
import {
 createStoreOrderSchema,
 type CreateStoreOrderInput
} from "@/lib/validations/store";
import { formatCep, formatCpf, normalizeStateCode } from "@/lib/validations/br";
import { formatCurrencyBRL } from "@/lib/utils";
import type { StoreCheckoutResult, StoreUserCommerceData } from "@/types/store";

interface StoreCartExperienceProps {
 data: StoreUserCommerceData;
}

const nativeSelectClassName =
 "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const emptyAddress = {
 label: "Checkout",
 recipientName: "",
 zipCode: "",
 street: "",
 number: "",
 complement: "",
 neighborhood: "",
 city: "",
 state: ""
};

export function StoreCartExperience({ data }: StoreCartExperienceProps) {
 const router = useRouter();
 const [isPending, startTransition] = useTransition();
 const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
 const [checkoutResult, setCheckoutResult] = useState<StoreCheckoutResult | null>(null);

 const form = useForm<CreateStoreOrderInput>({
 resolver: zodResolver(createStoreOrderSchema),
 defaultValues: {
 shippingMode: data.addresses.length > 0 ? "saved" : "new",
 savedAddressId: data.addresses[0]?.id,
 newAddress: data.addresses.length > 0 ? undefined : emptyAddress,
 useSameAddressForBilling: true,
 requiresCpf: data.checkoutRequirements.requiresCpf,
 customerCpf: "",
 paymentMethod: "pix",
 notes: ""
 }
 });

 const shippingMode = useWatch({
 control: form.control,
 name: "shippingMode"
 });

 useEffect(() => {
 if (shippingMode === "saved") {
 form.setValue("newAddress", undefined);
 return;
 }

 if (!form.getValues("newAddress")) {
 form.setValue("newAddress", emptyAddress);
 }
 }, [form, shippingMode]);

 function runAsyncAction(task: () => Promise<{ success: boolean; message: string }>) {
 setFeedbackMessage(null);

 startTransition(async () => {
 const result = await task();
 setFeedbackMessage(result.message);

 if (result.success) {
 router.refresh();
 }
 });
 }

 function handleIncreaseQuantity(cartItemId: string, currentQuantity: number) {
 runAsyncAction(() =>
 updateCartItemQuantityAction({
 cartItemId,
 quantity: currentQuantity + 1
 })
 );
 }

 function handleDecreaseQuantity(cartItemId: string, currentQuantity: number) {
 if (currentQuantity <= 1) {
 runAsyncAction(() => removeCartItemAction({ cartItemId }));
 return;
 }

 runAsyncAction(() =>
 updateCartItemQuantityAction({
 cartItemId,
 quantity: currentQuantity - 1
 })
 );
 }

 function handleCheckoutSubmit(values: CreateStoreOrderInput) {
 setFeedbackMessage(null);
 setCheckoutResult(null);

 startTransition(async () => {
 const result = await createStoreOrderAction(values);
 setFeedbackMessage(result.message);

 if (result.success && result.data) {
 setCheckoutResult(result.data);
 router.refresh();
 }
 });
 }

 return (
 <div className="space-y-6">
 <section className="space-y-3">
 <h2 className="text-2xl font-semibold">Carrinho</h2>
 {data.cartItems.length === 0 ? (
 <div className="rounded-lg border border-border/70 bg-card/40 p-4 text-sm text-muted-foreground">
 Seu carrinho esta vazio. Explore a{" "}
 <Link className="text-gold-400 hover:underline" href="/loja">
 vitrine da loja
 </Link>
 .
 </div>
 ) : (
 <div className="space-y-3">
 {data.cartItems.map((item) => (
 <div className="rounded-lg border border-border/70 bg-card/45 p-4" key={item.id}>
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="space-y-1">
 <p className="font-medium">{item.productName}</p>
 <p className="text-sm text-muted-foreground">
 {item.sizeLabel} / {item.colorLabel} - SKU {item.sku}
 </p>
 <p className="text-sm text-muted-foreground">
 Disponivel: {item.availableQuantity}
 </p>
 <p className="text-sm text-gold-400">
 {formatCurrencyBRL(item.unitPrice)} cada
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <Button
 disabled={isPending}
 onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
 size="sm"
 type="button"
 variant="outline"
 >
 -
 </Button>
 <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
 <Button
 disabled={isPending}
 onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
 size="sm"
 type="button"
 variant="outline"
 >
 +
 </Button>
 </div>
 </div>

 <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
 <p className="text-sm font-medium">
 Subtotal do item: {formatCurrencyBRL(item.lineTotal)}
 </p>
 <div className="flex flex-wrap gap-2">
 <Button
 disabled={isPending}
 onClick={() => runAsyncAction(() => moveCartItemToSavedAction({ cartItemId: item.id }))}
 size="sm"
 type="button"
 variant="ghost"
 >
 Salvar para depois
 </Button>
 <Button
 disabled={isPending}
 onClick={() => runAsyncAction(() => removeCartItemAction({ cartItemId: item.id }))}
 size="sm"
 type="button"
 variant="ghost"
 >
 Remover
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-semibold">Salvar para depois</h2>
 {data.savedItems.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum item salvo para depois.</p>
 ) : (
 <div className="space-y-3">
 {data.savedItems.map((item) => (
 <div className="rounded-lg border border-border/70 bg-card/40 p-4" key={item.id}>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="font-medium">{item.productName}</p>
 <p className="text-sm text-muted-foreground">
 {item.sizeLabel} / {item.colorLabel}
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 <Button
 disabled={isPending}
 onClick={() => runAsyncAction(() => moveSavedItemToCartAction({ savedItemId: item.id }))}
 size="sm"
 type="button"
 variant="outline"
 >
 Voltar ao carrinho
 </Button>
 <Button
 disabled={isPending}
 onClick={() => runAsyncAction(() => removeSavedItemAction({ savedItemId: item.id }))}
 size="sm"
 type="button"
 variant="ghost"
 >
 Remover
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-semibold">Favoritos</h2>
 {data.wishlistItems.length === 0 ? (
 <p className="text-sm text-muted-foreground">Nenhum favorito salvo.</p>
 ) : (
 <div className="space-y-3">
 {data.wishlistItems.map((item) => (
 <div className="rounded-lg border border-border/70 bg-card/40 p-4" key={item.id}>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="font-medium">{item.productName}</p>
 <p className="text-sm text-muted-foreground">
 {item.sizeLabel && item.colorLabel
 ? `${item.sizeLabel} / ${item.colorLabel}`
 : "Favorito por produto"}
 </p>
 <p
 className={
 item.isAvailable
 ? "text-xs text-green-500"
 : "text-xs text-muted-foreground"
 }
 >
 {item.isAvailable
 ? "Disponível em estoque"
 : "Sem estoque agora. Aviso de reposição ativo."}
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 {item.variantId ? (
 <Button
 disabled={isPending}
 onClick={() =>
 runAsyncAction(() =>
 addToCartAction({
 variantId: item.variantId as string,
 quantity: 1
 })
 )
 }
 size="sm"
 type="button"
 variant="outline"
 >
 Adicionar ao carrinho
 </Button>
 ) : null}
 <Button
 disabled={isPending}
 onClick={() =>
 runAsyncAction(() =>
 toggleWishlistItemAction({
 productId: item.productId,
 variantId: item.variantId ?? undefined,
 notifyOnRestock: item.notifyOnRestock
 })
 )
 }
 size="sm"
 type="button"
 variant="ghost"
 >
 Remover favorito
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>

 <section className="space-y-4 rounded-xl border border-gold-600/30 bg-card/55 p-5">
 <div className="space-y-1">
 <h2 className="text-2xl font-semibold">Checkout</h2>
 <p className="text-sm text-muted-foreground">
 Use endereço salvo ou cadastre novo endereço nesta compra. Nota fiscal fica visível na
 plataforma e também por e-mail.
 </p>
 </div>

 <div className="grid gap-2 text-sm">
 <p>Subtotal: {formatCurrencyBRL(data.summary.subtotal)}</p>
 <p>Frete: {formatCurrencyBRL(data.summary.shippingCost)}</p>
 <p className="text-lg font-semibold text-gold-400">
 Total: {formatCurrencyBRL(data.summary.total)}
 </p>
 </div>

 <ul className="space-y-1 text-xs text-muted-foreground">
 {storeOrderPolicyHighlights.map((item) => (
 <li key={item}>- {item}</li>
 ))}
 </ul>

 <form className="space-y-4" onSubmit={form.handleSubmit(handleCheckoutSubmit)}>
 <input type="hidden" {...form.register("requiresCpf")} />

 <div className="space-y-2">
 <label className="text-sm font-medium">Endereço de entrega</label>
 <select className={nativeSelectClassName} {...form.register("shippingMode")}>
 {data.addresses.length > 0 ? <option value="saved">Usar endereço salvo</option> : null}
 <option value="new">Cadastrar novo endereço agora</option>
 </select>
 </div>

 {shippingMode === "saved" ? (
 <div className="space-y-2">
 <label className="text-sm font-medium">Selecione o endereço salvo</label>
 <select className={nativeSelectClassName} {...form.register("savedAddressId")}>
 <option value="">Selecione</option>
 {data.addresses.map((address) => (
 <option key={address.id} value={address.id}>
 {address.label} - {address.street}, {address.number} - {address.city}/{address.state}
 </option>
 ))}
 </select>
 {form.formState.errors.savedAddressId ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.savedAddressId.message}
 </p>
 ) : null}
 </div>
 ) : (
 <div className="grid gap-3 rounded-lg border border-border/70 bg-card/35 p-4 md:grid-cols-2">
 <div className="space-y-1 md:col-span-2">
 <label className="text-sm font-medium">Identificador do endereço</label>
 <Input placeholder="Checkout, Trabalho, etc." {...form.register("newAddress.label")} />
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-sm font-medium">Destinatario</label>
 <Input placeholder="Nome de quem recebe" {...form.register("newAddress.recipientName")} />
 {form.formState.errors.newAddress?.recipientName ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.recipientName.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">CEP</label>
 <Controller
 control={form.control}
 name="newAddress.zipCode"
 render={({ field }) => (
 <Input
 inputMode="numeric"
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatCep(event.target.value))}
 placeholder="00000-000"
 value={field.value ?? ""}
 />
 )}
 />
 {form.formState.errors.newAddress?.zipCode ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.zipCode.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">Rua</label>
 <Input placeholder="Rua, avenida..." {...form.register("newAddress.street")} />
 {form.formState.errors.newAddress?.street ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.street.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">Número</label>
 <Input placeholder="123" {...form.register("newAddress.number")} />
 {form.formState.errors.newAddress?.number ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.number.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">Complemento</label>
 <Input placeholder="Apto, bloco..." {...form.register("newAddress.complement")} />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">Bairro</label>
 <Input placeholder="Seu bairro" {...form.register("newAddress.neighborhood")} />
 {form.formState.errors.newAddress?.neighborhood ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.neighborhood.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">Cidade</label>
 <Input placeholder="Sua cidade" {...form.register("newAddress.city")} />
 {form.formState.errors.newAddress?.city ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.city.message}
 </p>
 ) : null}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium">UF</label>
 <Controller
 control={form.control}
 name="newAddress.state"
 render={({ field }) => (
 <Input
 maxLength={2}
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(normalizeStateCode(event.target.value))}
 placeholder="SP"
 value={field.value ?? ""}
 />
 )}
 />
 {form.formState.errors.newAddress?.state ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.newAddress.state.message}
 </p>
 ) : null}
 </div>
 </div>
 )}

 <div className="space-y-2">
 <label className="text-sm font-medium">Forma de pagamento</label>
 <select className={nativeSelectClassName} {...form.register("paymentMethod")}>
 {storePaymentMethodOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 {data.checkoutRequirements.requiresCpf ? (
 <div className="space-y-2">
 <label className="text-sm font-medium">CPF para faturamento</label>
 <Controller
 control={form.control}
 name="customerCpf"
 render={({ field }) => (
 <Input
 inputMode="numeric"
 onBlur={field.onBlur}
 onChange={(event) => field.onChange(formatCpf(event.target.value))}
 placeholder="000.000.000-00"
 value={field.value ?? ""}
 />
 )}
 />
 <p className="text-xs text-muted-foreground">
 Pedimos o CPF apenas nesta etapa porque ele pode ser necessário para pagamento e
 faturamento.
 </p>
 {form.formState.errors.customerCpf ? (
 <p className="text-xs text-destructive">
 {form.formState.errors.customerCpf.message}
 </p>
 ) : null}
 </div>
 ) : data.checkoutRequirements.savedCpf ? (
 <div className="rounded-md border border-border/70 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
 CPF de faturamento já cadastrado e pronto para reutilização neste checkout.
 </div>
 ) : null}

 <label className="flex items-start gap-2 text-sm">
 <input type="checkbox" {...form.register("useSameAddressForBilling")} />
 Usar o mesmo endereço para faturamento.
 </label>

 <div className="space-y-1">
 <label className="text-sm font-medium">Observações</label>
 <Textarea
 minLength={0}
 placeholder="Informações adicionais para o atendimento da loja."
 {...form.register("notes")}
 />
 </div>

 <Button disabled={isPending || data.cartItems.length === 0} type="submit">
 Finalizar checkout
 </Button>
 </form>
 </section>

 {checkoutResult ? (
 <section className="space-y-3 rounded-xl border border-gold-500/45 bg-gold-500/10 p-5">
 <h2 className="text-xl font-semibold text-gold-400">Pedido criado</h2>
 <p className="text-sm">
 Protocolo da loja: <strong>{checkoutResult.orderNumber}</strong>
 </p>
 <p className="text-sm">
 Nota fiscal: <strong>{checkoutResult.invoiceNumber ?? "Gerando..."}</strong>
 </p>
 <p className="text-sm">
 Total: <strong>{formatCurrencyBRL(checkoutResult.totalAmount)}</strong>
 </p>
 <p className="text-sm text-muted-foreground">
 O pedido foi registrado com pagamento pendente. Quando aprovado internamente, a reserva
 de estoque será aplicada e você recebera aviso na plataforma, e-mail e WhatsApp.
 </p>
 </section>
 ) : null}

 {feedbackMessage ? (
 <p className="rounded-md border border-border/70 bg-card/50 px-3 py-2 text-sm">
 {feedbackMessage}
 </p>
 ) : null}
 </div>
 );
}
