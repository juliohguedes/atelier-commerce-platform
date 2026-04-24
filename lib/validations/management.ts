import { z } from "zod";
import type { ManagementReportSector, ManagementReportStatus } from "@/types/management";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
 z.preprocess((value) => {
 if (typeof value !== "string") {
 return value;
 }

 const trimmed = value.trim();
 return trimmed.length > 0 ? trimmed : undefined;
 }, schema.optional());

const reportSectorOptions: ManagementReportSector[] = [
 "todos",
 "admin",
 "finance",
 "sales_stock"
];

const reportStatusOptions: ManagementReportStatus[] = [
 "todos",
 "pedido_recebido",
 "em_analise",
 "aguardando_pagamento",
 "pagamento_aprovado",
 "em_producao",
 "em_separacao",
 "pronto_para_envio",
 "enviado",
 "entregue",
 "estoque_baixo",
 "indisponivel"
];

export const managementReportFiltersSchema = z.object({
 dateFrom: emptyToUndefined(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
 dateTo: emptyToUndefined(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
 sector: z.enum(reportSectorOptions).default("todos"),
 status: z.enum(reportStatusOptions).default("todos")
});

export type ManagementReportFiltersInput = z.input<typeof managementReportFiltersSchema>;
export type ManagementReportFilters = z.output<typeof managementReportFiltersSchema>;
