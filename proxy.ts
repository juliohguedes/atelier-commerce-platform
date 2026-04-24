import { NextResponse, type NextRequest } from "next/server";
import {
 getInternalAccessCookieName,
 hasValidInternalAccessSession
} from "@/lib/auth/internal-access-session";
import {
 resolveInternalSignInRoute,
 shouldRequireInternalAccess
} from "@/lib/auth/internal-access";
import { canAccessPath } from "@/lib/auth/permissions";
import { ROUTES } from "@/lib/constants/routes";
import { authRoutePrefixes, privateRoutePrefixes } from "@/lib/constants/routes";
import { updateSession } from "@/lib/supabase/middleware";
import { isInternalUserRole, parseUserRole, type UserRole } from "@/types/auth";

interface MaintenanceModeRow {
 enabled: boolean;
 message: string;
 allow_roles: UserRole[] | null;
 starts_at: string | null;
 ends_at: string | null;
}

function isPrivateRoute(pathname: string): boolean {
 return privateRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRoute(pathname: string): boolean {
 return authRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isMaintenanceRoute(pathname: string): boolean {
 return pathname.startsWith(ROUTES.public.maintenance);
}

function isMaintenanceActive(maintenanceMode: MaintenanceModeRow | null): boolean {
 if (!maintenanceMode?.enabled) {
 return false;
 }

 const now = Date.now();

 if (maintenanceMode.starts_at && now < new Date(maintenanceMode.starts_at).getTime()) {
 return false;
 }

 if (maintenanceMode.ends_at && now > new Date(maintenanceMode.ends_at).getTime()) {
 return false;
 }

 return true;
}

async function getCurrentUserRole(
 userId: string,
 supabase: NonNullable<Awaited<ReturnType<typeof updateSession>>["supabase"]>
) {
 const { data: roleRow } = await supabase
 .from("user_roles")
 .select("role")
 .eq("user_id", userId)
 .eq("is_active", true)
 .order("is_primary", { ascending: false })
 .order("created_at", { ascending: true })
 .limit(1)
 .maybeSingle();

 if (roleRow?.role) {
 return parseUserRole(roleRow.role);
 }

 const { data: legacyProfile } = await supabase
 .from("profiles")
 .select("role")
 .eq("id", userId)
 .maybeSingle();

 return parseUserRole(legacyProfile?.role);
}

export async function proxy(request: NextRequest) {
 const { pathname } = request.nextUrl;
 const { response, supabase } = await updateSession(request);

 if (!supabase) {
 return response;
 }

 const {
 data: { user }
 } = await supabase.auth.getUser();

 const { data: maintenanceMode } = await supabase
 .from("maintenance_mode")
 .select("enabled,message,allow_roles,starts_at,ends_at")
 .eq("id", 1)
 .maybeSingle<MaintenanceModeRow>();

 const maintenanceActive = isMaintenanceActive(maintenanceMode ?? null);
 const maintenanceAllowedRoles = maintenanceMode?.allow_roles ?? ["admin"];
 const isAuthPage = isAuthRoute(pathname);
 const isPrivatePage = isPrivateRoute(pathname);
 const isMaintenancePage = isMaintenanceRoute(pathname);

 let role: UserRole | null = null;
 if (user) {
 role = await getCurrentUserRole(user.id, supabase);
 }

 const internalAccessVerified =
 user && role && isInternalUserRole(role)
 ? await hasValidInternalAccessSession(supabase, {
 userId: user.id,
 role,
 sessionToken: request.cookies.get(getInternalAccessCookieName())?.value
 })
 : false;

 const isResetPasswordPath = pathname.startsWith(ROUTES.public.resetPassword);
 if (isAuthPage && user && !isResetPasswordPath) {
 if (role && isInternalUserRole(role) && !internalAccessVerified) {
 const signInUrl = request.nextUrl.clone();
 signInUrl.pathname = resolveInternalSignInRoute(role);
 signInUrl.searchParams.set("redirectedFrom", pathname);
 return pathname === signInUrl.pathname ? response : NextResponse.redirect(signInUrl);
 }

 const dashboardUrl = request.nextUrl.clone();
 dashboardUrl.pathname = ROUTES.private.dashboard;
 return NextResponse.redirect(dashboardUrl);
 }

 if (
 maintenanceActive &&
 !isMaintenancePage &&
 !isAuthPage &&
 !pathname.startsWith(ROUTES.auth.callback)
 ) {
 if (!isPrivatePage) {
 const maintenanceUrl = request.nextUrl.clone();
 maintenanceUrl.pathname = ROUTES.public.maintenance;
 return NextResponse.redirect(maintenanceUrl);
 }

 if (!role || !maintenanceAllowedRoles.includes(role)) {
 const maintenanceUrl = request.nextUrl.clone();
 maintenanceUrl.pathname = ROUTES.public.maintenance;
 return NextResponse.redirect(maintenanceUrl);
 }
 }

 if (!isPrivatePage) {
 return response;
 }

 if (!user) {
 const signInUrl = request.nextUrl.clone();
 signInUrl.pathname = ROUTES.public.signIn;
 signInUrl.searchParams.set("redirectedFrom", pathname);
 return NextResponse.redirect(signInUrl);
 }

 if (!role || !canAccessPath(role, pathname)) {
 const dashboardUrl = request.nextUrl.clone();
 dashboardUrl.pathname = ROUTES.private.dashboard;
 return NextResponse.redirect(dashboardUrl);
 }

 if (shouldRequireInternalAccess(role, pathname) && !internalAccessVerified) {
 const signInUrl = request.nextUrl.clone();
 signInUrl.pathname = resolveInternalSignInRoute(role);
 signInUrl.searchParams.set("redirectedFrom", pathname);
 return NextResponse.redirect(signInUrl);
 }

 return response;
}

export const config = {
 matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
