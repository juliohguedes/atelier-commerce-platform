import type {
 customOrderAudienceOptions,
 customOrderComplexityOptions,
 customOrderFabricOptions,
 customOrderFabricTierAdjustments,
 customOrderInitialStatusFlow,
 customOrderModelingOptions,
 customOrderNotionOptions,
 customOrderPieceOptions,
 customOrderProductionModeOptions,
 customOrderRequestTypeOptions,
 customOrderSizeOptions
} from "@/lib/constants/custom-order";

export type CustomOrderAudience = (typeof customOrderAudienceOptions)[number]["value"];
export type CustomOrderProductionMode = (typeof customOrderProductionModeOptions)[number]["value"];
export type CustomOrderSizeStandard = (typeof customOrderSizeOptions)[number];
export type CustomOrderModeling = (typeof customOrderModelingOptions)[number]["value"];
export type CustomOrderPieceType = (typeof customOrderPieceOptions)[number]["value"];
export type CustomOrderRequestType = (typeof customOrderRequestTypeOptions)[number]["value"];
export type CustomOrderFabricType = (typeof customOrderFabricOptions)[number]["value"];
export type CustomOrderFabricTier = (typeof customOrderFabricTierAdjustments)[number]["value"];
export type CustomOrderComplexity = (typeof customOrderComplexityOptions)[number]["value"];
export type CustomOrderNotion = (typeof customOrderNotionOptions)[number]["value"];

export type CustomOrderStatus = (typeof customOrderInitialStatusFlow)[number] | "draft" | "cancelado_pela_cliente" | "cancelado_interno";

export interface CustomOrderMeasurements {
 pescoco?: number;
 braco?: number;
 ombro?: number;
 busto?: number;
 cintura?: number;
 quadril?: number;
 coxa?: number;
 comprimento_manga?: number;
 comprimento_pernas?: number;
}

export interface CustomOrderEstimateBreakdown {
 basePrice: number;
 complexityPercentage: number;
 complexityAmount: number;
 fabricTierPercentage: number;
 fabricTierAmount: number;
 notionsTotal: number;
 estimatedTotal: number;
}

export interface CustomOrderSummary {
 protocolCode: string;
 status: CustomOrderStatus;
 statusLabel: string;
 estimatedTotal: number;
 pieceTypeLabel: string;
 productionModeLabel: string;
 audienceLabel: string;
}
