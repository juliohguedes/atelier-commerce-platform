"use server";

import { revalidatePath } from "next/cache";
import { COMPLIANCE_VERSIONS, CONSENT_SLUGS } from "@/lib/constants/compliance";
import {
 customOrderAudienceOptions,
 customOrderEstimateDisclaimer,
 customOrderPieceOptions,
 customOrderProductionModeOptions
} from "@/lib/constants/custom-order";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 customOrderPayloadSchema,
 type CustomOrderPayloadInput
} from "@/lib/validations/custom-order";
import { getUserRole } from "@/services/auth/get-user-role";
import { calculatePreEstimate } from "@/services/custom-order/calculate-pre-estimate";
import {
 cancellableStatusesBeforePayment,
 getCustomOrderStatusLabel
} from "@/services/custom-order/order-status";
import { registerConsentRecord } from "@/services/security/register-consent-record";
import { onlyDigits } from "@/lib/validations/br";
import type { CustomOrderStatus } from "@/types/custom-order";

interface UpsertCustomOrderActionResult {
 success: boolean;
 message: string;
 order?: {
 id: number;
 publicId: string;
 protocolCode: string;
 status: CustomOrderStatus;
 statusLabel: string;
 estimatedTotal: number;
 pieceTypeLabel: string;
 productionModeLabel: string;
 audienceLabel: string;
 };
}

interface ExistingOrderRecord {
 id: number;
 public_id: string;
 protocol_code: string;
 user_id: string | null;
 contact_email: string | null;
 contact_whatsapp: string | null;
 status: CustomOrderStatus;
 submitted_at: string | null;
 payment_confirmed_at: string | null;
}

interface AuthenticatedProfileRow {
 full_name: string | null;
 email: string | null;
 whatsapp: string | null;
}

function getOptionLabel(
 options: ReadonlyArray<{ value: string; label: string }>,
 value: string
): string {
 return options.find((option) => option.value === value)?.label ?? value;
}

function normalizeDate(value: string | undefined): string | null {
 if (!value) {
 return null;
 }

 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
 return null;
 }

 return value;
}

function normalizeContactEmail(value: string | undefined): string | null {
 if (!value) {
 return null;
 }

 return value.trim().toLowerCase();
}

function normalizeContactWhatsapp(value: string | undefined): string | null {
 if (!value) {
 return null;
 }

 const normalized = onlyDigits(value);
 return normalized.length > 0 ? normalized : null;
}

function canGuestEditOrder(
 order: ExistingOrderRecord,
 payloadEmail: string | null,
 payloadWhatsapp: string | null
): boolean {
 if (order.user_id) {
 return false;
 }

 if (!order.contact_email) {
 return true;
 }

 const sameEmail = payloadEmail && payloadEmail === order.contact_email.toLowerCase();
 const sameWhatsapp =
 payloadWhatsapp &&
 order.contact_whatsapp &&
 payloadWhatsapp === onlyDigits(order.contact_whatsapp);

 return Boolean(sameEmail || sameWhatsapp);
}

export async function upsertCustomOrderAction(
 input: CustomOrderPayloadInput
): Promise<UpsertCustomOrderActionResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message:
 "Módulo indisponivel sem Supabase configurado. Defina as variaveis de ambiente para persistir pedidos."
 };
 }

 try {
 const payload = customOrderPayloadSchema.parse(input);
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

 const authenticatedProfile = authenticatedUserId
 ? (
 await admin
 .from("profiles")
 .select("full_name,email,whatsapp")
 .eq("id", authenticatedUserId)
 .maybeSingle<AuthenticatedProfileRow>()
 ).data ?? null
 : null;

 const contactEmail =
 normalizeContactEmail(payload.contactEmail) ?? authenticatedProfile?.email?.trim().toLowerCase() ?? null;
 const contactWhatsapp =
 normalizeContactWhatsapp(payload.contactWhatsapp) ?? authenticatedProfile?.whatsapp ?? null;
 const contactFullName =
 payload.contactFullName?.trim() ?? authenticatedProfile?.full_name?.trim() ?? null;

 const estimateBreakdown = calculatePreEstimate({
 pieceType: payload.pieceType,
 complexity: payload.complexity,
 fabricTier: payload.fabricTier,
 selectedNotions: payload.notions
 });

 const targetStatus: CustomOrderStatus =
 payload.operation === "submit_analysis" ? "pedido_recebido" : "draft";
 const nowIso = new Date().toISOString();
 const desiredDeadline = normalizeDate(payload.desiredDeadline);

 const upsertPayload = {
 user_id: authenticatedUserId,
 audience: payload.audience,
 production_mode: payload.productionMode,
 request_type: payload.requestType,
 piece_type: payload.pieceType,
 piece_type_other: payload.pieceTypeOther ?? null,
 size_standard:
 payload.productionMode === "larga_escala" ? (payload.sizeStandard ?? null) : null,
 size_custom: payload.productionMode === "larga_escala" ? (payload.sizeOther ?? null) : null,
 modeling: payload.productionMode === "larga_escala" ? (payload.modeling ?? null) : null,
 piece_length: payload.productionMode === "larga_escala" ? (payload.pieceLength ?? null) : null,
 measurements:
 payload.productionMode === "sob_medida" ? payload.measurements : {},
 reference_notes: payload.referenceNotes ?? null,
 exclusive_creation_details:
 payload.requestType === "criacao_exclusiva"
 ? {
 piece_type: payload.pieceType,
 estilo: payload.exclusiveStyle ?? null,
 fechamento: payload.exclusiveClosure ?? null,
 detalhes_especificos: payload.exclusiveSpecificDetails ?? null,
 tipo_tecido: payload.fabricType,
 tem_elastano: payload.hasElastane ?? null,
 havera_forro: payload.hasLining ?? null,
 aviamentos: payload.notions,
 cor_desejada: payload.exclusiveColor ?? null,
 estampa: payload.exclusivePrint ?? null,
 observacoes_visuais: payload.visualObservations ?? null,
 campo_livre_final: payload.finalNotes ?? null
 }
 : {},
 fabric_type: payload.fabricType,
 fabric_tier: payload.fabricTier,
 notions: payload.notions,
 notions_total: estimateBreakdown.notionsTotal,
 complexity: payload.complexity,
 desired_deadline: desiredDeadline,
 desired_deadline_reason: payload.desiredDeadlineReason ?? null,
 visual_notes: payload.visualObservations ?? null,
 final_notes: payload.finalNotes ?? null,
 contact_full_name: contactFullName,
 contact_email: contactEmail,
 contact_whatsapp: contactWhatsapp,
 terms_accepted: payload.operation === "submit_analysis" ? payload.acceptedTerms : false,
 estimate_acknowledged:
 payload.operation === "submit_analysis" ? payload.acceptedEstimateAwareness : false,
 estimated_price: estimateBreakdown.estimatedTotal,
 estimate_breakdown: {
 ...estimateBreakdown,
 disclaimer: customOrderEstimateDisclaimer
 },
 status: targetStatus,
 submitted_at: payload.operation === "submit_analysis" ? nowIso : null
 };

 let persistedOrder: ExistingOrderRecord | null = null;

 if (payload.existingOrderPublicId) {
 const { data: existingOrder, error: existingOrderError } = await admin
 .from("custom_orders")
 .select(
 "id,public_id,protocol_code,user_id,contact_email,contact_whatsapp,status,submitted_at,payment_confirmed_at"
 )
 .eq("public_id", payload.existingOrderPublicId)
 .maybeSingle<ExistingOrderRecord>();

 if (existingOrderError || !existingOrder) {
 return {
 success: false,
 message: "Não foi possível localizar o pedido para atualização."
 };
 }

 const isOwner = Boolean(authenticatedUserId && existingOrder.user_id === authenticatedUserId);
 const canGuestEdit = canGuestEditOrder(existingOrder, contactEmail, contactWhatsapp);

 if (!isOwner && !canGuestEdit && !isInternalUser) {
 return {
 success: false,
 message: "Você não tem permissão para editar este pedido."
 };
 }

 if (
 existingOrder.payment_confirmed_at &&
 !isInternalUser &&
 payload.operation !== "save_draft"
 ) {
 return {
 success: false,
 message:
 "Pedido com pagamento confirmado não pode ser alterado diretamente. Entre em contato com a equipe."
 };
 }

 if (
 !cancellableStatusesBeforePayment.includes(existingOrder.status) &&
 !isInternalUser
 ) {
 return {
 success: false,
 message:
 "Este pedido não esta mais em fase editavel. Fale com a equipe para ajustes."
 };
 }

 const nextStatus =
 payload.operation === "submit_analysis"
 ? "pedido_recebido"
 : existingOrder.status === "draft"
 ? "draft"
 : existingOrder.status;

 const { data: updatedOrder, error: updateError } = await admin
 .from("custom_orders")
 .update({
 ...upsertPayload,
 status: nextStatus,
 submitted_at:
 payload.operation === "submit_analysis"
 ? existingOrder.submitted_at ?? nowIso
 : existingOrder.submitted_at
 })
 .eq("id", existingOrder.id)
 .select(
 "id,public_id,protocol_code,user_id,contact_email,contact_whatsapp,status,submitted_at,payment_confirmed_at"
 )
 .single<ExistingOrderRecord>();

 if (updateError || !updatedOrder) {
 return {
 success: false,
 message: "Falha ao atualizar o pedido. Tente novamente."
 };
 }

 persistedOrder = updatedOrder;
 } else {
 const { data: createdOrder, error: insertError } = await admin
 .from("custom_orders")
 .insert({
 ...upsertPayload,
 submitted_at: payload.operation === "submit_analysis" ? nowIso : null
 })
 .select(
 "id,public_id,protocol_code,user_id,contact_email,contact_whatsapp,status,submitted_at,payment_confirmed_at"
 )
 .single<ExistingOrderRecord>();

 if (insertError || !createdOrder) {
 return {
 success: false,
 message: "Não foi possível salvar o pedido neste momento."
 };
 }

 persistedOrder = createdOrder;
 }

 revalidatePath(ROUTES.public.tailored);

 const pieceTypeLabel = getOptionLabel(customOrderPieceOptions, payload.pieceType);
 const productionModeLabel = getOptionLabel(
 customOrderProductionModeOptions,
 payload.productionMode
 );
 const audienceLabel = getOptionLabel(customOrderAudienceOptions, payload.audience);

 if (
 authenticatedUserId &&
 (contactFullName || contactEmail || contactWhatsapp) &&
 (
 !authenticatedProfile?.full_name ||
 !authenticatedProfile?.email ||
 !authenticatedProfile?.whatsapp
 )
 ) {
 await admin.from("profiles").upsert(
 {
 id: authenticatedUserId,
 full_name: contactFullName ?? authenticatedProfile?.full_name ?? "Cliente",
 email: contactEmail ?? authenticatedProfile?.email ?? null,
 whatsapp: contactWhatsapp ?? authenticatedProfile?.whatsapp ?? null,
 preferred_locale: "pt-BR"
 },
 {
 onConflict: "id"
 }
 );
 }

 if (payload.operation === "submit_analysis") {
 await registerConsentRecord({
 writer: admin,
 userId: authenticatedUserId,
 email: contactEmail,
 consentSlug: CONSENT_SLUGS.tailoredOrderTerms,
 consentVersion: COMPLIANCE_VERSIONS.tailoredOrderTerms,
 contextTable: "custom_orders",
 contextId: persistedOrder.public_id,
 metadata: {
 protocol_code: persistedOrder.protocol_code,
 audience: payload.audience
 }
 });

 await registerConsentRecord({
 writer: admin,
 userId: authenticatedUserId,
 email: contactEmail,
 consentSlug: CONSENT_SLUGS.estimateAcknowledgement,
 consentVersion: COMPLIANCE_VERSIONS.tailoredOrderTerms,
 contextTable: "custom_orders",
 contextId: persistedOrder.public_id,
 metadata: {
 protocol_code: persistedOrder.protocol_code,
 estimated_total: estimateBreakdown.estimatedTotal
 }
 });
 }

 return {
 success: true,
 message:
 payload.operation === "save_draft"
 ? "Rascunho salvo com sucesso."
 : "Pedido enviado para análise com sucesso.",
 order: {
 id: persistedOrder.id,
 publicId: persistedOrder.public_id,
 protocolCode: persistedOrder.protocol_code,
 status: persistedOrder.status,
 statusLabel: getCustomOrderStatusLabel(persistedOrder.status),
 estimatedTotal: estimateBreakdown.estimatedTotal,
 pieceTypeLabel,
 productionModeLabel,
 audienceLabel
 }
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error
 ? error.message
 : "Falha inesperada ao processar o pedido."
 };
 }
}
