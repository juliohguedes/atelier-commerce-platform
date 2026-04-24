import { NextResponse } from "next/server";
import { buildManagementCsv, buildManagementPdf } from "@/lib/export/management-report-export";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { managementReportFiltersSchema } from "@/lib/validations/management";
import { getUserRole } from "@/services/auth/get-user-role";
import { getInternalCalendarData } from "@/services/internal/get-internal-calendar-data";
import { getManagementReportsData } from "@/services/internal/get-management-reports-data";

function getFileStamp(): string {
 return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
 try {
 const { searchParams } = new URL(request.url);
 const format = searchParams.get("format") === "pdf" ? "pdf" : "csv";
 const filterEntries = Array.from(searchParams.entries()).filter(
 ([key]) => key !== "format"
 );

 const filters = managementReportFiltersSchema.parse(
 Object.fromEntries(filterEntries)
 );

 if (isSupabaseConfigured) {
 const supabase = await createSupabaseServerClient();
 const {
 data: { user }
 } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json(
 { message: "Autenticação obrigatória para exportar relatórios." },
 { status: 401 }
 );
 }

 const role = await getUserRole(user.id);
 if (role !== "finance") {
 return NextResponse.json(
 { message: "Somente o setor financeiro pode exportar relatórios." },
 { status: 403 }
 );
 }
 }

 const [reports, calendar] = await Promise.all([
 getManagementReportsData(filters),
 getInternalCalendarData()
 ]);

 if (format === "pdf") {
 const buffer = buildManagementPdf(reports, calendar, filters);
 const body = new Blob([new Uint8Array(buffer)], {
 type: "application/pdf"
 });

 return new NextResponse(body, {
 headers: {
 "Content-Type": "application/pdf",
 "Content-Disposition": `attachment; filename="relatorio-interno-${getFileStamp()}.pdf"`
 }
 });
 }

 const csv = buildManagementCsv(reports, calendar);

 return new NextResponse(csv, {
 headers: {
 "Content-Type": "text/csv; charset=utf-8",
 "Content-Disposition": `attachment; filename="relatorio-interno-${getFileStamp()}.csv"`
 }
 });
 } catch (error) {
 return NextResponse.json(
 {
 message:
 error instanceof Error
 ? error.message
 : "Não foi possível exportar o relatório."
 },
 { status: 400 }
 );
 }
}
