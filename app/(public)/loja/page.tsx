import { StoreCatalogFilters } from "@/components/store/store-catalog-filters";
import { StoreProductCard } from "@/components/store/store-product-card";
import { Container } from "@/components/ui/container";
import { storePolicySections } from "@/lib/constants/store";
import { getStoreCatalogData } from "@/services/store/get-store-catalog-data";

interface ShopPageProps {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
 const resolvedSearchParams = await searchParams;
 const catalog = await getStoreCatalogData(resolvedSearchParams);

 return (
 <Container className="space-y-8 py-16 md:space-y-10">
 <header className="space-y-3">
 <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Loja Online</p>
 <h1 className="section-title">Pecas prontas em estoque</h1>
 <p className="max-w-3xl text-muted-foreground">
 Vitrine com categorias, colecoes, filtros por tamanho, cor e preco, ordenacao e
 disponibilidade em tempo real.
 </p>
 </header>

 <StoreCatalogFilters catalog={catalog} />

 <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
 <p>{catalog.products.length} item(ns) encontrado(s)</p>
 <p>
 Colecoes em destaque:{" "}
 {catalog.collections
 .filter((collection) => collection.isFeatured)
 .map((collection) => collection.name)
 .join(", ") || "Nenhuma no momento"}
 </p>
 </div>

 {catalog.products.length > 0 ? (
 <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {catalog.products.map((product) => (
 <StoreProductCard key={product.id} product={product} />
 ))}
 </div>
 ) : (
 <div className="rounded-xl border border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
 Nenhum produto encontrado com os filtros atuais. Ajuste os filtros para ver mais pecas.
 </div>
 )}

 <section className="grid gap-4 md:grid-cols-2">
 {storePolicySections.map((section) => (
 <div
 className="space-y-2 rounded-xl border border-border/70 bg-card/45 p-4"
 key={section.id}
 >
 <h2 className="text-xl font-semibold">{section.title}</h2>
 <ul className="space-y-1 text-sm text-muted-foreground">
 {section.items.map((item) => (
 <li key={item}>- {item}</li>
 ))}
 </ul>
 </div>
 ))}
 </section>
 </Container>
 );
}
