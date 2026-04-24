import { cn } from "@/lib/utils";

interface HomeSectionHeadingProps {
 eyebrow: string;
 title: string;
 description?: string;
 className?: string;
}

export function HomeSectionHeading({
 eyebrow,
 title,
 description,
 className
}: HomeSectionHeadingProps) {
 return (
 <header className={cn("space-y-3", className)}>
 <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">{eyebrow}</p>
 <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
 {description ? <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p> : null}
 </header>
 );
}
