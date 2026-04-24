import { NextResponse } from "next/server";
import { env, isProductionStage, isSupabaseConfigured } from "@/lib/env";
import { hasSupabaseAdminAccess } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const body = {
    status: "ok",
    timestamp: new Date().toISOString(),
    stage: env.NEXT_PUBLIC_APP_STAGE,
    checks: {
      app: "ok",
      supabaseConfigured: isSupabaseConfigured,
      serviceRoleConfigured: hasSupabaseAdminAccess,
      productionReadyConfig:
        !isProductionStage ||
        Boolean(
          isSupabaseConfigured &&
            env.SUPABASE_SERVICE_ROLE_KEY &&
            env.INTERNAL_FINANCE_UNLOCK_PASSWORD &&
            env.INTERNAL_ADMIN_TECHNICAL_PASSWORD
        )
    }
  } as const;

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
