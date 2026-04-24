"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCartAction } from "@/actions/store/add-to-cart-action";
import { toggleWishlistItemAction } from "@/actions/store/toggle-wishlist-item-action";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import type { StoreProductVariant } from "@/types/store";

interface StoreProductActionsProps {
 productId: string;
 productName: string;
 variants: StoreProductVariant[];
 isAuthenticated: boolean;
}

const nativeSelectClassName =
 "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StoreProductActions({
 productId,
 productName,
 variants,
 isAuthenticated
}: StoreProductActionsProps) {
 const pathname = usePathname();
 const router = useRouter();
 const [isPending, startTransition] = useTransition();
 const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id ?? "");
 const [quantity, setQuantity] = useState<number>(1);
 const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
 const [isFavorited, setIsFavorited] = useState(false);

 const selectedVariant = useMemo(
 () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
 [selectedVariantId, variants]
 );

 const signInHref = `${ROUTES.public.signIn}?redirectedFrom=${encodeURIComponent(pathname)}` as Route;
 const cartHref = ROUTES.private.clientStoreCart;

 function runAddToCart(redirectToCheckout: boolean) {
 if (!selectedVariant) {
 setFeedbackMessage("Selecione uma variacao para continuar.");
 return;
 }

 if (quantity < 1) {
 setFeedbackMessage("Quantidade invalida.");
 return;
 }

 startTransition(async () => {
 const result = await addToCartAction({
 variantId: selectedVariant.id,
 quantity
 });

 setFeedbackMessage(result.message);

 if (result.success && redirectToCheckout) {
 router.push(cartHref);
 router.refresh();
 }

 if (!result.success && result.requiresAuth) {
 router.push(signInHref);
 }
 });
 }

 function runToggleFavorite() {
 if (!selectedVariant) {
 setFeedbackMessage("Selecione uma variacao para favoritar.");
 return;
 }

 startTransition(async () => {
 const result = await toggleWishlistItemAction({
 productId,
 variantId: selectedVariant.id,
 notifyOnRestock: true
 });

 setFeedbackMessage(result.message);

 if (result.success) {
 setIsFavorited(Boolean(result.isFavorited));
 }

 if (!result.success && result.requiresAuth) {
 router.push(signInHref);
 }
 });
 }

 return (
 <div className="space-y-4 rounded-xl border border-border/70 bg-card/55 p-4">
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Variacao
 </label>
 <select
 className={nativeSelectClassName}
 onChange={(event) => setSelectedVariantId(event.target.value)}
 value={selectedVariantId}
 >
 {variants.map((variant) => (
 <option key={variant.id} value={variant.id}>
 {variant.variationLabel ?? `${variant.sizeLabel} / ${variant.colorLabel}`}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Quantidade
 </label>
 <input
 className={nativeSelectClassName}
 max={20}
 min={1}
 onChange={(event) => setQuantity(Number(event.target.value))}
 type="number"
 value={quantity}
 />
 </div>
 </div>

 {selectedVariant ? (
 <p className="text-sm text-muted-foreground">
 Estoque desta variacao:{" "}
 <strong className={selectedVariant.availableQuantity > 0 ? "text-green-500" : "text-destructive"}>
 {selectedVariant.availableQuantity > 0
 ? `${selectedVariant.availableQuantity} disponivel(is)`
 : "indisponivel"}
 </strong>
 </p>
 ) : null}

 <div className="grid gap-2">
 <Button
 disabled={isPending || !selectedVariant || selectedVariant.availableQuantity <= 0}
 onClick={() => runAddToCart(true)}
 type="button"
 >
 Comprar agora
 </Button>
 <Button
 disabled={isPending || !selectedVariant || selectedVariant.availableQuantity <= 0}
 onClick={() => runAddToCart(false)}
 type="button"
 variant="outline"
 >
 Adicionar ao carrinho
 </Button>
 <Button
 disabled={isPending || !selectedVariant}
 onClick={runToggleFavorite}
 type="button"
 variant="ghost"
 >
 {isFavorited ? "Remover dos favoritos" : "Favoritar"}
 </Button>
 </div>

 {!isAuthenticated ? (
 <p className="text-xs text-muted-foreground">
 Login obrigatorio para comprar.{" "}
 <Link className="text-gold-400 hover:underline" href={signInHref}>
 Entrar agora
 </Link>
 </p>
 ) : null}

 {feedbackMessage ? (
 <p className="rounded-md border border-border/70 bg-card/60 px-3 py-2 text-sm">
 {feedbackMessage}
 {feedbackMessage.includes("favoritos") ? (
 <>
 {" "}
 Avisaremos quando o item voltar ao estoque.
 </>
 ) : null}
 </p>
 ) : null}

 <p className="text-xs text-muted-foreground">
 {productName} possui variacoes de tamanho e cor para voce escolher no pedido.
 </p>
 </div>
 );
}
