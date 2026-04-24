import { paymentStatusLabels, storeOrderStatusLabels } from "@/lib/constants/internal-panels";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SalesStockPanelFilters } from "@/lib/validations/internal-panels";
import type {
 SalesStockPanelData,
 SalesStockProductListItem,
 SalesStockVariantSummary
} from "@/types/internal-panels";

interface ProductRow {
 id: string;
 slug: string;
 name: string;
 short_description: string | null;
 description: string | null;
 category_id: string | null;
 collection_id: string | null;
 is_active: boolean;
 is_featured: boolean;
 low_stock_threshold: number;
}

interface CategoryRow {
 id: string;
 name: string;
}

interface CollectionRow {
 id: string;
 name: string;
}

interface VariantRow {
 id: string;
 product_id: string;
 sku: string;
 size_label: string;
 color_label: string;
 stock_quantity: number;
 reserved_quantity: number;
 available_quantity: number;
 is_active: boolean;
}

interface ImageRow {
 id: string;
 product_id: string;
 image_url: string;
 alt_text: string | null;
 display_order: number;
}

interface StoreOrderRow {
 id: number;
 public_id: string;
 order_number: string;
 user_id: string;
 status: "pedido_recebido" | "pagamento_aprovado" | "em_separacao" | "pronto_para_envio" | "enviado" | "entregue" | "cancelado";
 payment_status: "pending" | "awaiting_payment" | "approved" | "failed" | "cancelled" | "refunded";
 total_amount: number;
 shipping_carrier: string | null;
 tracking_code: string | null;
 created_at: string;
}

interface ProfileRow {
 id: string;
 full_name: string | null;
}

function buildMockData(): SalesStockPanelData {
 const createdAt = new Date().toISOString();

 return {
 metrics: {
 produtosAtivos: 1,
 estoqueBaixo: 0,
 indisponiveis: 0,
 pedidosEmSeparacao: 0,
 prontosParaEnvio: 0,
 enviadosHoje: 0
 },
 products: [
 {
 id: "00000000-0000-4000-8000-000000000031",
 slug: "blazer-demo",
 name: "Blazer Demo",
 categoryName: "Alfaiataria",
 collectionName: "Noir Signature",
 isActive: true,
 isFeatured: true,
 isAvailable: true,
 totalStock: 10,
 totalReserved: 0,
 totalAvailable: 10,
 lowStockCount: 0,
 variantsCount: 1
 }
 ],
 orders: [
 {
 publicId: "00000000-0000-4000-8000-000000000032",
 orderNumber: "LOJ-000032",
 status: "em_separacao",
 statusLabel: "Em separação",
 clientName: "Cliente demonstração",
 paymentStatus: "approved",
 totalAmount: 459,
 shippingCarrier: null,
 trackingCode: null,
 createdAt
 }
 ],
 selectedProduct: null,
 selectedOrder: null
 };
}

function matchesProductFilter(
 filters: SalesStockPanelFilters,
 product: SalesStockProductListItem,
 searchIndex: string
): boolean {
 if (filters.productStatus === "ativos" && !product.isActive) {
 return false;
 }

 if (filters.productStatus === "inativos" && product.isActive) {
 return false;
 }

 if (filters.productStatus === "baixo_estoque" && product.lowStockCount === 0) {
 return false;
 }

 if (filters.productStatus === "indisponiveis" && product.totalAvailable > 0) {
 return false;
 }

 if (!filters.productQuery) {
 return true;
 }

 return searchIndex.includes(filters.productQuery.toLowerCase());
}

function matchesOrderFilter(filters: SalesStockPanelFilters, orderSearchIndex: string, status: string): boolean {
 if (filters.orderStatus !== "todos" && filters.orderStatus !== status) {
 return false;
 }

 if (!filters.orderQuery) {
 return true;
 }

 return orderSearchIndex.includes(filters.orderQuery.toLowerCase());
}

function isToday(dateIso: string): boolean {
 const target = new Date(dateIso);
 const now = new Date();

 return (
 target.getFullYear() === now.getFullYear() &&
 target.getMonth() === now.getMonth() &&
 target.getDate() === now.getDate()
 );
}

export async function getSalesStockPanelData(
 filters: SalesStockPanelFilters
): Promise<SalesStockPanelData> {
 if (!isSupabaseConfigured) {
 return buildMockData();
 }

 try {
 const supabase = await createSupabaseServerClient();

 const [productsResponse, categoriesResponse, collectionsResponse, variantsResponse, imagesResponse, storeOrdersResponse] =
 await Promise.all([
 supabase
 .from("store_products")
 .select(
 "id,slug,name,short_description,description,category_id,collection_id,is_active,is_featured,low_stock_threshold"
 )
 .order("created_at", { ascending: false })
 .returns<ProductRow[]>(),
 supabase.from("store_categories").select("id,name").returns<CategoryRow[]>(),
 supabase.from("store_collections").select("id,name").returns<CollectionRow[]>(),
 supabase
 .from("store_product_variants")
 .select(
 "id,product_id,sku,size_label,color_label,stock_quantity,reserved_quantity,available_quantity,is_active"
 )
 .returns<VariantRow[]>(),
 supabase
 .from("store_product_images")
 .select("id,product_id,image_url,alt_text,display_order")
 .order("display_order", { ascending: true })
 .returns<ImageRow[]>(),
 supabase
 .from("store_orders")
 .select("id,public_id,order_number,user_id,status,payment_status,total_amount,shipping_carrier,tracking_code,created_at")
 .order("created_at", { ascending: false })
 .returns<StoreOrderRow[]>()
 ]);

 const products = productsResponse.data ?? [];
 const categories = new Map((categoriesResponse.data ?? []).map((item) => [item.id, item.name]));
 const collections = new Map((collectionsResponse.data ?? []).map((item) => [item.id, item.name]));
 const variants = variantsResponse.data ?? [];
 const images = imagesResponse.data ?? [];
 const storeOrders = storeOrdersResponse.data ?? [];

 const variantsByProductId = new Map<string, VariantRow[]>();
 for (const variant of variants) {
 const current = variantsByProductId.get(variant.product_id) ?? [];
 variantsByProductId.set(variant.product_id, [...current, variant]);
 }

 const imagesByProductId = new Map<string, ImageRow[]>();
 for (const image of images) {
 const current = imagesByProductId.get(image.product_id) ?? [];
 imagesByProductId.set(image.product_id, [...current, image]);
 }

 const productList = products
 .map((product) => {
 const productVariants = variantsByProductId.get(product.id) ?? [];
 const totalStock = productVariants.reduce(
 (accumulator, item) => accumulator + Number(item.stock_quantity),
 0
 );
 const totalReserved = productVariants.reduce(
 (accumulator, item) => accumulator + Number(item.reserved_quantity),
 0
 );
 const totalAvailable = productVariants.reduce(
 (accumulator, item) => accumulator + Number(item.available_quantity),
 0
 );

 const lowStockCount = productVariants.filter(
 (variant) => Number(variant.available_quantity) <= product.low_stock_threshold
 ).length;

 const categoryName = product.category_id ? categories.get(product.category_id) ?? null : null;
 const collectionName = product.collection_id
 ? collections.get(product.collection_id) ?? null
 : null;

 const row: SalesStockProductListItem = {
 id: product.id,
 slug: product.slug,
 name: product.name,
 categoryName,
 collectionName,
 isActive: product.is_active,
 isFeatured: product.is_featured,
 isAvailable: totalAvailable > 0,
 totalStock,
 totalReserved,
 totalAvailable,
 lowStockCount,
 variantsCount: productVariants.length
 };

 const searchIndex = [
 row.name,
 row.slug,
 row.categoryName ?? "",
 row.collectionName ?? "",
 ...productVariants.map((item) => item.sku)
 ]
 .join(" ")
 .toLowerCase();

 return { row, searchIndex };
 })
 .filter((item) => matchesProductFilter(filters, item.row, item.searchIndex))
 .map((item) => item.row);

 const orderUserIds = Array.from(new Set(storeOrders.map((order) => order.user_id)));
 const profilesResponse = orderUserIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name")
 .in("id", orderUserIds)
 .returns<ProfileRow[]>()
 : { data: [] as ProfileRow[] };

 const profilesById = new Map((profilesResponse.data ?? []).map((item) => [item.id, item.full_name]));

 const orderList = storeOrders
 .map((order) => {
 const row = {
 publicId: order.public_id,
 orderNumber: order.order_number,
 status: order.status,
 statusLabel: storeOrderStatusLabels[order.status] ?? order.status,
 clientName: profilesById.get(order.user_id) ?? "Cliente sem nome",
 paymentStatus: order.payment_status,
 totalAmount: Number(order.total_amount),
 shippingCarrier: order.shipping_carrier,
 trackingCode: order.tracking_code,
 createdAt: order.created_at
 };

 const searchIndex = [
 row.orderNumber,
 row.clientName,
 row.trackingCode ?? "",
 row.statusLabel
 ]
 .join(" ")
 .toLowerCase();

 return { row, searchIndex };
 })
 .filter((item) => matchesOrderFilter(filters, item.searchIndex, item.row.status))
 .map((item) => item.row);

 const metrics = {
 produtosAtivos: products.filter((item) => item.is_active).length,
 estoqueBaixo: products.reduce((accumulator, product) => {
 const productVariants = variantsByProductId.get(product.id) ?? [];
 return (
 accumulator +
 productVariants.filter((variant) => Number(variant.available_quantity) <= product.low_stock_threshold)
 .length
 );
 }, 0),
 indisponiveis: products.filter((product) => {
 const productVariants = variantsByProductId.get(product.id) ?? [];
 return productVariants.reduce((accumulator, item) => accumulator + Number(item.available_quantity), 0) === 0;
 }).length,
 pedidosEmSeparacao: storeOrders.filter((item) => item.status === "em_separacao").length,
 prontosParaEnvio: storeOrders.filter((item) => item.status === "pronto_para_envio").length,
 enviadosHoje: storeOrders.filter((item) => item.status === "enviado" && isToday(item.created_at)).length
 };

 let selectedProduct: SalesStockPanelData["selectedProduct"] = null;
 if (filters.selectedProduct) {
 const product = products.find((item) => item.id === filters.selectedProduct);
 if (product) {
 const productVariants = variantsByProductId.get(product.id) ?? [];
 const variantSummaries: SalesStockVariantSummary[] = productVariants.map((variant) => ({
 id: variant.id,
 sku: variant.sku,
 sizeLabel: variant.size_label,
 colorLabel: variant.color_label,
 stockQuantity: Number(variant.stock_quantity),
 reservedQuantity: Number(variant.reserved_quantity),
 availableQuantity: Number(variant.available_quantity),
 isActive: variant.is_active
 }));

 const totalStock = variantSummaries.reduce((accumulator, item) => accumulator + item.stockQuantity, 0);
 const totalReserved = variantSummaries.reduce(
 (accumulator, item) => accumulator + item.reservedQuantity,
 0
 );
 const totalAvailable = variantSummaries.reduce(
 (accumulator, item) => accumulator + item.availableQuantity,
 0
 );

 selectedProduct = {
 id: product.id,
 slug: product.slug,
 name: product.name,
 categoryId: product.category_id,
 collectionId: product.collection_id,
 categoryName: product.category_id ? categories.get(product.category_id) ?? null : null,
 collectionName: product.collection_id ? collections.get(product.collection_id) ?? null : null,
 isActive: product.is_active,
 isFeatured: product.is_featured,
 isAvailable: totalAvailable > 0,
 totalStock,
 totalReserved,
 totalAvailable,
 lowStockCount: variantSummaries.filter(
 (item) => item.availableQuantity <= product.low_stock_threshold
 ).length,
 variantsCount: variantSummaries.length,
 shortDescription: product.short_description,
 description: product.description,
 images: (imagesByProductId.get(product.id) ?? []).map((image) => ({
 id: image.id,
 imageUrl: image.image_url,
 altText: image.alt_text,
 displayOrder: image.display_order
 })),
 variants: variantSummaries
 };
 }
 }

 const selectedOrder = filters.selectedOrder
 ? orderList.find((item) => item.publicId === filters.selectedOrder) ?? null
 : null;

 return {
 metrics,
 products: productList,
 orders: orderList,
 selectedProduct,
 selectedOrder
 };
 } catch {
 return buildMockData();
 }
}

export function getSalesOrderStatusLabel(value: string): string {
 return storeOrderStatusLabels[value] ?? value;
}

export function getSalesPaymentStatusLabel(value: string): string {
 return paymentStatusLabels[value] ?? value;
}


