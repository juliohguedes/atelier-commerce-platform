import { MessageCircle } from "lucide-react";
import { homeWhatsappCta } from "@/lib/constants/homepage";

export function HomeWhatsAppButton() {
 const whatsappUrl = `https://wa.me/${homeWhatsappCta.phoneDigits}?text=${encodeURIComponent(
 homeWhatsappCta.prefilledMessage
 )}`;

 return (
 <a
 aria-label="Conversar no WhatsApp"
 className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-gold-500/45 bg-black/85 px-4 py-3 text-sm font-semibold text-gold-400 shadow-luxe transition-transform duration-200 hover:-translate-y-1 hover:text-gold-500"
 href={whatsappUrl}
 rel="noopener noreferrer"
 target="_blank"
 >
 <MessageCircle className="h-4 w-4" />
 WhatsApp
 </a>
 );
}
