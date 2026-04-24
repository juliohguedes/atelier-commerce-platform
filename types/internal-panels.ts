import type {
 ClientDeliveryMode,
 ClientPaymentMethod,
 ClientPaymentStatus,
 ClientStoreOrderStatus
} from "@/types/client-area";
import type { UserRole } from "@/types/auth";
import type {
 CustomOrderEstimateBreakdown,
 CustomOrderMeasurements,
 CustomOrderModeling,
 CustomOrderPieceType,
 CustomOrderProductionMode,
 CustomOrderRequestType,
 CustomOrderStatus
} from "@/types/custom-order";

type AdminDashboardBlock =
 (typeof import("@/lib/constants/internal-panels").adminDashboardBlocks)[number];
type FinanceDashboardBlock =
 (typeof import("@/lib/constants/internal-panels").financeDashboardBlocks)[number];
type SalesStockDashboardBlock =
 (typeof import("@/lib/constants/internal-panels").salesStockDashboardBlocks)[number];

export type AdminDashboardBlockId = AdminDashboardBlock["id"];
export type FinanceDashboardBlockId = FinanceDashboardBlock["id"];
export type SalesStockDashboardBlockId = SalesStockDashboardBlock["id"];
export type FinanceFinancialStatus =
 keyof typeof import("@/lib/constants/internal-panels").financialStatusLabels;

export interface AdminOrderEstimateBreakdown
 extends Partial<CustomOrderEstimateBreakdown> {
 disclaimer?: string;
}

export interface AdminDashboardMetrics {
 novos: number;
 emAnalise: number;
 aguardandoPagamento: number;
 emProducao: number;
 prontoParaEnvio: number;
 enviados: number;
 entregues: number;
 vendasMes: number;
}

export interface AdminOrderListItem {
 id: number;
 publicId: string;
 protocolCode: string;
 status: CustomOrderStatus;
 statusLabel: string;
 pieceType: CustomOrderPieceType;
 pieceTypeLabel: string;
 clientName: string;
 clientEmail: string | null;
 clientWhatsapp: string | null;
 createdAt: string;
 estimatedPrice: number;
 finalAmount: number | null;
 paymentStatus: ClientPaymentStatus | null;
}

export interface AdminOrderStatusHistoryItem {
 id: number;
 status: CustomOrderStatus;
 statusLabel: string;
 note: string | null;
 changedAt: string;
 changedByName: string | null;
 changedByRole: UserRole | null;
}

export interface AdminOrderDetail extends AdminOrderListItem {
 productionMode: CustomOrderProductionMode;
 requestType: CustomOrderRequestType;
 modeling: CustomOrderModeling | null;
 pieceLength: string | null;
 measurements: CustomOrderMeasurements;
 referenceNotes: string | null;
 visualNotes: string | null;
 finalNotes: string | null;
 estimateBreakdown: AdminOrderEstimateBreakdown;
 quoteSummary: string | null;
 deliveryMode: ClientDeliveryMode | null;
 trackingCode: string | null;
 trackingLink: string | null;
 history: AdminOrderStatusHistoryItem[];
}

export interface AdminPanelData {
 metrics: AdminDashboardMetrics;
 orders: AdminOrderListItem[];
 selectedOrder: AdminOrderDetail | null;
}

export type InternalSectorRole = Extract<UserRole, "admin" | "finance" | "sales_stock">;

export interface AdminBrandSettingsSnapshot {
 brandName: string;
 supportWhatsapp: string | null;
 supportEmail: string | null;
 addressText: string | null;
 businessHours: string | null;
 instagramUrl: string | null;
 facebookUrl: string | null;
 tiktokUrl: string | null;
 cnpj: string | null;
 maintenanceBanner: string | null;
 technicalDraftPayload: Record<string, unknown> | null;
 technicalPublishedPayload: Record<string, unknown> | null;
}

export interface AdminInternalAccessItem {
 id: number;
 userId: string;
 fullName: string;
 email: string | null;
 role: InternalSectorRole;
 isPrimary: boolean;
 isActive: boolean;
 createdAt: string;
}

export interface AdminCalendarEventItem {
 id: string;
 title: string;
 description: string | null;
 startsAt: string;
 endsAt: string | null;
 responsibleRole: UserRole | null;
 isAllDay: boolean;
 createdByName: string | null;
}

export interface AdminMaintenanceModeState {
 enabled: boolean;
 message: string;
 allowRoles: UserRole[];
 startsAt: string | null;
 endsAt: string | null;
 updatedAt: string | null;
}

export interface AdminRecentAuditItem {
 id: number;
 actorName: string | null;
 actorRole: UserRole | null;
 eventName: string;
 entityTable: string;
 entityId: string | null;
 summary: string;
 createdAt: string;
}

export interface AdminOperationsSummary {
 activeInternalUsers: number;
 pendingNotifications: number;
 upcomingCalendarEvents: number;
 recentCriticalChanges: number;
}

export interface AdminControlCenterData {
 brandSettings: AdminBrandSettingsSnapshot;
 internalAccesses: AdminInternalAccessItem[];
 calendarEvents: AdminCalendarEventItem[];
 maintenanceMode: AdminMaintenanceModeState;
 recentAudit: AdminRecentAuditItem[];
 summary: AdminOperationsSummary;
 technicalDraftOwnerName: string | null;
 isCurrentUserDraftOwner: boolean;
}

export interface FinanceDashboardMetrics {
 aguardandoOrcamento: number;
 aguardandoPagamento: number;
 pagamentosAprovados: number;
 fretePendente: number;
 notaFiscalPendente: number;
 notasEmitidas: number;
}

export type FinanceOrderType = "custom_order" | "store_order";

export interface FinanceOrderListItem {
 type: FinanceOrderType;
 publicId: string;
 protocol: string;
 clientName: string;
 clientEmail: string | null;
 paymentStatus: ClientPaymentStatus;
 financialStatus: FinanceFinancialStatus;
 totalAmount: number;
 shippingCost: number;
 invoiceNumber: string | null;
 createdAt: string;
}

export interface FinanceOrderDetail extends FinanceOrderListItem {
 customOrderStatus: CustomOrderStatus | null;
 storeOrderStatus: ClientStoreOrderStatus | null;
 quoteSummary: string | null;
 paymentMethod: ClientPaymentMethod | null;
 paymentReference: string | null;
 shippingCarrier: string | null;
 trackingCode: string | null;
 trackingLink: string | null;
 invoiceUrl: string | null;
}

export interface FinancePanelData {
 metrics: FinanceDashboardMetrics;
 orders: FinanceOrderListItem[];
 selectedOrder: FinanceOrderDetail | null;
}

export interface SalesStockDashboardMetrics {
 produtosAtivos: number;
 estoqueBaixo: number;
 indisponiveis: number;
 pedidosEmSeparacao: number;
 prontosParaEnvio: number;
 enviadosHoje: number;
}

export interface SalesStockProductListItem {
 id: string;
 slug: string;
 name: string;
 categoryName: string | null;
 collectionName: string | null;
 isActive: boolean;
 isFeatured: boolean;
 isAvailable: boolean;
 totalStock: number;
 totalReserved: number;
 totalAvailable: number;
 lowStockCount: number;
 variantsCount: number;
}

export interface SalesStockVariantSummary {
 id: string;
 sku: string;
 sizeLabel: string;
 colorLabel: string;
 stockQuantity: number;
 reservedQuantity: number;
 availableQuantity: number;
 isActive: boolean;
}

export interface SalesStockProductDetail extends SalesStockProductListItem {
 categoryId: string | null;
 collectionId: string | null;
 shortDescription: string | null;
 description: string | null;
 images: Array<{
 id: string;
 imageUrl: string;
 altText: string | null;
 displayOrder: number;
 }>;
 variants: SalesStockVariantSummary[];
}

export interface SalesStockOrderListItem {
 publicId: string;
 orderNumber: string;
 status: ClientStoreOrderStatus;
 statusLabel: string;
 clientName: string;
 paymentStatus: ClientPaymentStatus;
 totalAmount: number;
 shippingCarrier: string | null;
 trackingCode: string | null;
 createdAt: string;
}

export interface SalesStockPanelData {
 metrics: SalesStockDashboardMetrics;
 products: SalesStockProductListItem[];
 orders: SalesStockOrderListItem[];
 selectedProduct: SalesStockProductDetail | null;
 selectedOrder: SalesStockOrderListItem | null;
}
