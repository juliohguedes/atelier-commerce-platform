export const storeSortOptions = [
 "destaque",
 "mais_recentes",
 "preco_menor",
 "preco_maior",
 "mais_vendidos"
] as const;

export type StoreSortOption = (typeof storeSortOptions)[number];

export interface StoreCategory {
 id: string;
 slug: string;
 name: string;
 description: string | null;
}

export interface StoreCollection {
 id: string;
 slug: string;
 name: string;
 themeStyle: string | null;
 description: string | null;
 isFeatured: boolean;
}

export interface StoreProductImage {
 id: string;
 imageUrl: string;
 altText: string | null;
 displayOrder: number;
}

export interface StoreProductVariant {
 id: string;
 sku: string;
 sizeLabel: string;
 colorLabel: string;
 variationLabel: string | null;
 stockQuantity: number;
 reservedQuantity: number;
 availableQuantity: number;
 price: number;
 isActive: boolean;
}

export interface StoreProductListItem {
 id: string;
 slug: string;
 skuBase: string;
 name: string;
 shortDescription: string | null;
 categorySlug: string | null;
 categoryName: string | null;
 collectionSlug: string | null;
 collectionName: string | null;
 themeStyle: string | null;
 basePrice: number;
 compareAtPrice: number | null;
 minVariantPrice: number;
 maxVariantPrice: number;
 isFeatured: boolean;
 isNewArrival: boolean;
 salesCount: number;
 createdAt: string;
 isAvailable: boolean;
 totalAvailableUnits: number;
 sizes: string[];
 colors: string[];
 imageUrl: string | null;
 imageAlt: string | null;
}

export interface StoreRelatedProduct {
 id: string;
 slug: string;
 name: string;
 imageUrl: string | null;
 minPrice: number;
 isAvailable: boolean;
 relationType: "related" | "same_collection";
}

export interface StoreProductDetail {
 id: string;
 slug: string;
 skuBase: string;
 name: string;
 shortDescription: string | null;
 description: string | null;
 characteristics: string[];
 categorySlug: string | null;
 categoryName: string | null;
 collectionSlug: string | null;
 collectionName: string | null;
 themeStyle: string | null;
 basePrice: number;
 compareAtPrice: number | null;
 isFeatured: boolean;
 isNewArrival: boolean;
 isAvailable: boolean;
 totalAvailableUnits: number;
 images: StoreProductImage[];
 variants: StoreProductVariant[];
 related: StoreRelatedProduct[];
}

export interface StoreCatalogFilters {
 category?: string;
 collection?: string;
 size?: string;
 color?: string;
 minPrice?: number;
 maxPrice?: number;
 sort: StoreSortOption;
}

export interface StoreCatalogData {
 products: StoreProductListItem[];
 categories: StoreCategory[];
 collections: StoreCollection[];
 availableSizes: string[];
 availableColors: string[];
 filters: StoreCatalogFilters;
}

export interface StoreCartItem {
 id: string;
 quantity: number;
 productId: string;
 variantId: string;
 sku: string;
 productName: string;
 productSlug: string;
 collectionName: string | null;
 sizeLabel: string;
 colorLabel: string;
 imageUrl: string | null;
 imageAlt: string | null;
 unitPrice: number;
 availableQuantity: number;
 lineTotal: number;
}

export type StoreSavedItem = StoreCartItem;

export interface StoreWishlistItem {
 id: string;
 productId: string;
 productSlug: string;
 productName: string;
 imageUrl: string | null;
 imageAlt: string | null;
 price: number;
 isAvailable: boolean;
 variantId: string | null;
 sizeLabel: string | null;
 colorLabel: string | null;
 notifyOnRestock: boolean;
}

export interface StoreAddressOption {
 id: string;
 label: string;
 recipientName: string;
 zipCode: string;
 street: string;
 number: string;
 complement: string | null;
 neighborhood: string;
 city: string;
 state: string;
 isPrimary: boolean;
}

export interface StoreCartSummary {
 subtotal: number;
 shippingCost: number;
 total: number;
 totalItems: number;
}

export interface StoreCheckoutRequirements {
 requiresCpf: boolean;
 savedCpf: string | null;
}

export interface StoreUserCommerceData {
 cartItems: StoreCartItem[];
 savedItems: StoreSavedItem[];
 wishlistItems: StoreWishlistItem[];
 addresses: StoreAddressOption[];
 checkoutRequirements: StoreCheckoutRequirements;
 summary: StoreCartSummary;
}

export interface StoreCheckoutResult {
 orderPublicId: string;
 orderNumber: string;
 invoiceNumber: string | null;
 totalAmount: number;
 paymentStatus: "pending" | "awaiting_payment" | "approved" | "failed" | "cancelled" | "refunded";
}
