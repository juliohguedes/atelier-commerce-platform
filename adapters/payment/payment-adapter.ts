export interface CreatePaymentIntentInput {
 amountInCents: number;
 method: "pix" | "cartao";
 customerEmail: string;
 customerName?: string;
 metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
 reference: string;
 provider: string;
 status: "created" | "pending" | "failed";
 paymentUrl: string | null;
 pixCopyPasteCode: string | null;
}

export interface PaymentAdapter {
 createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
}
