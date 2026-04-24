import {
 customOrderBasePriceByPiece,
 customOrderComplexityOptions,
 customOrderFabricOptions,
 customOrderFabricTierAdjustments,
 customOrderNotionOptions
} from "@/lib/constants/custom-order";
import type {
 CustomOrderComplexity,
 CustomOrderEstimateBreakdown,
 CustomOrderFabricTier,
 CustomOrderNotion,
 CustomOrderPieceType
} from "@/types/custom-order";

interface CalculatePreEstimateInput {
 pieceType: CustomOrderPieceType;
 complexity: CustomOrderComplexity;
 fabricTier: CustomOrderFabricTier;
 selectedNotions: CustomOrderNotion[];
}

function roundToTwoDecimals(value: number): number {
 return Math.round(value * 100) / 100;
}

export function findFabricTierByType(fabricType: string): CustomOrderFabricTier {
 const selectedFabric = customOrderFabricOptions.find((fabric) => fabric.value === fabricType);
 return (selectedFabric?.tier ?? "simples") as CustomOrderFabricTier;
}

export function calculatePreEstimate(
 input: CalculatePreEstimateInput
): CustomOrderEstimateBreakdown {
 const defaultBasePrice = customOrderBasePriceByPiece.outros ?? 199;
 const basePrice = customOrderBasePriceByPiece[input.pieceType] ?? defaultBasePrice;
 const complexityPercentage =
 customOrderComplexityOptions.find((option) => option.value === input.complexity)?.percentage ?? 0;
 const fabricTierPercentage =
 customOrderFabricTierAdjustments.find((option) => option.value === input.fabricTier)?.percentage ?? 0;

 const notionsTotal = input.selectedNotions.reduce((total, notionValue) => {
 const notionCost = customOrderNotionOptions.find((option) => option.value === notionValue)?.extraCost ?? 0;
 return total + notionCost;
 }, 0);

 const complexityAmount = basePrice * complexityPercentage;
 const fabricTierAmount = basePrice * fabricTierPercentage;
 const estimatedTotal = basePrice + complexityAmount + fabricTierAmount + notionsTotal;

 return {
 basePrice: roundToTwoDecimals(basePrice),
 complexityPercentage,
 complexityAmount: roundToTwoDecimals(complexityAmount),
 fabricTierPercentage,
 fabricTierAmount: roundToTwoDecimals(fabricTierAmount),
 notionsTotal: roundToTwoDecimals(notionsTotal),
 estimatedTotal: roundToTwoDecimals(estimatedTotal)
 };
}
