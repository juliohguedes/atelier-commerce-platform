"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 adminCalendarEventSchema,
 type AdminCalendarEventInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";

interface UpsertInternalCalendarEventResult {
 success: boolean;
 message: string;
}

export async function upsertInternalCalendarEventAction(
 input: AdminCalendarEventInput
): Promise<UpsertInternalCalendarEventResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = adminCalendarEventSchema.parse(input);
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return {
 success: false,
 message: "Autenticação obrigatória."
 };
 }

 const role = await getUserRole(user.id);
 if (role !== "admin") {
 return {
 success: false,
 message: "Somente admin pode criar eventos do calendário interno."
 };
 }

 const { error } = await supabase.from("internal_calendar_events").insert({
 title: payload.title,
 description: payload.description ?? null,
 starts_at: new Date(payload.startsAt).toISOString(),
 ends_at: payload.endsAt ? new Date(payload.endsAt).toISOString() : null,
 responsible_role: payload.responsibleRole ?? null,
 is_all_day: payload.isAllDay,
 created_by: user.id
 });

 if (error) {
 return {
 success: false,
 message: "Não foi possível salvar o evento interno."
 };
 }

 await supabase.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "admin.create_internal_calendar_event",
 entity_table: "internal_calendar_events",
 entity_id: payload.title,
 metadata: {
 event_title: payload.title,
 starts_at: payload.startsAt,
 ends_at: payload.endsAt ?? null,
 responsible_role: payload.responsibleRole ?? null,
 is_all_day: payload.isAllDay
 }
 });

 revalidatePath(ROUTES.private.admin);

 return {
 success: true,
 message: "Evento interno cadastrado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao salvar o evento interno."
 };
 }
}
