export interface SendEmailInput {
 to: string;
 subject: string;
 html: string;
 text: string;
 metadata?: Record<string, unknown>;
}

export interface EmailDispatchResult {
 provider: string;
 reference: string;
 status: "queued" | "sent" | "failed";
}

export interface EmailAdapter {
 sendTransactionalEmail(input: SendEmailInput): Promise<EmailDispatchResult>;
}
