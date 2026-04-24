import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
 return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(value: number): string {
 return new Intl.NumberFormat("pt-BR", {
 style: "currency",
 currency: "BRL"
 }).format(value);
}

export function formatDateBR(date: Date | string): string {
 const parsedDate = typeof date === "string" ? new Date(date) : date;
 return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
}

export function maskEmail(value: string | null | undefined): string {
 if (!value) {
 return "-";
 }

 const [local, domain] = value.split("@");
 if (!local || !domain) {
 return value;
 }

 const visibleLocal = local.slice(0, 2);
 return `${visibleLocal}${"*".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

export function maskPhone(value: string | null | undefined): string {
 if (!value) {
 return "-";
 }

 const digits = value.replace(/\D/g, "");
 if (digits.length < 4) {
 return value;
 }

 const start = digits.slice(0, 2);
 const end = digits.slice(-2);
 return `${start}${"*".repeat(Math.max(digits.length - 4, 4))}${end}`;
}

export function maskDocument(value: string | null | undefined): string {
 if (!value) {
 return "-";
 }

 const digits = value.replace(/\D/g, "");
 if (digits.length < 4) {
 return value;
 }

 return `${digits.slice(0, 2)}${"*".repeat(Math.max(digits.length - 4, 4))}${digits.slice(-2)}`;
}
