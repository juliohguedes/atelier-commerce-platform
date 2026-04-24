export interface HomeHeroContent {
 title: string;
 subtitle: string;
 primaryActionLabel: string;
 secondaryActionLabel: string;
}

export interface HomeAboutHighlight {
 title: string;
 description: string;
}

export interface HomePiece {
 id: string;
 name: string;
 description: string;
 imageUrl: string;
 category: string;
}

export interface HomeCollection {
 id: string;
 title: string;
 summary: string;
 badge: string;
}

export interface HomeTestimonial {
 id: string;
 customerName: string;
 context: string;
 quote: string;
 rating: number;
}

export interface HomeFaqItem {
 id: string;
 question: string;
 answer: string;
}

export interface HomeLegalSection {
 id: string;
 title: string;
 summary: string;
 items: string[];
}

export interface HomeLocationInfo {
 showroomName: string;
 addressLine: string;
 cityState: string;
 openingHours: string;
 mapEmbedUrl: string;
}

export interface HomeWhatsappCta {
 phoneDigits: string;
 prefilledMessage: string;
}

export const defaultYearsInBusiness = 14;

export const homeHeroContent: HomeHeroContent = {
 title: "Crie online. Vista exclusividade e faca a moda.",
 subtitle:
 "Pecas sob medida e criacoes autorais com atendimento online, escolha de detalhes e acompanhamento do pedido ate a entrega. Ou, se preferir, visite nossa loja online e descubra pecas prontas para comprar.",
 primaryActionLabel: "Loja online",
 secondaryActionLabel: "Encomendar peca personalizada"
};

export const homeAboutHighlights: HomeAboutHighlight[] = [
 {
 title: "Atendimento boutique remoto",
 description:
 "Seu projeto comeca por briefing digital, escolha de materiais e orientacao de modelagem em cada etapa."
 },
 {
 title: "Criacao autoral com assinatura",
 description:
 "Cada peca nasce de desenho proprio, com acabamento artesanal e identidade exclusiva."
 },
 {
 title: "Processo transparente",
 description:
 "Atualizacoes frequentes do pedido, aprovacao de detalhes e previsao de entrega acompanhada."
 }
];

export const homePieces: HomePiece[] = [
 {
 id: "piece-atelier-noite",
 name: "Vestido Atelier Noite",
 description:
 "Vestido em crepe de seda com recorte estrategico, pensado para eventos formais e silhueta elegante.",
 imageUrl:
 "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
 category: "Alta costura"
 },
 {
 id: "piece-aurora-tailleur",
 name: "Tailleur Aurora",
 description:
 "Conjunto estruturado com alfaiataria feminina, ombro leve e caimento preciso para reunioes e ocasioes especiais.",
 imageUrl:
 "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=80",
 category: "Alfaiataria"
 },
 {
 id: "piece-dourada-midi",
 name: "Saia Dourada Midi",
 description:
 "Modelagem em A com textura acetinada e cintura alta, ideal para compor looks sofisticados no dia e na noite.",
 imageUrl:
 "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
 category: "Colecao autoral"
 },
 {
 id: "piece-camisaria-essence",
 name: "Camisaria Essence",
 description:
 "Camisa premium em algodao egipcio com botoes perolados e acabamento interno refinado.",
 imageUrl:
 "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
 category: "Pronto para comprar"
 }
];

export const homeCollections: HomeCollection[] = [
 {
 id: "collection-noir-signature",
 title: "Noir Signature",
 summary:
 "Linhas minimalistas em preto profundo, com foco em cortes de impacto e versatilidade premium.",
 badge: "Colecao em destaque"
 },
 {
 id: "collection-gold-details",
 title: "Gold Details",
 summary:
 "Pecas com pontos de dourado fosco, ferragens selecionadas e composicoes para ocasioes marcantes.",
 badge: "Edicao limitada"
 },
 {
 id: "collection-online-exclusive",
 title: "Online Exclusive",
 summary:
 "Selecao de pecas exclusivas para compra digital, com entrega monitorada e suporte de estilo.",
 badge: "Exclusivo no site"
 }
];

export const homeTestimonials: HomeTestimonial[] = [
 {
 id: "testimonial-001",
 customerName: "Mariana F.",
 context: "Encomenda personalizada para evento",
 quote:
 "O atendimento online foi impecavel. Ajustaram cada detalhe comigo e o vestido chegou exatamente como imaginei.",
 rating: 5
 },
 {
 id: "testimonial-002",
 customerName: "Renata C.",
 context: "Compra na loja online",
 quote:
 "Acabamento perfeito e entrega no prazo combinado. A experiencia foi elegante do inicio ao fim.",
 rating: 5
 },
 {
 id: "testimonial-003",
 customerName: "Juliana S.",
 context: "Capsula de alfaiataria sob medida",
 quote:
 "Senti exclusividade real. Recebi atualizacoes do processo e a modelagem valorizou meu corpo com precisao.",
 rating: 5
 }
];

export const homeFaqItems: HomeFaqItem[] = [
 {
 id: "faq-prazo",
 question: "Qual o prazo medio de uma peca sob medida?",
 answer:
 "O prazo varia conforme complexidade e agenda de producao. Em media, entre 20 e 35 dias corridos apos aprovacao final."
 },
 {
 id: "faq-ajustes",
 question: "Como funcionam os ajustes apos receber a peca?",
 answer:
 "Oferecemos ajuste fino dentro do periodo informado no pedido. Nossa equipe orienta coleta de medidas e envio para correcao."
 },
 {
 id: "faq-pagamento",
 question: "Quais formas de pagamento estao disponiveis?",
 answer:
 "Aceitamos cartao, pix e modalidades parceladas conforme campanha vigente. Todas as condicoes aparecem no checkout."
 },
 {
 id: "faq-entrega",
 question: "Voces entregam para todo o Brasil?",
 answer:
 "Sim. Trabalhamos com envio nacional e rastreio. O prazo exato e informado conforme CEP no momento da compra."
 }
];

export const homeLegalSections: HomeLegalSection[] = [
 {
 id: "termos-condicoes",
 title: "Termos e Condicoes",
 summary:
 "Regras de compra, personalizacao sob medida, prazos, ajustes e responsabilidades de ambas as partes.",
 items: [
 "Pecas sob medida entram em producao apos confirmacao de briefing e pagamento.",
 "Alteracoes de projeto apos aprovacao podem impactar prazo e custo final.",
 "Produtos prontos seguem politica de troca conforme legislacao vigente."
 ]
 },
 {
 id: "politica-privacidade",
 title: "Politica de Privacidade",
 summary:
 "Compromisso com protecao de dados, transparencia no uso de informacoes e seguranca de atendimento digital.",
 items: [
 "Dados cadastrais sao usados para atendimento, producao e entrega dos pedidos.",
 "Nao comercializamos informacoes pessoais com terceiros.",
 "A cliente pode solicitar atualizacao ou exclusao de dados, conforme obrigacoes legais."
 ]
 }
];

export const homeLocationInfo: HomeLocationInfo = {
 showroomName: "Maison Aurea Atelier",
 addressLine: "Rua Oscar Freire, 412",
 cityState: "Jardins, Sao Paulo - SP",
 openingHours: "Segunda a sabado, das 10h as 19h",
 mapEmbedUrl:
 "https://www.google.com/maps?q=Rua+Oscar+Freire+412+Sao+Paulo+SP&output=embed"
};

export const homeWhatsappCta: HomeWhatsappCta = {
 phoneDigits: "5511999999999",
 prefilledMessage:
 "Ola! Quero saber mais sobre pecas sob medida e colecoes da Maison Aurea."
};
