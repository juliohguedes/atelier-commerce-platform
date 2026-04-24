import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { StoreProductActions } from "@/components/store/store-product-actions";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrencyBRL } from "@/lib/utils";
import { getStoreProductDetailBySlug } from "@/services/store/get-store-catalog-data";

interface StoreProductPageProps {
 params: Promise<{ slug: string }>;
}

async function getIsAuthenticated(): Promise<boolean> {
 if (!isSupabaseConfigured) {
 return false;
 }

 try {
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();
 return Boolean(user);
 } catch {
 return false;
 }
}

export default async function StoreProductPage({ params }: StoreProductPageProps) {
 const { slug } = await params;
 const [product, isAuthenticated] = await Promise.all([
 getStoreProductDetailBySlug(slug),
 getIsAuthenticated()
 ]);

 if (!product) {
 notFound();
 }

 const sortedImages = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
 const mainImage = sortedImages[0];
 const relatedProducts = product.related.filter((item) => item.relationType === "related");
 const sameCollectionProducts = product.related.filter(
 (item) => item.relationType === "same_collection"
 );
 const prices = product.variants.map((variant) => variant.price);
 const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
 const maxPrice = prices.length > 0 ? Math.max(...prices) : product.basePrice;

 return (
 <Container className="space-y-8 py-12 md:py-16">
 <header className="space-y-2">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Loja Online</p>
 <h1 className="section-title">{product.name}</h1>
 <p className="max-w-3xl text-muted-foreground">
 {product.shortDescription ?? "Peca pronta para compra com variacoes de tamanho e cor."}
 </p>
 </header>

 <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
 <section className="space-y-4 rounded-xl border border-border/70 bg-card/45 p-4">
 <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border/70 bg-muted/40">
 {mainImage?.imageUrl ? (
 <Image
 alt={mainImage.altText ?? product.name}
 className="h-full w-full object-cover"
 fill
 src={mainImage.imageUrl}
 unoptimized
 />
 ) : (
 <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
 Imagem indisponivel
 </div>
 )}
 </div>

 {sortedImages.length > 1 ? (
 <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
 {sortedImages.slice(1).map((image) => (
 <div
 className="relative aspect-square overflow-hidden rounded-md border border-border/70 bg-muted/40"
 key={image.id}
 >
 <Image
 alt={image.altText ?? product.name}
 className="h-full w-full object-cover"
 fill
 src={image.imageUrl}
 unoptimized
 />
 </div>
 ))}
 </div>
 ) : null}
 </section>

 <section className="space-y-4">
 <div className="space-y-2 rounded-xl border border-border/70 bg-card/45 p-4">
 <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
 {product.collectionName ?? "Colecao autoral"}
 </p>
 <p className="text-3xl font-semibold text-gold-400">
 {formatCurrencyBRL(minPrice)}
 {maxPrice > minPrice ? ` - ${formatCurrencyBRL(maxPrice)}` : ""}
 </p>
 {product.compareAtPrice ? (
 <p className="text-sm text-muted-foreground line-through">
 {formatCurrencyBRL(product.compareAtPrice)}
 </p>
 ) : null}
 <p className={product.isAvailable ? "text-sm text-green-500" : "text-sm text-destructive"}>
 {product.isAvailable ? "Disponivel em estoque" : "Indisponivel"}
 </p>
 <p className="text-sm text-muted-foreground">
 Estoque total disponivel: {product.totalAvailableUnits}
 </p>
 </div>

 <StoreProductActions
 isAuthenticated={isAuthenticated}
 productId={product.id}
 productName={product.name}
 variants={product.variants}
 />

 {isAuthenticated ? (
 <Link
 className="inline-flex text-sm text-gold-400 transition-colors hover:text-gold-500 hover:underline"
 href={ROUTES.private.clientStoreCart}
 >
 Ir para carrinho e checkout
 </Link>
 ) : (
 <Link
 className="inline-flex text-sm text-gold-400 transition-colors hover:text-gold-500 hover:underline"
 href={`${ROUTES.public.signIn}?redirectedFrom=${encodeURIComponent(`/loja/${product.slug}`)}`}
 >
 Entrar para comprar
 </Link>
 )}
 </section>
 </div>

 <section className="grid gap-6 lg:grid-cols-2">
 <div className="space-y-3 rounded-xl border border-border/70 bg-card/45 p-4">
 <h2 className="text-2xl font-semibold">Descricao e caracteristicas</h2>
 {product.description ? (
 <p className="text-sm text-muted-foreground">{product.description}</p>
 ) : null}
 {product.characteristics.length > 0 ? (
 <ul className="space-y-1 text-sm text-muted-foreground">
 {product.characteristics.map((characteristic) => (
 <li key={characteristic}>- {characteristic}</li>
 ))}
 </ul>
 ) : null}
 </div>

 <div className="space-y-3 rounded-xl border border-border/70 bg-card/45 p-4">
 <h2 className="text-2xl font-semibold">Variacoes</h2>
 <div className="grid gap-2">
 {product.variants.map((variant) => (
 <div
 className="rounded-md border border-border/70 bg-card/50 p-3 text-sm"
 key={variant.id}
 >
 <p className="font-medium">
 {variant.variationLabel ?? `${variant.sizeLabel} / ${variant.colorLabel}`}
 </p>
 <p className="text-xs text-muted-foreground">SKU {variant.sku}</p>
 <p className="text-xs text-muted-foreground">
 Disponivel: {variant.availableQuantity}
 </p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="space-y-3">
 <h2 className="text-2xl font-semibold">Produtos relacionados</h2>
 {relatedProducts.length === 0 ? (
 <p className="text-sm text-muted-foreground">Sem relacionados cadastrados no momento.</p>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {relatedProducts.map((relatedProduct) => (
 <Link
 className="rounded-lg border border-border/70 bg-card/45 p-4 transition-colors hover:border-gold-500/55"
 href={`/loja/${relatedProduct.slug}` as Route}
 key={`${relatedProduct.id}-related`}
 >
 <p className="font-medium">{relatedProduct.name}</p>
 <p className="text-sm text-gold-400">{formatCurrencyBRL(relatedProduct.minPrice)}</p>
 <p className="text-xs text-muted-foreground">
 {relatedProduct.isAvailable ? "Disponivel" : "Indisponivel"}
 </p>
 </Link>
 ))}
 </div>
 )}
 </section>

 <section className="space-y-3">
 <h2 className="text-2xl font-semibold">Da mesma colecao</h2>
 {sameCollectionProducts.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 Ainda nao ha outros produtos vinculados nesta colecao.
 </p>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {sameCollectionProducts.map((relatedProduct) => (
 <Link
 className="rounded-lg border border-border/70 bg-card/45 p-4 transition-colors hover:border-gold-500/55"
 href={`/loja/${relatedProduct.slug}` as Route}
 key={`${relatedProduct.id}-same-collection`}
 >
 <p className="font-medium">{relatedProduct.name}</p>
 <p className="text-sm text-gold-400">{formatCurrencyBRL(relatedProduct.minPrice)}</p>
 <p className="text-xs text-muted-foreground">
 {relatedProduct.isAvailable ? "Disponivel" : "Indisponivel"}
 </p>
 </Link>
 ))}
 </div>
 )}
 </section>
 </Container>
 );
}
