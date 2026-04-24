import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import type { StoreProductListItem } from "@/types/store";

interface StoreProductCardProps {
 product: StoreProductListItem;
}

export function StoreProductCard({ product }: StoreProductCardProps) {
 const productHref = `/loja/${product.slug}` as Route;

 return (
 <Card className="group h-full overflow-hidden border-border/70 bg-card/70 transition-all hover:border-gold-500/55">
 <Link className="flex h-full flex-col" href={productHref}>
 <div className="relative aspect-[4/5] overflow-hidden border-b border-border/70 bg-muted/30">
 {product.imageUrl ? (
 <Image
 alt={product.imageAlt ?? product.name}
 className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
 fill
 src={product.imageUrl}
 unoptimized
 />
 ) : (
 <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
 Imagem indisponivel
 </div>
 )}

 <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
 {product.isFeatured ? (
 <span className="rounded-full border border-gold-500/60 bg-background/85 px-2 py-1 text-[11px] font-medium text-gold-400">
 Destaque
 </span>
 ) : null}
 {product.isNewArrival ? (
 <span className="rounded-full border border-border bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground">
 Novo
 </span>
 ) : null}
 </div>
 </div>

 <CardContent className="flex flex-1 flex-col gap-3 p-4">
 <div className="space-y-1">
 <p className="text-[11px] uppercase tracking-[0.22em] text-gold-400">
 {product.collectionName ?? "Colecao autoral"}
 </p>
 <h3 className="font-serif text-xl leading-tight">{product.name}</h3>
 {product.shortDescription ? (
 <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
 ) : null}
 </div>

 <div className="mt-auto space-y-1">
 {product.compareAtPrice ? (
 <p className="text-xs text-muted-foreground line-through">
 {formatCurrencyBRL(product.compareAtPrice)}
 </p>
 ) : null}
 <p className="text-lg font-semibold text-gold-400">
 {formatCurrencyBRL(product.minVariantPrice)}
 {product.maxVariantPrice > product.minVariantPrice
 ? ` - ${formatCurrencyBRL(product.maxVariantPrice)}`
 : ""}
 </p>
 <p
 className={
 product.isAvailable
 ? "text-xs text-green-500"
 : "text-xs text-destructive"
 }
 >
 {product.isAvailable ? "Disponivel em estoque" : "Indisponivel"}
 </p>
 </div>
 </CardContent>
 </Link>
 </Card>
 );
}
