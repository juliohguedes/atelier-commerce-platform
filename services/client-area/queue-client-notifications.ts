import {
  createSupabaseAdminClient,
  hasSupabaseAdminAccess
} from "@/lib/supabase/admin";

export type ClientNotificationChannel = "in_app" | "email" | "whatsapp";

interface QueueClientNotificationsInput {
 userId: string;
 title: string;
 body: string;
 channels?: ClientNotificationChannel[];
 payload?: Record<string, unknown>;
}

const defaultChannels: ClientNotificationChannel[] = ["in_app", "email", "whatsapp"];

export async function queueClientNotifications(
 input: QueueClientNotificationsInput
): Promise<void> {
 if (!hasSupabaseAdminAccess) {
 return;
 }

 const admin = createSupabaseAdminClient();

 const rows = (input.channels ?? defaultChannels).map((channel) => ({
 recipient_user_id: input.userId,
 recipient_role: "client",
 is_global: false,
 channel,
 title: input.title,
 body: input.body,
 payload: input.payload ?? {},
 status: "pending"
 }));

 const { error } = await admin.from("internal_notifications").insert(rows);

 if (error) {
 throw new Error("Falha ao preparar notificações da cliente.");
 }
}
