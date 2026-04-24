import type { Address, CartItem } from "@/types/commerce";

export interface ShippingQuote {
 method: string;
 carrier: string;
 amountInCents: number;
 etaInDays: number;
}

export interface CreateShipmentInput {
 orderReference: string;
 recipientName: string;
 destination: Address;
 items: CartItem[];
 preferredCarrier?: string | null;
}

export interface ShipmentResult {
 provider: string;
 carrier: string;
 trackingCode: string;
 trackingUrl: string;
 labelUrl: string | null;
 status: "created" | "failed";
}

export interface ShippingAdapter {
 quote(address: Address, items: CartItem[]): Promise<ShippingQuote>;
 createShipment(input: CreateShipmentInput): Promise<ShipmentResult>;
}
