"use client";

import { useEffect, useMemo, useState } from "react";
import { Quote, Star } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/home-section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import type { HomeTestimonial } from "@/lib/constants/homepage";

const autoRotateIntervalMs = 5500;

interface HomeTestimonialsSectionProps {
 testimonials: HomeTestimonial[];
}

export function HomeTestimonialsSection({
 testimonials: initialTestimonials
}: HomeTestimonialsSectionProps) {
 const testimonials = useMemo(() => initialTestimonials, [initialTestimonials]);
 const [activeIndex, setActiveIndex] = useState(0);

 useEffect(() => {
 if (testimonials.length === 0) {
 return undefined;
 }

 const intervalId = window.setInterval(() => {
 setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
 }, autoRotateIntervalMs);

 return () => {
 window.clearInterval(intervalId);
 };
 }, [testimonials.length]);

 const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

 if (!activeTestimonial) {
 return null;
 }

 return (
 <section className="border-b border-border/50 py-16 sm:py-20" id="depoimentos">
 <Container className="space-y-8">
 <HomeSectionHeading
 eyebrow="Depoimentos"
 title="Avaliações atualizadas automaticamente para mostrar a experiência real das clientes."
 description="Rotação continua de feedbacks verificados de encomendas e compras online."
 />

 <Card className="border-gold-600/40 bg-card/75 shadow-luxe">
 <CardContent className="space-y-6 p-7 sm:p-10">
 <div className="flex items-start justify-between gap-6">
 <Quote className="h-8 w-8 text-gold-400" />
 <div className="flex items-center gap-1 text-gold-400">
 {Array.from({ length: activeTestimonial.rating }).map((_, index) => (
 <Star className="h-4 w-4 fill-gold-400" key={`${activeTestimonial.id}-${index}`} />
 ))}
 </div>
 </div>

 <p className="max-w-4xl text-lg leading-relaxed sm:text-2xl">
 {`"${activeTestimonial.quote}"`}
 </p>

 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-sm font-semibold text-gold-400">{activeTestimonial.customerName}</p>
 <p className="text-sm text-muted-foreground">{activeTestimonial.context}</p>
 </div>

 <div className="flex items-center gap-2">
 {testimonials.map((testimonial, index) => (
 <button
 aria-label={`Exibir depoimento ${index + 1}`}
 className={cn(
 "h-2.5 rounded-full transition-all",
 activeIndex === index
 ? "w-8 bg-gold-400"
 : "w-2.5 bg-border hover:bg-gold-500/60"
 )}
 key={testimonial.id}
 onClick={() => setActiveIndex(index)}
 type="button"
 />
 ))}
 </div>
 </div>
 </CardContent>
 </Card>
 </Container>
 </section>
 );
}
