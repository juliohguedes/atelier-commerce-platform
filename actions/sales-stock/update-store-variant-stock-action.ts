"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
 salesUpdateVariantStockSchema,
 type SalesUpdateVariantStockInput
} from "@/lib/validations/internal-panels";
import { getUserRole } from "@/services/auth/get-user-role";
import { createSystemBackup } from "@/services/security/create-system-backup";

interface UpdateStoreVariantStockResult {
 success: boolean;
 message: string;
}

interface VariantRow {
 id: string;
 product_id: string;
 sku: string;
 stock_quantity: number;
 reserved_quantity: number;
 is_active: boolean;
}

export async function updateStoreVariantStockAction(
 input: SalesUpdateVariantStockInput
): Promise<UpdateStoreVariantStockResult> {
 if (!isSupabaseConfigured) {
 return {
 success: false,
 message: "Operação indisponivel sem Supabase configurado."
 };
 }

 try {
 const payload = salesUpdateVariantStockSchema.parse(input);
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
 message: "Apenas admin e vendas/estoque podem editar estoque."
 };
 }

 const admin = createSupabaseAdminClient();

 const { data: variant } = await admin
 .from("store_product_variants")
 .select("id,product_id,sku,stock_quantity,reserved_quantity,is_active")
 .eq("id", payload.variantId)
 .maybeSingle<VariantRow>();

 if (!variant) {
 return {
 success: false,
 message: "Variação não encontrada."
 };
 }

 if (payload.stockQuantity < Number(variant.reserved_quantity)) {
 return {
 success: false,
 message:
 "A quantidade em estoque não pode ficar abaixo da quantidade reservada atual."
 };
 }

 await createSystemBackup({
 writer: admin,
 contextArea: "sales_stock",
 entityTable: "store_product_variants",
 entityId: variant.id,
 backupReason: "before_store_variant_stock_update",
 snapshot: {
 variant
 },
 createdBy: user.id
 });

 const { error: updateError } = await admin
 .from("store_product_variants")
 .update({
 stock_quantity: payload.stockQuantity,
 is_active: payload.isActive
 })
 .eq("id", variant.id);

 if (updateError) {
 return {
 success: false,
 message: "Não foi possível atualizar a variação."
 };
 }

 const previousStock = Number(variant.stock_quantity);
 const nextStock = payload.stockQuantity;

 if (previousStock !== nextStock) {
 const movementType =
 nextStock > previousStock ? "manual_increase" : "manual_decrease";

 await admin.from("store_stock_movements").insert({
 variant_id: variant.id,
 product_id: variant.product_id,
 movement_type: movementType,
 quantity: Math.abs(nextStock - previousStock),
 previous_stock_quantity: previousStock,
 new_stock_quantity: nextStock,
 previous_reserved_quantity: Number(variant.reserved_quantity),
 new_reserved_quantity: Number(variant.reserved_quantity),
 note: "Ajuste manual de estoque no painel vendas/estoque.",
 created_by: user.id
 });
 }

 await admin.from("internal_audit_logs").insert({
 actor_user_id: user.id,
 actor_role: role,
 event_name: "sales_stock.update_variant_stock",
 entity_table: "store_product_variants",
 entity_id: variant.id,
 metadata: {
 sku: variant.sku,
 previous_stock: previousStock,
 next_stock: nextStock,
 previous_active: variant.is_active,
 next_active: payload.isActive,
 reserved_quantity: Number(variant.reserved_quantity)
 }
 });

 revalidatePath(ROUTES.private.salesStock);
 revalidatePath(ROUTES.public.shop);

 return {
 success: true,
 message: "Estoque da variação atualizado com sucesso."
 };
 } catch (error) {
 return {
 success: false,
 message:
 error instanceof Error ? error.message : "Falha inesperada ao atualizar estoque."
 };
 }
}
