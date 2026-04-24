import type { ShippingAdapter, ShippingQuote } from "@/adapters/shipping/shipping-adapter";
import type { Address, CartItem } from "@/types/commerce";

export class MockShippingAdapter implements ShippingAdapter {
 async quote(address: Address, items: CartItem[]): Promise<ShippingQuote> {
 const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
 const base = 1990;
 const perItem = 350 * totalUnits;

 return {
 carrier: address.state.toUpperCase() === "SP" ? "Correios Expresso Mock" : "Transportadora Mock",
 method: address.state.toUpperCase() === "SP" ? "Expresso" : "Padrao",
 amountInCents: base + perItem,
 etaInDays: address.state.toUpperCase() === "SP" ? 2 : 6
 };
 }

 async createShipment(input: {
 orderReference: string;
 recipientName: string;
 destination: Address;
 items: CartItem[];
 preferredCarrier?: string | null;
 }) {
 const carrier =
 input.preferredCarrier ?? (input.destination.state.toUpperCase() === "SP"
 ? "Correios Expresso Mock"
 : "Transportadora Mock");
 const trackingCode = `TRK${Date.now()}`;

 return {
 provider: "mock_shipping",
 carrier,
 trackingCode,
 trackingUrl: `https://mock.shipping.local/rastreio/${trackingCode}`,
 labelUrl: `https://mock.shipping.local/etiqueta/${input.orderReference}`,
 status: "created" as const
 };
 }
}
