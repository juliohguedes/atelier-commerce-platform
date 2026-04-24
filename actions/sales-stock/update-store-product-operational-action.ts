"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 salesUpdateProductOperationalSchema,
 type SalesUpdateProductOperationalInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateStoreProductOperationalResult {
 success: boolean;
 message: string;
}

interface StoreProductRow {
 id: string;
 slug: string;
 name: string;
 short_description: string | null;
 description: string | null;
 category_id: string | null;
 collection_id: string | null;
 is_active: boolean;
 is_featured: boolean;
 sort_order: number;
}

export async function updateStoreProductOperationalAction(
 input: SalesUpdateProductOperationalInput
): Promise<UpdateStoreProductOperationalResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = salesUpdateProductOperationalSchema.parse(input);
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
 if (![
 "admin",
 "sales_stock"
 ].includes(role)) {
 return {
 success: false,
 message: "Apenas admin e vendas/estoque podem editar dados operacionais de produto."
 };
 }

 const admin = createSupabaseAdminClient();

 const { data: before } = await admin
 .from("store_products")
 .select(
 "id,slug,name,short_description,description,category_id,collection_id,is_active,is_featured,sort_order"
 )
 .eq("id", payload.productId)
 .maybeSingle<StoreProductRow>();

 if (!before) {
 return {
 success: false,
 message: "Produto não encontrado."
 };
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "sales_stock",
 entityTable: "store_products",
 entityId: before.id,
 backupReason: "before_store_product_operational_update",
 snapshot: {
 product: before
 },
 createdBy: user.id
 });

 const updatePayload = {
 name: payload.name,
 short_description: payload.shortDescription ?? null,
 description: payload.description ?? null,
 category_id: payload.categoryId ?? null,
 collection_id: payload.collectionId ?? null,
 is_active: payload.isActive,
 is_featured: payload.isFeatured,
 sort_order: payload.sortOrder
 };

 const { error } = await admin.from("store_products").update(updatePayload).eq("id", payload.productId);

 if (error) {
 return {
 success: false,
 message: "Não foi possível atualizar o produto."
 };
 }

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "sales_stock.update_product_operational",
 entity_table: "store_products",
 entity_id: before.id,
 metadata: {
 product_slug: before.slug,
 previous: {
 name: before.name,
 short_description: before.short_description,
 description: before.description,
 category_id: before.category_id,
 collection_id: before.collection_id,
 is_active: before.is_active,
 is_featured: before.is_featured,
 sort_order: before.sort_order
 },
 next: updatePayload,
 role
 }
 });

 revalidatePath(ROUTES.private.salesStock);
 revalidatePath(ROUTES.public.shop);
 revalidatePath(`${ROUTES.public.shop}/${before.slug}`);

 return {
 success: true,
 message: "Produto atualizado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao atualizar produto."
 };
 }
}
