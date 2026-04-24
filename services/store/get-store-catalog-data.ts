import {
 storeFallbackCategories,
 storeFallbackCollections,
 storeFallbackProductDetails
} from "@/lib/constants/store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { storeCatalogSearchSchema } from "@/lib/validations/store";
import type {
 StoreCatalogData,
 StoreCatalogFilters,
 StoreCategory,
 StoreCollection,
 StoreProductDetail,
 StoreProductImage,
 StoreProductListItem,
 StoreProductVariant,
 StoreRelatedProduct,
 StoreSortOption
} from "@/types/store";

interface CategoryRow {
 id: string;
 slug: string;
 name: string;
 description: string | null;
}

interface CollectionRow {
 id: string;
 slug: string;
 name: string;
 theme_style: string | null;
 description: string | null;
 is_featured: boolean;
}

interface ProductRow {
 id: string;
 slug: string;
 sku_base: string;
 name: string;
 short_description: string | null;
 description: string | null;
 characteristics: string[] | null;
 category_id: string | null;
 collection_id: string | null;
 theme_style: string | null;
 base_price: number;
 compare_at_price: number | null;
 is_featured: boolean;
 is_new_arrival: boolean;
 metadata: Record<string, unknown> | null;
 created_at: string;
}

interface VariantRow {
 id: string;
 product_id: string;
 sku: string;
 size_label: string;
 color_label: string;
 variation_label: string | null;
 stock_quantity: number;
 reserved_quantity: number;
 available_quantity: number;
 price_override: number | null;
 is_active: boolean;
}

interface ImageRow {
 id: string;
 product_id: string;
 image_url: string;
 alt_text: string | null;
 display_order: number;
}

interface RelatedRow {
 related_product_id: string;
 relation_type: "related" | "same_collection";
}

function toSingleValue(value: string | string[] | undefined): string | undefined {
 if (Array.isArray(value)) {
 return value[0];
 }

 return value;
}

function parseCatalogFilters(
 rawSearchParams: Record<string, string | string[] | undefined>
): StoreCatalogFilters {
 const parsed = storeCatalogSearchSchema.safeParse({
 categoria: toSingleValue(rawSearchParams.categoria),
 colecao: toSingleValue(rawSearchParams.colecao),
 tamanho: toSingleValue(rawSearchParams.tamanho),
 cor: toSingleValue(rawSearchParams.cor),
 precoMin: toSingleValue(rawSearchParams.precoMin),
 precoMax: toSingleValue(rawSearchParams.precoMax),
 sort: toSingleValue(rawSearchParams.sort)
 });

 if (!parsed.success) {
 return {
 sort: "destaque"
 };
 }

 return {
 category: parsed.data.categoria,
 collection: parsed.data.colecao,
 size: parsed.data.tamanho,
 color: parsed.data.cor,
 minPrice: parsed.data.precoMin,
 maxPrice: parsed.data.precoMax,
 sort: parsed.data.sort
 };
}

function compareBySort(
 a: StoreProductListItem,
 b: StoreProductListItem,
 sort: StoreSortOption
): number {
 switch (sort) {
 case "mais_recentes":
 return b.createdAt.localeCompare(a.createdAt);
 case "preco_menor":
 return a.minVariantPrice - b.minVariantPrice;
 case "preco_maior":
 return b.minVariantPrice - a.minVariantPrice;
 case "mais_vendidos":
 return b.salesCount - a.salesCount || a.name.localeCompare(b.name);
 case "destaque":
 default:
 return (
 Number(b.isFeatured) - Number(a.isFeatured) ||
 Number(b.isNewArrival) - Number(a.isNewArrival) ||
 b.salesCount - a.salesCount ||
 a.name.localeCompare(b.name)
 );
 }
}

function applyCatalogFilters(
 products: StoreProductListItem[],
 filters: StoreCatalogFilters
): StoreProductListItem[] {
 const filtered = products.filter((product) => {
 if (filters.category && product.categorySlug !== filters.category) {
 return false;
 }

 if (filters.collection && product.collectionSlug !== filters.collection) {
 return false;
 }

 if (filters.size && !product.sizes.includes(filters.size)) {
 return false;
 }

 if (filters.color && !product.colors.includes(filters.color)) {
 return false;
 }

 if (typeof filters.minPrice === "number" && product.minVariantPrice < filters.minPrice) {
 return false;
 }

 if (typeof filters.maxPrice === "number" && product.minVariantPrice > filters.maxPrice) {
 return false;
 }

 return true;
 });

 return filtered.sort((a, b) => compareBySort(a, b, filters.sort));
}

function createVariantFromRow(row: VariantRow, basePrice: number): StoreProductVariant {
 return {
 id: row.id,
 sku: row.sku,
 sizeLabel: row.size_label,
 colorLabel: row.color_label,
 variationLabel: row.variation_label,
 stockQuantity: Number(row.stock_quantity),
 reservedQuantity: Number(row.reserved_quantity),
 availableQuantity: Number(row.available_quantity),
 price: Number(row.price_override ?? basePrice),
 isActive: row.is_active
 };
}

function createImageFromRow(row: ImageRow): StoreProductImage {
 return {
 id: row.id,
 imageUrl: row.image_url,
 altText: row.alt_text,
 displayOrder: row.display_order
 };
}

function toListItem(detail: StoreProductDetail): StoreProductListItem {
 const prices = detail.variants.map((variant) => variant.price);
 const minVariantPrice = prices.length > 0 ? Math.min(...prices) : detail.basePrice;
 const maxVariantPrice = prices.length > 0 ? Math.max(...prices) : detail.basePrice;
 const image = [...detail.images].sort((a, b) => a.displayOrder - b.displayOrder)[0];

 return {
 id: detail.id,
 slug: detail.slug,
 skuBase: detail.skuBase,
 name: detail.name,
 shortDescription: detail.shortDescription,
 categorySlug: detail.categorySlug,
 categoryName: detail.categoryName,
 collectionSlug: detail.collectionSlug,
 collectionName: detail.collectionName,
 themeStyle: detail.themeStyle,
 basePrice: detail.basePrice,
 compareAtPrice: detail.compareAtPrice,
 minVariantPrice,
 maxVariantPrice,
 isFeatured: detail.isFeatured,
 isNewArrival: detail.isNewArrival,
 salesCount: 0,
 createdAt: "2026-01-01T00:00:00.000Z",
 isAvailable: detail.isAvailable,
 totalAvailableUnits: detail.totalAvailableUnits,
 sizes: Array.from(new Set(detail.variants.map((variant) => variant.sizeLabel))).sort(),
 colors: Array.from(new Set(detail.variants.map((variant) => variant.colorLabel))).sort(),
 imageUrl: image?.imageUrl ?? null,
 imageAlt: image?.altText ?? null
 };
}

function buildFallbackCatalog(filters: StoreCatalogFilters): StoreCatalogData {
 const listItems = storeFallbackProductDetails.map((detail) => toListItem(detail));
 const salesCountBySlug: Record<string, number> = {
 "blazer-aurora": 42,
 "vestido-imperial": 29,
 "jaqueta-noir-biker": 18,
 "conjunto-lumiere": 36,
 "camisa-essence-seda": 24,
 "saia-midi-dourada": 15
 };

 const enrichedList = listItems.map((item, index) => ({
 ...item,
 salesCount: salesCountBySlug[item.slug] ?? 0,
 createdAt: new Date(2026, 0, index + 2).toISOString()
 }));

 const filtered = applyCatalogFilters(enrichedList, filters);
 const availableSizes = Array.from(
 new Set(enrichedList.flatMap((product) => product.sizes))
 ).sort();
 const availableColors = Array.from(
 new Set(enrichedList.flatMap((product) => product.colors))
 ).sort();

 return {
 products: filtered,
 categories: storeFallbackCategories,
 collections: storeFallbackCollections,
 availableSizes,
 availableColors,
 filters
 };
}

function mapDetailFromRows(
 productRow: ProductRow,
 categoriesById: Map<string, StoreCategory>,
 collectionsById: Map<string, StoreCollection>,
 variants: StoreProductVariant[],
 images: StoreProductImage[],
 related: StoreRelatedProduct[]
): StoreProductDetail {
 const activeVariants = variants.filter((variant) => variant.isActive);
 const totalAvailableUnits = activeVariants.reduce(
 (accumulator, variant) => accumulator + variant.availableQuantity,
 0
 );
 const category = productRow.category_id ? categoriesById.get(productRow.category_id) : undefined;
 const collection = productRow.collection_id
 ? collectionsById.get(productRow.collection_id)
 : undefined;

 return {
 id: productRow.id,
 slug: productRow.slug,
 skuBase: productRow.sku_base,
 name: productRow.name,
 shortDescription: productRow.short_description,
 description: productRow.description,
 characteristics: productRow.characteristics ?? [],
 categorySlug: category?.slug ?? null,
 categoryName: category?.name ?? null,
 collectionSlug: collection?.slug ?? null,
 collectionName: collection?.name ?? null,
 themeStyle: productRow.theme_style,
 basePrice: Number(productRow.base_price),
 compareAtPrice:
 productRow.compare_at_price !== null ? Number(productRow.compare_at_price) : null,
 isFeatured: productRow.is_featured,
 isNewArrival: productRow.is_new_arrival,
 isAvailable: totalAvailableUnits > 0,
 totalAvailableUnits,
 images: [...images].sort((a, b) => a.displayOrder - b.displayOrder),
 variants: activeVariants,
 related
 };
}

async function getCatalogFromSupabase(
 filters: StoreCatalogFilters
): Promise<StoreCatalogData | null> {
 try {
 const supabase = await createSupabaseServerClient();
 const [categoriesResponse, collectionsResponse, productsResponse] = await Promise.all([
 supabase
 .from("store_categories")
 .select("id,slug,name,description")
 .eq("is_active", true)
 .order("display_order", { ascending: true })
 .order("name", { ascending: true })
 .returns<CategoryRow[]>(),
 supabase
 .from("store_collections")
 .select("id,slug,name,theme_style,description,is_featured")
 .eq("is_active", true)
 .order("is_featured", { ascending: false })
 .order("name", { ascending: true })
 .returns<CollectionRow[]>(),
 supabase
 .from("store_products")
 .select(
 "id,slug,sku_base,name,short_description,description,characteristics,category_id,collection_id,theme_style,base_price,compare_at_price,is_featured,is_new_arrival,metadata,created_at"
 )
 .eq("is_active", true)
 .returns<ProductRow[]>()
 ]);

 const categoriesRows = categoriesResponse.data ?? [];
 const collectionsRows = collectionsResponse.data ?? [];
 const productsRows = productsResponse.data ?? [];

 if (productsRows.length === 0) {
 return {
 products: [],
 categories: categoriesRows.map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 description: row.description
 })),
 collections: collectionsRows.map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 themeStyle: row.theme_style,
 description: row.description,
 isFeatured: row.is_featured
 })),
 availableSizes: [],
 availableColors: [],
 filters
 };
 }

 const productIds = productsRows.map((row) => row.id);

 const [variantsResponse, imagesResponse] = await Promise.all([
 supabase
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,variation_label,stock_quantity,reserved_quantity,available_quantity,price_override,is_active"
 )
 .in("product_id", productIds)
 .eq("is_active", true)
 .returns<VariantRow[]>(),
 supabase
 .from("store_product_images")
 .select("id,product_id,image_url,alt_text,display_order")
 .in("product_id", productIds)
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>()
 ]);

 const categories = categoriesRows.map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 description: row.description
 }));
 const collections = collectionsRows.map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 themeStyle: row.theme_style,
 description: row.description,
 isFeatured: row.is_featured
 }));

 const categoriesById = new Map(categories.map((category) => [category.id, category]));
 const collectionsById = new Map(collections.map((collection) => [collection.id, collection]));

 const variantsByProductId = new Map<string, StoreProductVariant[]>();
 for (const row of variantsResponse.data ?? []) {
 const productRow = productsRows.find((product) => product.id === row.product_id);
 if (!productRow) {
 continue;
 }

 const mapped = createVariantFromRow(row, Number(productRow.base_price));
 const current = variantsByProductId.get(row.product_id) ?? [];
 variantsByProductId.set(row.product_id, [...current, mapped]);
 }

 const imagesByProductId = new Map<string, StoreProductImage[]>();
 for (const row of imagesResponse.data ?? []) {
 const mapped = createImageFromRow(row);
 const current = imagesByProductId.get(row.product_id) ?? [];
 imagesByProductId.set(row.product_id, [...current, mapped]);
 }

 const listItems: StoreProductListItem[] = productsRows.map((productRow) => {
 const detail = mapDetailFromRows(
 productRow,
 categoriesById,
 collectionsById,
 variantsByProductId.get(productRow.id) ?? [],
 imagesByProductId.get(productRow.id) ?? [],
 []
 );

 const listItem = toListItem(detail);
 const salesCountRaw = productRow.metadata?.sales_count;
 const salesCount =
 typeof salesCountRaw === "number"
 ? salesCountRaw
 : typeof salesCountRaw === "string"
 ? Number(salesCountRaw)
 : 0;

 return {
 ...listItem,
 createdAt: productRow.created_at,
 salesCount: Number.isFinite(salesCount) ? salesCount : 0
 };
 });

 const filtered = applyCatalogFilters(listItems, filters);
 const availableSizes = Array.from(
 new Set(listItems.flatMap((product) => product.sizes))
 ).sort();
 const availableColors = Array.from(
 new Set(listItems.flatMap((product) => product.colors))
 ).sort();

 return {
 products: filtered,
 categories,
 collections,
 availableSizes,
 availableColors,
 filters
 };
 } catch {
 return null;
 }
}

async function getDetailFromSupabase(slug: string): Promise<StoreProductDetail | null> {
 try {
 const supabase = await createSupabaseServerClient();
 const { data: productRow } = await supabase
 .from("store_products")
 .select(
 "id,slug,sku_base,name,short_description,description,characteristics,category_id,collection_id,theme_style,base_price,compare_at_price,is_featured,is_new_arrival,metadata,created_at"
 )
 .eq("slug", slug)
 .eq("is_active", true)
 .maybeSingle<ProductRow>();

 if (!productRow) {
 return null;
 }

 const [categoriesResponse, collectionsResponse, variantsResponse, imagesResponse, relatedRowsResponse, sameCollectionResponse] =
 await Promise.all([
 supabase
 .from("store_categories")
 .select("id,slug,name,description")
 .eq("is_active", true)
 .returns<CategoryRow[]>(),
 supabase
 .from("store_collections")
 .select("id,slug,name,theme_style,description,is_featured")
 .eq("is_active", true)
 .returns<CollectionRow[]>(),
 supabase
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,variation_label,stock_quantity,reserved_quantity,available_quantity,price_override,is_active"
 )
 .eq("product_id", productRow.id)
 .eq("is_active", true)
 .returns<VariantRow[]>(),
 supabase
 .from("store_product_images")
 .select("id,product_id,image_url,alt_text,display_order")
 .eq("product_id", productRow.id)
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>(),
 supabase
 .from("store_related_products")
 .select("related_product_id,relation_type")
 .eq("product_id", productRow.id)
 .returns<RelatedRow[]>(),
 productRow.collection_id
 ? supabase
 .from("store_products")
 .select("id")
 .eq("collection_id", productRow.collection_id)
 .eq("is_active", true)
 .neq("id", productRow.id)
 .limit(4)
 .returns<Array<{ id: string }>>()
 : Promise.resolve({ data: [] as Array<{ id: string }> })
 ]);

 const categories = (categoriesResponse.data ?? []).map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 description: row.description
 }));
 const collections = (collectionsResponse.data ?? []).map((row) => ({
 id: row.id,
 slug: row.slug,
 name: row.name,
 themeStyle: row.theme_style,
 description: row.description,
 isFeatured: row.is_featured
 }));

 const categoriesById = new Map(categories.map((category) => [category.id, category]));
 const collectionsById = new Map(collections.map((collection) => [collection.id, collection]));

 const relatedMap = new Map<string, "related" | "same_collection">();
 for (const row of relatedRowsResponse.data ?? []) {
 relatedMap.set(row.related_product_id, row.relation_type);
 }

 for (const row of sameCollectionResponse.data ?? []) {
 if (!relatedMap.has(row.id)) {
 relatedMap.set(row.id, "same_collection");
 }
 }

 const relatedIds = Array.from(relatedMap.keys());
 let relatedRows: ProductRow[] = [];
 if (relatedIds.length > 0) {
 const response = await supabase
 .from("store_products")
 .select(
 "id,slug,sku_base,name,short_description,description,characteristics,category_id,collection_id,theme_style,base_price,compare_at_price,is_featured,is_new_arrival,metadata,created_at"
 )
 .in("id", relatedIds)
 .eq("is_active", true)
 .returns<ProductRow[]>();

 relatedRows = response.data ?? [];
 }

 const relatedVariantIds = relatedRows.map((row) => row.id);
 const [relatedVariantsResponse, relatedImagesResponse] = relatedVariantIds.length
 ? await Promise.all([
 supabase
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,variation_label,stock_quantity,reserved_quantity,available_quantity,price_override,is_active"
 )
 .in("product_id", relatedVariantIds)
 .eq("is_active", true)
 .returns<VariantRow[]>(),
 supabase
 .from("store_product_images")
 .select("id,product_id,image_url,alt_text,display_order")
 .in("product_id", relatedVariantIds)
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>()
 ])
 : [
 { data: [] as VariantRow[] },
 { data: [] as ImageRow[] }
 ];

 const relatedVariantsByProductId = new Map<string, StoreProductVariant[]>();
 for (const row of relatedVariantsResponse.data ?? []) {
 const product = relatedRows.find((item) => item.id === row.product_id);
 if (!product) {
 continue;
 }

 const current = relatedVariantsByProductId.get(row.product_id) ?? [];
 relatedVariantsByProductId.set(row.product_id, [
 ...current,
 createVariantFromRow(row, Number(product.base_price))
 ]);
 }

 const relatedImagesByProductId = new Map<string, StoreProductImage[]>();
 for (const row of relatedImagesResponse.data ?? []) {
 const current = relatedImagesByProductId.get(row.product_id) ?? [];
 relatedImagesByProductId.set(row.product_id, [...current, createImageFromRow(row)]);
 }

 const relatedProducts: StoreRelatedProduct[] = relatedRows
 .map((row) => {
 const variants = relatedVariantsByProductId.get(row.id) ?? [];
 const activeVariants = variants.filter((variant) => variant.isActive);
 const firstImage = [...(relatedImagesByProductId.get(row.id) ?? [])].sort(
 (a, b) => a.displayOrder - b.displayOrder
 )[0];
 const prices = activeVariants.map((variant) => variant.price);
 const minPrice = prices.length > 0 ? Math.min(...prices) : Number(row.base_price);
 const isAvailable = activeVariants.some((variant) => variant.availableQuantity > 0);

 const relationType = relatedMap.get(row.id);
 if (!relationType) {
 return null;
 }

 return {
 id: row.id,
 slug: row.slug,
 name: row.name,
 imageUrl: firstImage?.imageUrl ?? null,
 minPrice,
 isAvailable,
 relationType
 } satisfies StoreRelatedProduct;
 })
 .filter((item): item is StoreRelatedProduct => item !== null)
 .sort((a, b) => a.name.localeCompare(b.name));

 const mappedVariants = (variantsResponse.data ?? []).map((row) =>
 createVariantFromRow(row, Number(productRow.base_price))
 );
 const mappedImages = (imagesResponse.data ?? []).map((row) => createImageFromRow(row));

 return mapDetailFromRows(
 productRow,
 categoriesById,
 collectionsById,
 mappedVariants,
 mappedImages,
 relatedProducts
 );
 } catch {
 return null;
 }
}

export async function getStoreCatalogData(
 rawSearchParams: Record<string, string | string[] | undefined>
): Promise<StoreCatalogData> {
 const filters = parseCatalogFilters(rawSearchParams);

 if (!isSupabaseConfigured) {
 return buildFallbackCatalog(filters);
 }

 const supabaseData = await getCatalogFromSupabase(filters);

 if (!supabaseData) {
 return buildFallbackCatalog(filters);
 }

 return supabaseData;
}

export async function getStoreProductDetailBySlug(
 slug: string
): Promise<StoreProductDetail | null> {
 if (!isSupabaseConfigured) {
 return storeFallbackProductDetails.find((detail) => detail.slug === slug) ?? null;
 }

 const supabaseData = await getDetailFromSupabase(slug);
 if (!supabaseData) {
 return storeFallbackProductDetails.find((detail) => detail.slug === slug) ?? null;
 }

 return supabaseData;
}
