import type {
 InvoiceAdapter,
 IssueInvoiceInput,
 IssuedInvoiceResult
} from "@/adapters/invoice/invoice-adapter";
import { maskDocument } from "@/lib/utils";

export class MockInvoiceAdapter implements InvoiceAdapter {
 async issueInvoice(input: IssueInvoiceInput): Promise<IssuedInvoiceResult> {
 const invoiceNumber = `NF-MOCK-${Date.now()}`;

 console.info("[MOCK_INVOICE]", {
 invoiceNumber,
 orderReference: input.orderReference,
 customerName: input.customerName,
 customerDocument: input.customerDocument ? maskDocument(input.customerDocument) : null
 });

 return {
 provider: "mock_invoice",
 status: "draft",
 invoiceNumber,
 invoiceUrl: `https://mock.invoice.local/${invoiceNumber}`,
 payload: {
 order_reference: input.orderReference,
 item_count: input.items.length,
 total_amount: input.totalAmount,
 metadata: input.metadata ?? {}
 }
 };
 }
}
