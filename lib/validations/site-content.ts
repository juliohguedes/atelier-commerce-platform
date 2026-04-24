import  {  z  }  from  "zod";

const  jsonStringField  =  z
    .string()
    .trim()
    .min(2,  "Preencha  o  bloco  em  JSON.")
    .max(30000,  "Conteúdo  acima  do  limite  permitido.");

export  const  homePieceSchema  =  z.object({
    id:  z.string().trim().min(2).max(80),
    name:  z.string().trim().min(2).max(120),
    description:  z.string().trim().min(10).max(600),
    imageUrl:  z.string().trim().url("Informe  uma  URL  de  imagem  valida."),
    category:  z.string().trim().min(2).max(80)
});

export  const  homeCollectionSchema  =  z.object({
    id:  z.string().trim().min(2).max(80),
    title:  z.string().trim().min(2).max(120),
    summary:  z.string().trim().min(10).max(320),
    badge:  z.string().trim().min(2).max(80)
});

export  const  homeTestimonialSchema  =  z.object({
    id:  z.string().trim().min(2).max(80),
    customerName:  z.string().trim().min(2).max(120),
    context:  z.string().trim().min(2).max(120),
    quote:  z.string().trim().min(10).max(500),
    rating:  z.coerce.number().int().min(1).max(5)
});

export  const  homeFaqItemSchema  =  z.object({
    id:  z.string().trim().min(2).max(80),
    question:  z.string().trim().min(5).max(220),
    answer:  z.string().trim().min(10).max(800)
});

export  const  homeLegalSectionSchema  =  z.object({
    id:  z.string().trim().min(2).max(80),
    title:  z.string().trim().min(2).max(120),
    summary:  z.string().trim().min(10).max(500),
    items:  z.array(z.string().trim().min(5).max(320)).min(1).max(10)
});

export  const  homeLocationInfoSchema  =  z.object({
    showroomName:  z.string().trim().min(2).max(120),
    addressLine:  z.string().trim().min(4).max(160),
    cityState:  z.string().trim().min(4).max(160),
    openingHours:  z.string().trim().min(4).max(160),
    mapEmbedUrl:  z.string().trim().url("Informe  uma  URL  valida  para  o  mapa.")
});

export  const  siteAuxiliaryContentSchema  =  z.object({
    galleryPieces:  z.array(homePieceSchema).min(1).max(24),
    featuredCollections:  z.array(homeCollectionSchema).min(1).max(12),
    testimonials:  z.array(homeTestimonialSchema).min(1).max(20),
    faqItems:  z.array(homeFaqItemSchema).min(1).max(20),
    legalSections:  z.array(homeLegalSectionSchema).min(1).max(8),
    locationInfo:  homeLocationInfoSchema
});

export  const  adminAuxiliaryContentFormSchema  =  z.object({
    galleryJson:  jsonStringField,
    collectionsJson:  jsonStringField,
    testimonialsJson:  jsonStringField,
    faqJson:  jsonStringField,
    legalJson:  jsonStringField,
    locationJson:  jsonStringField
});

export  type  SiteAuxiliaryContent  =  z.output<typeof  siteAuxiliaryContentSchema>;
export  type  AdminAuxiliaryContentFormInput  =  z.output<
    typeof  adminAuxiliaryContentFormSchema
>;
