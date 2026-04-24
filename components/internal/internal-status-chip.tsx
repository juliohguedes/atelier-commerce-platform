import { cn } from "@/lib/utils";

interface InternalStatusChipProps {
 label: string;
 tone?: "neutral" | "warning" | "success" | "danger";
}

export function InternalStatusChip({ label, tone = "neutral" }: InternalStatusChipProps) {
 return (
 <span
 className={cn(
 "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
 tone === "neutral" && "border-border/70 bg-muted/40 text-foreground",
 tone === "warning" && "border-amber-500/40 bg-amber-500/10 text-amber-300",
 tone === "success" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
 tone === "danger" && "border-destructive/50 bg-destructive/10 text-destructive"
 )}
 >
 {label}
 </span>
 );
}
