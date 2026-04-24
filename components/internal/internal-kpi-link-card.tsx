import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";

interface InternalKpiLinkCardProps {
 title: string;
 value: number;
 href: string;
 isCurrency?: boolean;
}

export function InternalKpiLinkCard({
 title,
 value,
 href,
 isCurrency = false
}: InternalKpiLinkCardProps) {
 return (
 <Link className="block transition-transform hover:-translate-y-0.5" href={href as Route}>
 <Card className="h-full border-border/70 bg-card/60 hover:border-gold-500/60">
 <CardHeader className="pb-2">
 <CardTitle className="text-base">{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-semibold text-gold-400">
 {isCurrency ? formatCurrencyBRL(value) : value}
 </p>
 <p className="mt-2 text-xs text-muted-foreground">Clique para filtrar</p>
 </CardContent>
 </Card>
 </Link>
 );
}
