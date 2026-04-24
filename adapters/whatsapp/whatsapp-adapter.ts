export interface SendWhatsAppMessageInput {
 to: string;
 message: string;
 template?: string;
 metadata?: Record<string, unknown>;
}

export interface WhatsAppDispatchResult {
 provider: string;
 reference: string;
 status: "queued" | "sent" | "failed";
}

export interface WhatsAppAdapter {
 sendMessage(input: SendWhatsAppMessageInput): Promise<WhatsAppDispatchResult>;
}
