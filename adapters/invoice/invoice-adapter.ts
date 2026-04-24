export interface InvoiceIssueItem {
 description: string;
 quantity: number;
 unitAmount: number;
}

export interface IssueInvoiceInput {
 orderReference: string;
 customerName: string;
 customerDocument?: string | null;
 totalAmount: number;
 items: InvoiceIssueItem[];
 metadata?: Record<string, unknown>;
}

export interface IssuedInvoiceResult {
 provider: string;
 status: "draft" | "issued" | "failed";
 invoiceNumber: string;
 invoiceUrl: string | null;
 payload: Record<string, unknown>;
}

export interface InvoiceAdapter {
 issueInvoice(input: IssueInvoiceInput): Promise<IssuedInvoiceResult>;
}
