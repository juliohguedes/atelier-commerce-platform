import type {
 StoreCategory,
 StoreCollection,
 StoreProductDetail,
 StoreSortOption
} from "@/types/store";

export const storeSortLabels: Record<StoreSortOption, string> = {
 destaque: "Destaque",
 mais_recentes: "Mais recentes",
 preco_menor: "Preco: menor para maior",
 preco_maior: "Preco: maior para menor",
 mais_vendidos: "Mais vendidos"
};

export const storePaymentMethodOptions = [
 { value: "pix", label: "PIX" },
 { value: "cartao", label: "Cartao" }
] as const;

export const storeOrderPolicyHighlights = [
 "A reserva de estoque acontece somente apos pagamento aprovado.",
 "A baixa de estoque acontece no momento do envio do pedido.",
 "Cancelamentos com retorno ao estoque passam por analise interna."
] as const;

export const storePolicySections = [
 {
 id: "troca-devolucao",
 title: "Troca e devolucao",
 items: [
 "Solicitacoes de troca e devolucao podem ser abertas dentro do prazo legal apos entrega.",
 "A analise considera estado da peca, etiqueta original e historico do pedido.",
 "Aprovacoes geram orientacao de envio e acompanhamento na plataforma."
 ]
 },
 {
 id: "cancelamento-loja",
 title: "Cancelamento da loja",
 items: [
 "Antes do pagamento aprovado, o pedido pode ser cancelado diretamente na plataforma.",
 "Apos pagamento e antes do envio, o cancelamento entra em analise interna.",
 "Apos envio, cancelamentos seguem fluxo de devolucao com validacao da equipe."
 ]
 }
] as const;

export const storeFallbackCategories: StoreCategory[] = [
 {
 id: "fallback-category-alfaiataria",
 slug: "alfaiataria",
 name: "Alfaiataria",
 description: "Modelagens estruturadas para uso social e executivo."
 },
 {
 id: "fallback-category-vestidos",
 slug: "vestidos",
 name: "Vestidos",
 description: "Vestidos autorais para diferentes ocasioes."
 },
 {
 id: "fallback-category-casacos-jaquetas",
 slug: "casacos-jaquetas",
 name: "Casacos e Jaquetas",
 description: "Pecas para composicoes premium em dias amenos."
 },
 {
 id: "fallback-category-conjuntos",
 slug: "conjuntos",
 name: "Conjuntos",
 description: "Combinacoes coordenadas com identidade da marca."
 },
 {
 id: "fallback-category-camisas-blusas",
 slug: "camisas-blusas",
 name: "Camisas e Blusas",
 description: "Base elegante para guarda-roupa sofisticado."
 },
 {
 id: "fallback-category-saias-shorts",
 slug: "saias-shorts",
 name: "Saias e Shorts",
 description: "Pecas versateis para looks urbanos e refinados."
 }
];

export const storeFallbackCollections: StoreCollection[] = [
 {
 id: "fallback-collection-noir-signature",
 slug: "noir-signature",
 name: "Noir Signature",
 themeStyle: "Minimalismo noturno",
 description: "Linhas limpas em preto profundo e detalhes foscos.",
 isFeatured: true
 },
 {
 id: "fallback-collection-atelier-essence",
 slug: "atelier-essence",
 name: "Atelier Essence",
 themeStyle: "Elegancia contemporanea",
 description: "Texturas premium para uso diario com assinatura autoral.",
 isFeatured: true
 },
 {
 id: "fallback-collection-urban-tailoring",
 slug: "urban-tailoring",
 name: "Urban Tailoring",
 themeStyle: "Alfaiataria urbana",
 description: "Cortes versateis para cidade e eventos.",
 isFeatured: false
 },
 {
 id: "fallback-collection-gala-heritage",
 slug: "gala-heritage",
 name: "Gala Heritage",
 themeStyle: "Festa e ocasiao especial",
 description: "Pecas de impacto com acabamento refinado.",
 isFeatured: false
 }
];

export const storeFallbackProductDetails: StoreProductDetail[] = [
 {
 id: "fallback-product-blazer-aurora",
 slug: "blazer-aurora",
 skuBase: "BLZ-AUR",
 name: "Blazer Aurora",
 shortDescription: "Blazer estruturado com acabamento premium em preto fosco.",
 description:
 "Blazer de alfaiataria com corte acinturado, lapela marcada e forro suave para uso prolongado.",
 characteristics: [
 "Forro interno premium",
 "Fechamento frontal com botoes",
 "Modelagem estruturada"
 ],
 categorySlug: "alfaiataria",
 categoryName: "Alfaiataria",
 collectionSlug: "noir-signature",
 collectionName: "Noir Signature",
 themeStyle: "Minimalismo noturno",
 basePrice: 459,
 compareAtPrice: 519,
 isFeatured: true,
 isNewArrival: true,
 isAvailable: true,
 totalAvailableUnits: 17,
 images: [
 {
 id: "fallback-image-blazer-1",
 imageUrl:
 "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
 altText: "Blazer Aurora frontal",
 displayOrder: 1
 },
 {
 id: "fallback-image-blazer-2",
 imageUrl:
 "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1200&q=80",
 altText: "Blazer Aurora detalhe",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-blazer-p",
 sku: "BLZ-AUR-PRE-P",
 sizeLabel: "P",
 colorLabel: "Preto Fosco",
 variationLabel: "P / Preto Fosco",
 stockQuantity: 8,
 reservedQuantity: 0,
 availableQuantity: 8,
 price: 459,
 isActive: true
 },
 {
 id: "fallback-variant-blazer-m",
 sku: "BLZ-AUR-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto Fosco",
 variationLabel: "M / Preto Fosco",
 stockQuantity: 6,
 reservedQuantity: 0,
 availableQuantity: 6,
 price: 459,
 isActive: true
 },
 {
 id: "fallback-variant-blazer-g",
 sku: "BLZ-AUR-PRE-G",
 sizeLabel: "G",
 colorLabel: "Preto Fosco",
 variationLabel: "G / Preto Fosco",
 stockQuantity: 3,
 reservedQuantity: 0,
 availableQuantity: 3,
 price: 459,
 isActive: true
 }
 ],
 related: [
 {
 id: "fallback-product-camisa-essence-seda",
 slug: "camisa-essence-seda",
 name: "Camisa Essence Seda",
 imageUrl:
 "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
 minPrice: 219,
 isAvailable: true,
 relationType: "related"
 },
 {
 id: "fallback-product-saia-midi-dourada",
 slug: "saia-midi-dourada",
 name: "Saia Midi Dourada",
 imageUrl:
 "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
 minPrice: 199,
 isAvailable: true,
 relationType: "same_collection"
 }
 ]
 },
 {
 id: "fallback-product-vestido-imperial",
 slug: "vestido-imperial",
 skuBase: "VTD-IMP",
 name: "Vestido Imperial Slim",
 shortDescription: "Vestido midi em crepe com silhueta elegante.",
 description:
 "Vestido com decote suave, cintura marcada e caimento fluido para eventos e jantares especiais.",
 characteristics: ["Crepe premium", "Caimento midi", "Ajuste posterior discreto"],
 categorySlug: "vestidos",
 categoryName: "Vestidos",
 collectionSlug: "gala-heritage",
 collectionName: "Gala Heritage",
 themeStyle: "Festa e ocasiao especial",
 basePrice: 389,
 compareAtPrice: null,
 isFeatured: false,
 isNewArrival: true,
 isAvailable: true,
 totalAvailableUnits: 11,
 images: [
 {
 id: "fallback-image-vestido-1",
 imageUrl:
 "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
 altText: "Vestido Imperial em estudio",
 displayOrder: 1
 },
 {
 id: "fallback-image-vestido-2",
 imageUrl:
 "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
 altText: "Vestido Imperial detalhe",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-vestido-p",
 sku: "VTD-IMP-BOR-P",
 sizeLabel: "P",
 colorLabel: "Bordo",
 variationLabel: "P / Bordo",
 stockQuantity: 5,
 reservedQuantity: 0,
 availableQuantity: 5,
 price: 389,
 isActive: true
 },
 {
 id: "fallback-variant-vestido-m",
 sku: "VTD-IMP-BOR-M",
 sizeLabel: "M",
 colorLabel: "Bordo",
 variationLabel: "M / Bordo",
 stockQuantity: 4,
 reservedQuantity: 0,
 availableQuantity: 4,
 price: 389,
 isActive: true
 },
 {
 id: "fallback-variant-vestido-m-preto",
 sku: "VTD-IMP-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto",
 variationLabel: "M / Preto",
 stockQuantity: 2,
 reservedQuantity: 0,
 availableQuantity: 2,
 price: 399,
 isActive: true
 }
 ],
 related: [
 {
 id: "fallback-product-jaqueta-noir-biker",
 slug: "jaqueta-noir-biker",
 name: "Jaqueta Noir Biker",
 imageUrl:
 "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
 minPrice: 329,
 isAvailable: true,
 relationType: "related"
 }
 ]
 },
 {
 id: "fallback-product-jaqueta-noir-biker",
 slug: "jaqueta-noir-biker",
 skuBase: "JQT-NBK",
 name: "Jaqueta Noir Biker",
 shortDescription: "Jaqueta com recortes modernos e elegancia urbana.",
 description:
 "Peca versatil para meia estacao, com ziper frontal e estrutura leve para composicoes premium.",
 characteristics: ["Ziper frontal", "Recortes ergonomicos", "Uso urbano premium"],
 categorySlug: "casacos-jaquetas",
 categoryName: "Casacos e Jaquetas",
 collectionSlug: "urban-tailoring",
 collectionName: "Urban Tailoring",
 themeStyle: "Alfaiataria urbana",
 basePrice: 329,
 compareAtPrice: null,
 isFeatured: false,
 isNewArrival: false,
 isAvailable: true,
 totalAvailableUnits: 15,
 images: [
 {
 id: "fallback-image-jaqueta-1",
 imageUrl:
 "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
 altText: "Jaqueta Noir Biker look completo",
 displayOrder: 1
 },
 {
 id: "fallback-image-jaqueta-2",
 imageUrl:
 "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=80",
 altText: "Jaqueta Noir Biker acabamento",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-jaqueta-p",
 sku: "JQT-NBK-PRE-P",
 sizeLabel: "P",
 colorLabel: "Preto",
 variationLabel: "P / Preto",
 stockQuantity: 7,
 reservedQuantity: 0,
 availableQuantity: 7,
 price: 329,
 isActive: true
 },
 {
 id: "fallback-variant-jaqueta-m",
 sku: "JQT-NBK-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto",
 variationLabel: "M / Preto",
 stockQuantity: 5,
 reservedQuantity: 0,
 availableQuantity: 5,
 price: 329,
 isActive: true
 },
 {
 id: "fallback-variant-jaqueta-verde-m",
 sku: "JQT-NBK-VER-M",
 sizeLabel: "M",
 colorLabel: "Verde Militar",
 variationLabel: "M / Verde Militar",
 stockQuantity: 3,
 reservedQuantity: 0,
 availableQuantity: 3,
 price: 329,
 isActive: true
 }
 ],
 related: []
 },
 {
 id: "fallback-product-conjunto-lumiere",
 slug: "conjunto-lumiere",
 skuBase: "CNJ-LUM",
 name: "Conjunto Lumiere",
 shortDescription: "Conjunto coordenado com blazer leve e calca reta.",
 description:
 "Conjunto pensado para praticidade sem abrir mao de acabamento sofisticado e conforto.",
 characteristics: ["Blazer leve", "Calca reta", "Composicao coordenada"],
 categorySlug: "conjuntos",
 categoryName: "Conjuntos",
 collectionSlug: "atelier-essence",
 collectionName: "Atelier Essence",
 themeStyle: "Elegancia contemporanea",
 basePrice: 349,
 compareAtPrice: 399,
 isFeatured: true,
 isNewArrival: false,
 isAvailable: true,
 totalAvailableUnits: 12,
 images: [
 {
 id: "fallback-image-conjunto-1",
 imageUrl:
 "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8ac?auto=format&fit=crop&w=1200&q=80",
 altText: "Conjunto Lumiere versao areia",
 displayOrder: 1
 },
 {
 id: "fallback-image-conjunto-2",
 imageUrl:
 "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
 altText: "Conjunto Lumiere no corpo",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-conjunto-p",
 sku: "CNJ-LUM-ARE-P",
 sizeLabel: "P",
 colorLabel: "Areia",
 variationLabel: "P / Areia",
 stockQuantity: 5,
 reservedQuantity: 0,
 availableQuantity: 5,
 price: 349,
 isActive: true
 },
 {
 id: "fallback-variant-conjunto-m",
 sku: "CNJ-LUM-ARE-M",
 sizeLabel: "M",
 colorLabel: "Areia",
 variationLabel: "M / Areia",
 stockQuantity: 5,
 reservedQuantity: 0,
 availableQuantity: 5,
 price: 349,
 isActive: true
 },
 {
 id: "fallback-variant-conjunto-preto-m",
 sku: "CNJ-LUM-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto",
 variationLabel: "M / Preto",
 stockQuantity: 2,
 reservedQuantity: 0,
 availableQuantity: 2,
 price: 349,
 isActive: true
 }
 ],
 related: [
 {
 id: "fallback-product-camisa-essence-seda",
 slug: "camisa-essence-seda",
 name: "Camisa Essence Seda",
 imageUrl:
 "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
 minPrice: 219,
 isAvailable: true,
 relationType: "same_collection"
 }
 ]
 },
 {
 id: "fallback-product-camisa-essence-seda",
 slug: "camisa-essence-seda",
 skuBase: "CMS-ESD",
 name: "Camisa Essence Seda",
 shortDescription: "Camisa premium com toque acetinado e fechamento delicado.",
 description:
 "Camisa para composicoes formais e casuais sofisticadas, com costura limpa e tecido de alta qualidade.",
 characteristics: ["Toque acetinado", "Botoes personalizados", "Modelagem elegante"],
 categorySlug: "camisas-blusas",
 categoryName: "Camisas e Blusas",
 collectionSlug: "atelier-essence",
 collectionName: "Atelier Essence",
 themeStyle: "Elegancia contemporanea",
 basePrice: 219,
 compareAtPrice: null,
 isFeatured: false,
 isNewArrival: true,
 isAvailable: true,
 totalAvailableUnits: 22,
 images: [
 {
 id: "fallback-image-camisa-1",
 imageUrl:
 "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
 altText: "Camisa Essence Seda frontal",
 displayOrder: 1
 },
 {
 id: "fallback-image-camisa-2",
 imageUrl:
 "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80",
 altText: "Camisa Essence Seda gola e botoes",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-camisa-off-p",
 sku: "CMS-ESD-OFF-P",
 sizeLabel: "P",
 colorLabel: "Off-white",
 variationLabel: "P / Off-white",
 stockQuantity: 10,
 reservedQuantity: 0,
 availableQuantity: 10,
 price: 219,
 isActive: true
 },
 {
 id: "fallback-variant-camisa-off-m",
 sku: "CMS-ESD-OFF-M",
 sizeLabel: "M",
 colorLabel: "Off-white",
 variationLabel: "M / Off-white",
 stockQuantity: 8,
 reservedQuantity: 0,
 availableQuantity: 8,
 price: 219,
 isActive: true
 },
 {
 id: "fallback-variant-camisa-pre-m",
 sku: "CMS-ESD-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto",
 variationLabel: "M / Preto",
 stockQuantity: 4,
 reservedQuantity: 0,
 availableQuantity: 4,
 price: 219,
 isActive: true
 }
 ],
 related: []
 },
 {
 id: "fallback-product-saia-midi-dourada",
 slug: "saia-midi-dourada",
 skuBase: "SIA-MDG",
 name: "Saia Midi Dourada",
 shortDescription: "Saia midi com brilho discreto e cintura alta.",
 description:
 "Saia com textura refinada para producoes noturnas ou composicoes autorais durante o dia.",
 characteristics: ["Cintura alta", "Comprimento midi", "Detalhes em dourado fosco"],
 categorySlug: "saias-shorts",
 categoryName: "Saias e Shorts",
 collectionSlug: "noir-signature",
 collectionName: "Noir Signature",
 themeStyle: "Minimalismo noturno",
 basePrice: 199,
 compareAtPrice: null,
 isFeatured: false,
 isNewArrival: false,
 isAvailable: true,
 totalAvailableUnits: 13,
 images: [
 {
 id: "fallback-image-saia-1",
 imageUrl:
 "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
 altText: "Saia Midi Dourada look completo",
 displayOrder: 1
 },
 {
 id: "fallback-image-saia-2",
 imageUrl:
 "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
 altText: "Saia Midi Dourada detalhe",
 displayOrder: 2
 }
 ],
 variants: [
 {
 id: "fallback-variant-saia-dourada-p",
 sku: "SIA-MDG-DOR-P",
 sizeLabel: "P",
 colorLabel: "Dourado Fosco",
 variationLabel: "P / Dourado Fosco",
 stockQuantity: 4,
 reservedQuantity: 0,
 availableQuantity: 4,
 price: 199,
 isActive: true
 },
 {
 id: "fallback-variant-saia-dourada-m",
 sku: "SIA-MDG-DOR-M",
 sizeLabel: "M",
 colorLabel: "Dourado Fosco",
 variationLabel: "M / Dourado Fosco",
 stockQuantity: 3,
 reservedQuantity: 0,
 availableQuantity: 3,
 price: 199,
 isActive: true
 },
 {
 id: "fallback-variant-saia-preta-m",
 sku: "SIA-MDG-PRE-M",
 sizeLabel: "M",
 colorLabel: "Preto",
 variationLabel: "M / Preto",
 stockQuantity: 6,
 reservedQuantity: 0,
 availableQuantity: 6,
 price: 199,
 isActive: true
 }
 ],
 related: []
 }
];
