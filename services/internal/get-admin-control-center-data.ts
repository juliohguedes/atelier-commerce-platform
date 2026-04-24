import { BRAND_CONFIG } from "@/lib/constants/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";
import type {
 AdminBrandSettingsSnapshot,
 AdminCalendarEventItem,
 AdminControlCenterData,
 AdminInternalAccessItem,
 AdminRecentAuditItem,
 InternalSectorRole
} from "@/types/internal-panels";

interface BrandSettingsRow {
 brand_name: string;
 support_whatsapp: string | null;
 support_email: string | null;
 address_text: string | null;
 business_hours: string | null;
 instagram_url: string | null;
 facebook_url: string | null;
 tiktok_url: string | null;
 legal_document_cnpj: string | null;
 maintenance_banner: string | null;
 technical_draft_payload: Record<string, unknown> | null;
 technical_draft_owner: string | null;
 technical_published_payload: Record<string, unknown> | null;
}

interface MaintenanceModeRow {
 enabled: boolean;
 message: string;
 allow_roles: UserRole[] | null;
 starts_at: string | null;
 ends_at: string | null;
 updated_at: string | null;
}

interface InternalRoleRow {
 id: number;
 user_id: string;
 role: InternalSectorRole;
 is_primary: boolean;
 is_active: boolean;
 created_at: string;
}

interface ProfileLookupRow {
 id: string;
 full_name: string | null;
 email: string | null;
}

interface CalendarEventRow {
 id: string;
 title: string;
 description: string | null;
 starts_at: string;
 ends_at: string | null;
 responsible_role: UserRole | null;
 is_all_day: boolean;
 created_by: string | null;
}

interface AuditLogRow {
 id: number;
 actor_user_id: string | null;
 actor_role: UserRole | null;
 event_name: string;
 entity_table: string;
 entity_id: string | null;
 metadata: Record<string, unknown> | null;
 created_at: string;
}

function buildDefaultBrandSettings(): AdminBrandSettingsSnapshot {
 return {
 brandName: BRAND_CONFIG.companyName,
 supportWhatsapp: null,
 supportEmail: BRAND_CONFIG.contactEmail,
 addressText: BRAND_CONFIG.showroomAddress,
 businessHours: null,
 instagramUrl: null,
 facebookUrl: null,
 tiktokUrl: null,
 cnpj: null,
 maintenanceBanner: null,
 technicalDraftPayload: null,
 technicalPublishedPayload: null
 };
}

function buildMockData(currentUserId: string): AdminControlCenterData {
 const startsAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
 const createdAt = new Date().toISOString();

 return {
 brandSettings: buildDefaultBrandSettings(),
 internalAccesses: [
 {
 id: 1,
 userId: currentUserId,
 fullName: "Admin demonstração",
 email: "admin@demo.com",
 role: "admin",
 isPrimary: true,
 isActive: true,
 createdAt
 }
 ],
 calendarEvents: [
 {
 id: "00000000-0000-4000-8000-000000000041",
 title: "Revisão semanal da operação",
 description: "Acompanhamento de pedidos e ajustes internos.",
 startsAt,
 endsAt: null,
 responsibleRole: "admin",
 isAllDay: false,
 createdByName: "Admin demonstração"
 }
 ],
 maintenanceMode: {
 enabled: false,
 message: "Sistema em manutenção programada.",
 allowRoles: ["admin"],
 startsAt: null,
 endsAt: null,
 updatedAt: createdAt
 },
 recentAudit: [
 {
 id: 1,
 actorName: "Admin demonstração",
 actorRole: "admin",
 eventName: "admin.update_brand_settings",
 entityTable: "brand_settings",
 entityId: "singleton",
 summary: "Atualizou as configurações gerais da marca.",
 createdAt
 }
 ],
 summary: {
 activeInternalUsers: 1,
 pendingNotifications: 0,
 upcomingCalendarEvents: 1,
 recentCriticalChanges: 1
 },
 technicalDraftOwnerName: "Admin demonstração",
 isCurrentUserDraftOwner: true
 };
}

function summarizeAudit(log: AuditLogRow): string {
 const metadata = log.metadata ?? {};
 const protocol = typeof metadata.protocol === "string" ? metadata.protocol : null;
 const accessEmail =
 typeof metadata.access_email === "string" ? metadata.access_email : null;
 const eventTitle =
 typeof metadata.event_title === "string" ? metadata.event_title : null;
 const operationMode =
 typeof metadata.operation_mode === "string" ? metadata.operation_mode : null;

 switch (log.event_name) {
 case "admin.update_brand_settings":
 return "Atualizou as configurações gerais da marca.";
 case "admin.technical_publish":
 return operationMode
 ? `Executou o modo tecnico em '${operationMode}'.`
 : "Executou uma operação no modo técnico.";
 case "admin.update_custom_order_status":
 return protocol
 ? `Atualizou o status do pedido ${protocol}.`
 : "Atualizou o status de um pedido sob medida.";
 case "admin.manage_internal_access":
 return accessEmail
 ? `Configurou o acesso interno de ${accessEmail}.`
 : "Configurou um acesso interno.";
 case "admin.create_internal_calendar_event":
 return eventTitle
 ? `Criou o evento interno '${eventTitle}'.`
 : "Criou um evento no calendário interno.";
 case "admin.update_maintenance_mode":
 return "Atualizou as regras do modo manutenção.";
 case "finance.unlock_and_update":
 return protocol
 ? `Aplicou alteracoes financeiras com desbloqueio no pedido ${protocol}.`
 : "Aplicou alterações financeiras com desbloqueio.";
 case "sales_stock.update_product_operational":
 return "Atualizou dados operacionais de um produto da loja.";
 case "sales_stock.update_variant_stock":
 return "Atualizou estoque de uma variação da loja.";
 default:
 return `${log.event_name.replaceAll(".", " ")}.`;
 }
}

export async function getAdminControlCenterData(
 currentUserId: string
): Promise<AdminControlCenterData> {
 if (!isSupabaseConfigured) {
 return buildMockData(currentUserId);
 }

 try {
 const supabase = await createSupabaseServerClient();
 const nowIso = new Date().toISOString();
 const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

 const [
 brandSettingsResponse,
 maintenanceResponse,
 internalRolesResponse,
 calendarEventsResponse,
 auditResponse,
 pendingNotificationsResponse,
 upcomingEventsCountResponse,
 recentChangesCountResponse
 ] = await Promise.all([
 supabase
 .from("brand_settings")
 .select(
 "brand_name,support_whatsapp,support_email,address_text,business_hours,instagram_url,facebook_url,tiktok_url,legal_document_cnpj,maintenance_banner,technical_draft_payload,technical_draft_owner,technical_published_payload"
 )
 .eq("singleton_key", true)
 .maybeSingle<BrandSettingsRow>(),
 supabase
 .from("maintenance_mode")
 .select("enabled,message,allow_roles,starts_at,ends_at,updated_at")
 .eq("id", 1)
 .maybeSingle<MaintenanceModeRow>(),
 supabase
 .from("user_roles")
 .select("id,user_id,role,is_primary,is_active,created_at")
 .in("role", ["admin", "finance", "sales_stock"])
 .eq("is_active", true)
 .order("created_at", { ascending: false })
 .returns<InternalRoleRow[]>(),
 supabase
 .from("internal_calendar_events")
 .select("id,title,description,starts_at,ends_at,responsible_role,is_all_day,created_by")
 .gte("starts_at", nowIso)
 .order("starts_at", { ascending: true })
 .limit(6)
 .returns<CalendarEventRow[]>(),
 supabase
 .from("internal_audit_logs")
 .select("id,actor_user_id,actor_role,event_name,entity_table,entity_id,metadata,created_at")
 .order("created_at", { ascending: false })
 .limit(8)
 .returns<AuditLogRow[]>(),
 supabase
 .from("internal_notifications")
 .select("*", { count: "exact", head: true })
 .eq("status", "pending"),
 supabase
 .from("internal_calendar_events")
 .select("*", { count: "exact", head: true })
 .gte("starts_at", nowIso),
 supabase
 .from("internal_audit_logs")
 .select("*", { count: "exact", head: true })
 .gte("created_at", sevenDaysAgoIso)
 ]);

 const brandSettingsRow = brandSettingsResponse.data;
 const internalRoles = internalRolesResponse.data ?? [];
 const calendarRows = calendarEventsResponse.data ?? [];
 const auditRows = auditResponse.data ?? [];

 const userIds = Array.from(
 new Set(
 [
 ...internalRoles.map((item) => item.user_id),
 ...calendarRows.map((item) => item.created_by),
 ...auditRows.map((item) => item.actor_user_id),
 brandSettingsRow?.technical_draft_owner ?? null
 ].filter((userId): userId is string => Boolean(userId))
 )
 );

 const profilesResponse = userIds.length
 ? await supabase
 .from("profiles")
 .select("id,full_name,email")
 .in("id", userIds)
 .returns<ProfileLookupRow[]>()
 : { data: [] as ProfileLookupRow[] };

 const profileById = new Map((profilesResponse.data ?? []).map((item) => [item.id, item]));

 const internalAccesses: AdminInternalAccessItem[] = internalRoles
 .map((item) => {
 const profile = profileById.get(item.user_id);
 return {
 id: item.id,
 userId: item.user_id,
 fullName: profile?.full_name ?? profile?.email ?? "Colaborador interno",
 email: profile?.email ?? null,
 role: item.role,
 isPrimary: item.is_primary,
 isActive: item.is_active,
 createdAt: item.created_at
 };
 })
 .sort((left, right) => {
 if (left.role === right.role) {
 return left.fullName.localeCompare(right.fullName, "pt-BR");
 }

 return left.role.localeCompare(right.role, "pt-BR");
 });

 const calendarEvents: AdminCalendarEventItem[] = calendarRows.map((item) => ({
 id: item.id,
 title: item.title,
 description: item.description,
 startsAt: item.starts_at,
 endsAt: item.ends_at,
 responsibleRole: item.responsible_role,
 isAllDay: item.is_all_day,
 createdByName: item.created_by
 ? profileById.get(item.created_by)?.full_name ?? null
 : null
 }));

 const recentAudit: AdminRecentAuditItem[] = auditRows.map((item) => ({
 id: item.id,
 actorName: item.actor_user_id
 ? profileById.get(item.actor_user_id)?.full_name ?? null
 : null,
 actorRole: item.actor_role,
 eventName: item.event_name,
 entityTable: item.entity_table,
 entityId: item.entity_id,
 summary: summarizeAudit(item),
 createdAt: item.created_at
 }));

 return {
 brandSettings: brandSettingsRow
 ? {
 brandName: brandSettingsRow.brand_name,
 supportWhatsapp: brandSettingsRow.support_whatsapp,
 supportEmail: brandSettingsRow.support_email,
 addressText: brandSettingsRow.address_text,
 businessHours: brandSettingsRow.business_hours,
 instagramUrl: brandSettingsRow.instagram_url,
 facebookUrl: brandSettingsRow.facebook_url,
 tiktokUrl: brandSettingsRow.tiktok_url,
 cnpj: brandSettingsRow.legal_document_cnpj,
 maintenanceBanner: brandSettingsRow.maintenance_banner,
 technicalDraftPayload: brandSettingsRow.technical_draft_payload ?? null,
 technicalPublishedPayload: brandSettingsRow.technical_published_payload ?? null
 }
 : buildDefaultBrandSettings(),
 internalAccesses,
 calendarEvents,
 maintenanceMode: {
 enabled: maintenanceResponse.data?.enabled ?? false,
 message: maintenanceResponse.data?.message ?? "Sistema em manutenção programada.",
 allowRoles: maintenanceResponse.data?.allow_roles ?? ["admin"],
 startsAt: maintenanceResponse.data?.starts_at ?? null,
 endsAt: maintenanceResponse.data?.ends_at ?? null,
 updatedAt: maintenanceResponse.data?.updated_at ?? null
 },
 recentAudit,
 summary: {
 activeInternalUsers: new Set(internalRoles.map((item) => item.user_id)).size,
 pendingNotifications: pendingNotificationsResponse.count ?? 0,
 upcomingCalendarEvents: upcomingEventsCountResponse.count ?? calendarEvents.length,
 recentCriticalChanges: recentChangesCountResponse.count ?? recentAudit.length
 },
 technicalDraftOwnerName: brandSettingsRow?.technical_draft_owner
 ? profileById.get(brandSettingsRow.technical_draft_owner)?.full_name ?? null
 : null,
 isCurrentUserDraftOwner: brandSettingsRow?.technical_draft_owner === currentUserId
 };
 } catch {
 return buildMockData(currentUserId);
 }
}
