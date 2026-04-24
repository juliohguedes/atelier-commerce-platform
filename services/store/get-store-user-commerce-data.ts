import { storeFallbackProductDetails } from "@/lib/constants/store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
 StoreAddressOption,
 StoreCartItem,
 StoreSavedItem,
 StoreUserCommerceData,
 StoreWishlistItem
} from "@/types/store";

interface CartRow {
 id: string;
 product_id: string;
 variant_id: string;
 quantity: number;
}

interface SavedRow {
 id: string;
 product_id: string;
 variant_id: string;
 quantity: number;
}

interface WishlistRow {
 id: string;
 product_id: string;
 variant_id: string | null;
 notify_on_restock: boolean;
}

interface ProductRow {
 id: string;
 slug: string;
 name: string;
 base_price: number;
 collection_id: string | null;
}

interface VariantRow {
 id: string;
 product_id: string;
 sku: string;
 size_label: string;
 color_label: string;
 available_quantity: number;
 price_override: number | null;
}

interface ImageRow {
 product_id: string;
 image_url: string;
 alt_text: string | null;
 display_order: number;
}

interface CollectionRow {
 id: string;
 name: string;
}

interface AddressRow {
 id: string;
 label: string;
 recipient_name: string;
 zip_code: string;
 street: string;
 number: string;
 complement: string | null;
 neighborhood: string;
 city: string;
 state: string;
 is_primary: boolean;
}

interface ProfileRow {
 cpf: string | null;
}

function createEmptySummary(): StoreUserCommerceData {
 return {
 cartItems: [],
 savedItems: [],
 wishlistItems: [],
 addresses: [],
 checkoutRequirements: {
 requiresCpf: false,
 savedCpf: null
 },
 summary: {
 subtotal: 0,
 shippingCost: 0,
 total: 0,
 totalItems: 0
 }
 };
}

function buildFallbackCommerceData(): StoreUserCommerceData {
 const base = createEmptySummary();
 const firstProduct = storeFallbackProductDetails[0];
 const firstVariant = firstProduct?.variants[0];
 const firstImage = firstProduct?.images[0];

 if (!firstProduct || !firstVariant) {
 return base;
 }

 const item: StoreCartItem = {
 id: "fallback-cart-item-1",
 quantity: 1,
 productId: firstProduct.id,
 variantId: firstVariant.id,
 sku: firstVariant.sku,
 productName: firstProduct.name,
 productSlug: firstProduct.slug,
 collectionName: firstProduct.collectionName,
 sizeLabel: firstVariant.sizeLabel,
 colorLabel: firstVariant.colorLabel,
 imageUrl: firstImage?.imageUrl ?? null,
 imageAlt: firstImage?.altText ?? null,
 unitPrice: firstVariant.price,
 availableQuantity: firstVariant.availableQuantity,
 lineTotal: firstVariant.price
 };

 return {
 cartItems: [item],
 savedItems: [],
 wishlistItems: [],
 addresses: [],
 checkoutRequirements: {
 requiresCpf: false,
 savedCpf: null
 },
 summary: {
 subtotal: item.lineTotal,
 shippingCost: 0,
 total: item.lineTotal,
 totalItems: 1
 }
 };
}

export async function getStoreUserCommerceData(
 userId: string
): Promise<StoreUserCommerceData> {
 if (!isSupabaseConfigured) {
 return buildFallbackCommerceData();
 }

 try {
 const supabase = await createSupabaseServerClient();
 const [cartResponse, savedResponse, wishlistResponse, addressesResponse, profileResponse] =
 await Promise.all([
 supabase
 .from("cart_items")
 .select("id,product_id,variant_id,quantity")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<CartRow[]>(),
 supabase
 .from("saved_for_later_items")
 .select("id,product_id,variant_id,quantity")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<SavedRow[]>(),
 supabase
 .from("wishlist_items")
 .select("id,product_id,variant_id,notify_on_restock")
 .eq("user_id", userId)
 .order("created_at", { ascending: false })
 .returns<WishlistRow[]>(),
 supabase
 .from("addresses")
 .select(
 "id,label,recipient_name,zip_code,street,number,complement,neighborhood,city,state,is_primary"
 )
 .eq("user_id", userId)
 .order("is_primary", { ascending: false })
 .order("created_at", { ascending: true })
 .returns<AddressRow[]>(),
 supabase.from("profiles").select("cpf").eq("id", userId).maybeSingle<ProfileRow>()
 ]);

 const cartRows = cartResponse.data ?? [];
 const savedRows = savedResponse.data ?? [];
 const wishlistRows = wishlistResponse.data ?? [];

 const productIds = Array.from(
 new Set([
 ...cartRows.map((row) => row.product_id),
 ...savedRows.map((row) => row.product_id),
 ...wishlistRows.map((row) => row.product_id)
 ])
 );

 const [productsResponse, variantsResponse, imagesResponse] = await Promise.all([
 productIds.length > 0
 ? supabase
 .from("store_products")
 .select("id,slug,name,base_price,collection_id")
 .in("id", productIds)
 .returns<ProductRow[]>()
 : Promise.resolve({ data: [] as ProductRow[] }),
 productIds.length > 0
 ? supabase
 .from("store_product_variants")
 .select("id,product_id,sku,size_label,color_label,available_quantity,price_override")
 .in("product_id", productIds)
 .eq("is_active", true)
 .returns<VariantRow[]>()
 : Promise.resolve({ data: [] as VariantRow[] }),
 productIds.length > 0
 ? supabase
 .from("store_product_images")
 .select("product_id,image_url,alt_text,display_order")
 .in("product_id", productIds)
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>()
 : Promise.resolve({ data: [] as ImageRow[] })
 ]);

 const collectionIds = Array.from(
 new Set(
 (productsResponse.data ?? [])
 .map((product) => product.collection_id)
 .filter((collectionId): collectionId is string => Boolean(collectionId))
 )
 );

 const collectionsResponse = collectionIds.length
 ? await supabase
 .from("store_collections")
 .select("id,name")
 .in("id", collectionIds)
 .returns<CollectionRow[]>()
 : { data: [] as CollectionRow[] };

 const productsById = new Map((productsResponse.data ?? []).map((row) => [row.id, row]));
 const variantsById = new Map((variantsResponse.data ?? []).map((row) => [row.id, row]));
 const collectionsById = new Map((collectionsResponse.data ?? []).map((row) => [row.id, row]));

 const firstImageByProductId = new Map<string, ImageRow>();
 for (const row of imagesResponse.data ?? []) {
 if (!firstImageByProductId.has(row.product_id)) {
 firstImageByProductId.set(row.product_id, row);
 }
 }

 const mapToCartItem = (row: CartRow | SavedRow): StoreCartItem | null => {
 const product = productsById.get(row.product_id);
 const variant = variantsById.get(row.variant_id);
 if (!product || !variant) {
 return null;
 }

 const collection = product.collection_id
 ? collectionsById.get(product.collection_id)
 : null;
 const image = firstImageByProductId.get(product.id);
 const unitPrice = Number(variant.price_override ?? product.base_price);

 return {
 id: row.id,
 quantity: row.quantity,
 productId: product.id,
 variantId: variant.id,
 sku: variant.sku,
 productName: product.name,
 productSlug: product.slug,
 collectionName: collection?.name ?? null,
 sizeLabel: variant.size_label,
 colorLabel: variant.color_label,
 imageUrl: image?.image_url ?? null,
 imageAlt: image?.alt_text ?? null,
 unitPrice,
 availableQuantity: Number(variant.available_quantity),
 lineTotal: unitPrice * row.quantity
 };
 };

 const cartItems = cartRows
 .map((row) => mapToCartItem(row))
 .filter((item): item is StoreCartItem => item !== null);
 const savedItems = savedRows
 .map((row) => mapToCartItem(row))
 .filter((item): item is StoreSavedItem => item !== null);

 const wishlistItems: StoreWishlistItem[] = wishlistRows
 .map((row) => {
 const product = productsById.get(row.product_id);
 if (!product) {
 return null;
 }

 const variant = row.variant_id ? variantsById.get(row.variant_id) : undefined;
 const image = firstImageByProductId.get(product.id);
 const price = Number(variant?.price_override ?? product.base_price);
 const isAvailable = variant
 ? Number(variant.available_quantity) > 0
 : Number(
 (variantsResponse.data ?? [])
 .filter((item) => item.product_id === product.id)
 .reduce(
 (accumulator, currentItem) =>
 accumulator + Number(currentItem.available_quantity),
 0
 )
 ) > 0;

 return {
 id: row.id,
 productId: product.id,
 productSlug: product.slug,
 productName: product.name,
 imageUrl: image?.image_url ?? null,
 imageAlt: image?.alt_text ?? null,
 price,
 isAvailable,
 variantId: variant?.id ?? null,
 sizeLabel: variant?.size_label ?? null,
 colorLabel: variant?.color_label ?? null,
 notifyOnRestock: row.notify_on_restock
 } satisfies StoreWishlistItem;
 })
 .filter((item): item is StoreWishlistItem => item !== null);

 const addresses: StoreAddressOption[] = (addressesResponse.data ?? []).map((row) => ({
 id: row.id,
 label: row.label,
 recipientName: row.recipient_name,
 zipCode: row.zip_code,
 street: row.street,
 number: row.number,
 complement: row.complement,
 neighborhood: row.neighborhood,
 city: row.city,
 state: row.state,
 isPrimary: row.is_primary
 }));

 const subtotal = cartItems.reduce(
 (accumulator, currentItem) => accumulator + currentItem.lineTotal,
 0
 );
 const shippingCost = 0;
 const totalItems = cartItems.reduce(
 (accumulator, currentItem) => accumulator + currentItem.quantity,
 0
 );

 return {
 cartItems,
 savedItems,
 wishlistItems,
 addresses,
 checkoutRequirements: {
 requiresCpf: !Boolean(profileResponse.data?.cpf),
 savedCpf: profileResponse.data?.cpf ?? null
 },
 summary: {
 subtotal,
 shippingCost,
 total: subtotal + shippingCost,
 totalItems
 }
 };
 } catch {
 return buildFallbackCommerceData();
 }
}
