import Link from "next/link";
import { storeSortLabels } from "@/lib/constants/store";
import type { StoreCatalogData } from "@/types/store";

interface StoreCatalogFiltersProps {
 catalog: StoreCatalogData;
}

const nativeSelectClassName =
 "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StoreCatalogFilters({ catalog }: StoreCatalogFiltersProps) {
 return (
 <form className="grid gap-3 rounded-xl border border-border/70 bg-card/55 p-4 md:grid-cols-6">
 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Categoria
 </label>
 <select className={nativeSelectClassName} defaultValue={catalog.filters.category ?? ""} name="categoria">
 <option value="">Todas</option>
 {catalog.categories.map((category) => (
 <option key={category.id} value={category.slug}>
 {category.name}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Colecao
 </label>
 <select
 className={nativeSelectClassName}
 defaultValue={catalog.filters.collection ?? ""}
 name="colecao"
 >
 <option value="">Todas</option>
 {catalog.collections.map((collection) => (
 <option key={collection.id} value={collection.slug}>
 {collection.name}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Tamanho
 </label>
 <select className={nativeSelectClassName} defaultValue={catalog.filters.size ?? ""} name="tamanho">
 <option value="">Todos</option>
 {catalog.availableSizes.map((size) => (
 <option key={size} value={size}>
 {size}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Cor
 </label>
 <select className={nativeSelectClassName} defaultValue={catalog.filters.color ?? ""} name="cor">
 <option value="">Todas</option>
 {catalog.availableColors.map((color) => (
 <option key={color} value={color}>
 {color}
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Preco minimo
 </label>
 <input
 className={nativeSelectClassName}
 defaultValue={catalog.filters.minPrice ?? ""}
 min={0}
 name="precoMin"
 placeholder="0"
 step="0.01"
 type="number"
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Preco maximo
 </label>
 <input
 className={nativeSelectClassName}
 defaultValue={catalog.filters.maxPrice ?? ""}
 min={0}
 name="precoMax"
 placeholder="9999"
 step="0.01"
 type="number"
 />
 </div>

 <div className="space-y-1 md:col-span-2">
 <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
 Ordenacao
 </label>
 <select className={nativeSelectClassName} defaultValue={catalog.filters.sort} name="sort">
 {Object.entries(storeSortLabels).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-end gap-2 md:col-span-4">
 <button
 className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold-400"
 type="submit"
 >
 Aplicar filtros
 </button>
 <Link
 className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:border-gold-500 hover:text-gold-400"
 href="/loja"
 >
 Limpar
 </Link>
 </div>
 </form>
 );
}
