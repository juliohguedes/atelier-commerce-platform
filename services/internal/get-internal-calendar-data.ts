import { internalCalendarTypeLabels, managementSectorLabels } from "@/lib/constants/management";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InternalCalendarData, InternalCalendarEntry } from "@/types/management";

interface InternalCalendarEventRow {
 id: string;
 title: string;
 description: string | null;
 starts_at: string;
 responsible_role: "admin" | "finance" | "sales_stock" | "client" | null;
}

interface AppointmentRow {
 id: string;
 order_id: number | null;
 user_id: string;
 appointment_type: "tirar_medidas" | "alinhamento_pedido" | "retirada";
 attendance_mode: "online" | "presencial";
 scheduled_for: string;
 status: "solicitado" | "confirmado" | "concluido" | "cancelado";
 notes: string | null;
}

interface CustomOrderRow {
 id: number;
 protocol_code: string;
 contact_full_name: string | null;
 user_id: string | null;
 desired_deadline: string | null;
}

interface CustomQuoteRow {
 order_id: number;
 production_started_at: string | null;
 ready_to_ship_at: string | null;
 delivered_at: string | null;
}

interface CustomFulfillmentRow {
 order_id: number;
 delivery_mode: "entrega" | "retirada" | null;
 pickup_address: string | null;
 pickup_instructions: string | null;
}

interface ProfileRow {
 id: string;
 full_name: string | null;
}

function resolveSectorLabel(
 role: InternalCalendarEventRow["responsible_role"]
): string {
 if (role === "admin" || role === "finance" || role === "sales_stock") {
 return managementSectorLabels[role];
 }

 return managementSectorLabels.todos;
}

function byScheduledAt(left: InternalCalendarEntry, right: InternalCalendarEntry): number {
 if (left.scheduledAt === right.scheduledAt) {
 return left.title.localeCompare(right.title, "pt-BR");
 }

 return left.scheduledAt.localeCompare(right.scheduledAt);
}

function buildMockCalendar(): InternalCalendarData {
 const now = new Date();
 const inTwoDays = new Date(now);
 inTwoDays.setDate(now.getDate() + 2);
 const inFourDays = new Date(now);
 inFourDays.setDate(now.getDate() + 4);

 const entries: InternalCalendarEntry[] = [
 {
 id: "calendar-mock-1",
 type: "agendamento_presencial",
 title: "Prova presencial de vestido",
 description: "Atendimento no showroom para ajustar modelagem final.",
 scheduledAt: inTwoDays.toISOString(),
 sectorLabel: managementSectorLabels.admin,
 orderReference: "PED-000411",
 clientName: "Mariana F.",
 locationLabel: "Showroom principal",
 statusLabel: "Confirmado"
 },
 {
 id: "calendar-mock-2",
 type: "pedido_em_producao",
 title: "Pedido em produção",
 description: "Vestido sob medida entrou na etapa de confeccao.",
 scheduledAt: now.toISOString(),
 sectorLabel: managementSectorLabels.admin,
 orderReference: "PED-000411",
 clientName: "Mariana F.",
 locationLabel: "Atelier interno",
 statusLabel: "Em produção"
 },
 {
 id: "calendar-mock-3",
 type: "entrega_prevista",
 title: "Entrega prevista para custom order",
 description: "Prazo alinhado com a cliente para fechamento do pedido.",
 scheduledAt: inFourDays.toISOString(),
 sectorLabel: managementSectorLabels.sales_stock,
 orderReference: "PED-000411",
 clientName: "Mariana F.",
 locationLabel: "Entrega na cliente",
 statusLabel: "Prazo previsto"
 }
 ];

 const sortedEntries = entries.sort(byScheduledAt);

 return {
 metrics: {
 appointments: sortedEntries.filter((item) => item.type === "agendamento_presencial").length,
 pickups: sortedEntries.filter((item) => item.type === "retirada").length,
 productionOrders: sortedEntries.filter((item) => item.type === "pedido_em_producao").length,
 projectedDeliveries: sortedEntries.filter((item) => item.type === "entrega_prevista").length
 },
 entries: sortedEntries
 };
}

export async function getInternalCalendarData(): Promise<InternalCalendarData> {
 if (!isSupabaseConfigured) {
 return buildMockCalendar();
 }

 try {
 const supabase = await createSupabaseServerClient();
 const [
 internalEventsResponse,
 appointmentsResponse,
 customOrdersResponse,
 quotesResponse,
 fulfillmentsResponse
 ] = await Promise.all([
 supabase
 .from("internal_calendar_events")
 .select("id,title,description,starts_at,responsible_role")
 .order("starts_at", { ascending: true })
 .returns<InternalCalendarEventRow[]>(),
 supabase
 .from("custom_order_appointments")
 .select(
 "id,order_id,user_id,appointment_type,attendance_mode,scheduled_for,status,notes"
 )
 .order("scheduled_for", { ascending: true })
 .returns<AppointmentRow[]>(),
 supabase
 .from("custom_orders")
 .select("id,protocol_code,contact_full_name,user_id,desired_deadline")
 .returns<CustomOrderRow[]>(),
 supabase
 .from("custom_order_final_quotes")
 .select("order_id,production_started_at,ready_to_ship_at,delivered_at")
 .returns<CustomQuoteRow[]>(),
 supabase
 .from("custom_order_fulfillments")
 .select("order_id,delivery_mode,pickup_address,pickup_instructions")
 .returns<CustomFulfillmentRow[]>()
 ]);

 const internalEvents = internalEventsResponse.data ?? [];
 const appointments = appointmentsResponse.data ?? [];
 const customOrders = customOrdersResponse.data ?? [];
 const quotes = quotesResponse.data ?? [];
 const fulfillments = fulfillmentsResponse.data ?? [];

 const profileIds = Array.from(
 new Set(appointments.map((item) => item.user_id).filter(Boolean))
 );

 const profilesResponse = profileIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name")
 .in("id", profileIds)
 .returns<ProfileRow[]>()
 : { data: [] as ProfileRow[] };

 const profilesById = new Map((profilesResponse.data ?? []).map((item) => [item.id, item.full_name]));
 const ordersById = new Map(customOrders.map((item) => [item.id, item]));
 const quotesByOrderId = new Map(quotes.map((item) => [item.order_id, item]));
 const fulfillmentsByOrderId = new Map(fulfillments.map((item) => [item.order_id, item]));

 const entries: InternalCalendarEntry[] = [];

 for (const event of internalEvents) {
 entries.push({
 id: `internal-${event.id}`,
 type: "evento_interno",
 title: event.title,
 description: event.description,
 scheduledAt: event.starts_at,
 sectorLabel: resolveSectorLabel(event.responsible_role),
 orderReference: null,
 clientName: null,
 locationLabel: null,
 statusLabel: internalCalendarTypeLabels.evento_interno
 });
 }

 for (const appointment of appointments) {
 if (appointment.attendance_mode !== "presencial") {
 continue;
 }

 const order = appointment.order_id ? ordersById.get(appointment.order_id) : undefined;
 const clientName =
 order?.contact_full_name ?? profilesById.get(appointment.user_id) ?? "Cliente sem nome";

 entries.push({
 id: `appointment-${appointment.id}`,
 type:
 appointment.appointment_type === "retirada" ? "retirada" : "agendamento_presencial",
 title:
 appointment.appointment_type === "retirada"
 ? "Retirada presencial"
 : "Agendamento presencial",
 description: appointment.notes,
 scheduledAt: appointment.scheduled_for,
 sectorLabel:
 appointment.appointment_type === "retirada"
 ? managementSectorLabels.sales_stock
 : managementSectorLabels.admin,
 orderReference: order?.protocol_code ?? null,
 clientName,
 locationLabel:
 appointment.appointment_type === "retirada"
 ? "Retirada na loja"
 : "Showroom principal",
 statusLabel: appointment.status
 });
 }

 for (const quote of quotes) {
 const order = ordersById.get(quote.order_id);
 if (!order) {
 continue;
 }

 if (quote.production_started_at && !quote.delivered_at) {
 entries.push({
 id: `production-${quote.order_id}`,
 type: "pedido_em_producao",
 title: "Pedido em produção",
 description: `Protocolo ${order.protocol_code} em confeccao interna.`,
 scheduledAt: quote.production_started_at,
 sectorLabel: managementSectorLabels.admin,
 orderReference: order.protocol_code,
 clientName: order.contact_full_name ?? null,
 locationLabel: "Atelier interno",
 statusLabel: "Em produção"
 });
 }

 if (order.desired_deadline && !quote.delivered_at) {
 const fulfillment = fulfillmentsByOrderId.get(quote.order_id);
 entries.push({
 id: `delivery-${quote.order_id}`,
 type: "entrega_prevista",
 title: "Entrega prevista",
 description: fulfillment?.delivery_mode === "retirada"
 ? "Entrega prevista com retirada em loja."
 : "Entrega prevista para envio ou entrega final.",
 scheduledAt: new Date(`${order.desired_deadline}T12:00:00.000Z`).toISOString(),
 sectorLabel:
 fulfillment?.delivery_mode === "retirada"
 ? managementSectorLabels.sales_stock
 : managementSectorLabels.admin,
 orderReference: order.protocol_code,
 clientName: order.contact_full_name ?? null,
 locationLabel:
 fulfillment?.delivery_mode === "retirada"
 ? fulfillment.pickup_address ?? "Retirada na loja"
 : "Entrega na cliente",
 statusLabel: "Prazo previsto"
 });
 }
 }

 for (const fulfillment of fulfillments) {
 const order = ordersById.get(fulfillment.order_id);
 const quote = quotesByOrderId.get(fulfillment.order_id);

 if (
 !order ||
 fulfillment.delivery_mode !== "retirada" ||
 !quote?.ready_to_ship_at ||
 quote.delivered_at
 ) {
 continue;
 }

 entries.push({
 id: `pickup-${fulfillment.order_id}`,
 type: "retirada",
 title: "Pedido pronto para retirada",
 description: fulfillment.pickup_instructions,
 scheduledAt: quote.ready_to_ship_at,
 sectorLabel: managementSectorLabels.sales_stock,
 orderReference: order.protocol_code,
 clientName: order.contact_full_name ?? null,
 locationLabel: fulfillment.pickup_address ?? "Retirada na loja",
 statusLabel: "Pronto para retirada"
 });
 }

 const sortedEntries = entries.sort(byScheduledAt);

 return {
 metrics: {
 appointments: sortedEntries.filter((item) => item.type === "agendamento_presencial")
 .length,
 pickups: sortedEntries.filter((item) => item.type === "retirada").length,
 productionOrders: sortedEntries.filter((item) => item.type === "pedido_em_producao")
 .length,
 projectedDeliveries: sortedEntries.filter((item) => item.type === "entrega_prevista")
 .length
 },
 entries: sortedEntries
 };
 } catch {
 return buildMockCalendar();
 }
}
