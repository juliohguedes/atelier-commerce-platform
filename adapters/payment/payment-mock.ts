import {
 type CreatePaymentIntentInput,
 type PaymentAdapter,
 type PaymentIntentResult
} from "@/adapters/payment/payment-adapter";

export class MockPaymentAdapter implements PaymentAdapter {
 async createPaymentIntent(
 input: CreatePaymentIntentInput
 ): Promise<PaymentIntentResult> {
 const reference = `MOCK_PAY_${Date.now()}`;
 const isValidAmount = input.amountInCents > 0;

 return {
 reference,
 provider: "mock_gateway",
 status: isValidAmount ? "created" : "failed",
 paymentUrl:
 input.method === "cartao" && isValidAmount
 ? `https://mock.pay.local/checkout/${reference}`
 : null,
 pixCopyPasteCode:
 input.method === "pix" && isValidAmount
 ? `00020101021226860014br.gov.bcb.pix2564mock/${reference}5204000053039865802BR5925MAISON AUREA6009SAO PAULO62070503***6304ABCD`
 : null
 };
 }
}
