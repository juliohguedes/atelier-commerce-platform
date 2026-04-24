"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderAttachmentRegistrationSchema,
 type CustomOrderAttachmentRegistrationInput
} from "@/lib/validations/custom-order";
import { getUserRole } from "@/services/auth/get-user-role";

interface RegisterCustomOrderAttachmentsResult {
 success: boolean;
 message: string;
 uploadedCount?: number;
}

interface OrderRecordForAttachment {
 id: number;
 user_id: string | null;
 contact_email: string | null;
}

export async function registerCustomOrderAttachmentsAction(
 input: CustomOrderAttachmentRegistrationInput
): Promise<RegisterCustomOrderAttachmentsResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Supabase não configurado para registrar anexos."
 };
 }

 try {
 const payload = customOrderAttachmentRegistrationSchema.parse(input);

 if (payload.attachments.length === 0) {
 return {
 success: true,
 message: "Nenhum anexo novo para registrar.",
 uploadedCount: 0
 };
 }

 const admin = createSupabaseAdminClient();

 let authenticatedUserId: string | null = null;
 let isInternalUser = false;

 try {
 const sessionClient = await createSupabaseServerClient();
 const {
 data: { user }
 } = await sessionClient.auth.getUser();

 if (user) {
 authenticatedUserId = user.id;
 const role = await getUserRole(user.id);
 isInternalUser = ["admin", "finance", "sales_stock"].includes(role);
 }
 } catch {
 authenticatedUserId = null;
 isInternalUser = false;
 }

 const { data: order, error: orderError } = await admin
 .from("custom_orders")
 .select("id,user_id,contact_email")
 .eq("public_id", payload.orderPublicId)
 .maybeSingle<OrderRecordForAttachment>();

 if (orderError || !order) {
 return {
 success: false,
 message: "Pedido não localizado para vinculacao de anexos."
 };
 }

 const isOwner = Boolean(authenticatedUserId && order.user_id === authenticatedUserId);
 const normalizedOrderEmail = order.contact_email?.toLowerCase() ?? null;
 const normalizedPayloadEmail = payload.contactEmail?.toLowerCase() ?? null;
 const isGuestOwner =
 !order.user_id &&
 ((normalizedOrderEmail && normalizedPayloadEmail === normalizedOrderEmail) ||
 (!normalizedOrderEmail && !authenticatedUserId));

 if (!isOwner && !isGuestOwner && !isInternalUser) {
 return {
 success: false,
 message: "Sem permissão para anexar arquivos neste pedido."
 };
 }

 const rows = payload.attachments.map((attachment) => ({
 order_id: order.id,
 storage_bucket: "custom-orders",
 storage_path: attachment.storagePath,
 original_file_name: attachment.originalFileName,
 mime_type: attachment.mimeType,
 file_size_bytes: attachment.fileSizeBytes
 }));

 const { error: insertError } = await admin
 .from("custom_order_attachments")
 .upsert(rows, {
 onConflict: "storage_path",
 ignoreDuplicates: true
 });

 if (insertError) {
 return {
 success: false,
 message: "Falha ao registrar anexos no pedido."
 };
 }

 revalidatePath(ROUTES.public.tailored);

 return {
 success: true,
 message: "Anexos vinculados ao pedido com sucesso.",
 uploadedCount: rows.length
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao registrar anexos."
 };
 }
}
