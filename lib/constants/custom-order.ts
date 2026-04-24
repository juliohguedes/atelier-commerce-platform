export  const  customOrderAudienceOptions  =  [
    {
        value:  "feminino",
        label:  "Feminino"
    },
    {
        value:  "masculino",
        label:  "Masculino"
    }
]  as  const;

export  const  customOrderProductionModeOptions  =  [
    {
        value:  "larga_escala",
        label:  "Feita  em  larga  escala"
    },
    {
        value:  "sob_medida",
        label:  "Sob  medida"
    }
]  as  const;

export  const  customOrderSizeOptions  =  [
    "PP",
    "P",
    "M",
    "G",
    "GG",
    "OUTROS"
]  as  const;

export  const  customOrderModelingOptions  =  [
    {
        value:  "justa",
        label:  "Justa"
    },
    {
        value:  "padrao",
        label:  "Padrao"
    },
    {
        value:  "solta",
        label:  "Solta"
    },
    {
        value:  "oversized",
        label:  "Oversized"
    }
]  as  const;

export  const  customOrderPieceOptions  =  [
    {
        value:  "blazer",
        label:  "Blazer"
    },
    {
        value:  "blusa",
        label:  "Blusa"
    },
    {
        value:  "calca",
        label:  "Calca"
    },
    {
        value:  "camisa",
        label:  "Camisa"
    },
    {
        value:  "casaco",
        label:  "Casaco"
    },
    {
        value:  "colete",
        label:  "Colete"
    },
    {
        value:  "conjunto",
        label:  "Conjunto"
    },
    {
        value:  "corset",
        label:  "Corset"
    },
    {
        value:  "jaqueta",
        label:  "Jaqueta"
    },
    {
        value:  "macacao",
        label:  "Macacão"
    },
    {
        value:  "saia",
        label:  "Saia"
    },
    {
        value:  "short",
        label:  "Short"
    },
    {
        value:  "sobretudo",
        label:  "Sobretudo"
    },
    {
        value:  "terno",
        label:  "Terno"
    },
    {
        value:  "vestido",
        label:  "Vestido"
    },
    {
        value:  "outros",
        label:  "Outros"
    }
]  as  const;

export  const  customOrderPieceLengthOptions:  Record<string,  string[]>  =  {
    blazer:  ["Cropped",  "Classico",  "Alongado"],
    blusa:  ["Cropped",  "Padrao",  "Alongada"],
    calca:  ["Curta",  "Tradicional",  "Longa"],
    camisa:  ["Curta",  "Padrao",  "Longline"],
    casaco:  ["3/4",  "Classico",  "Longo"],
    colete:  ["Curto",  "Padrao",  "Alongado"],
    conjunto:  ["Curto",  "Padrao",  "Longo"],
    corset:  ["Curto",  "Padrao",  "Alongado"],
    jaqueta:  ["Cropped",  "Padrao",  "Longa"],
    macacao:  ["Pantacourt",  "Padrao",  "Longo"],
    outros:  ["Definir  no  briefing"],
    saia:  ["Mini",  "Midi",  "Longa"],
    short:  ["Curto",  "Padrao",  "Bermuda"],
    sobretudo:  ["Curto",  "Padrao",  "Longo"],
    terno:  ["Curto",  "Padrao",  "Alongado"],
    vestido:  ["Mini",  "Midi",  "Longo"]
};

export  const  customOrderLargeScaleLengthLabels:  Record<string,  string>  =  {
    blazer:  "Comprimento  do  blazer",
    blusa:  "Comprimento  da  blusa",
    calca:  "Comprimento  da  calca",
    camisa:  "Comprimento  da  camisa",
    casaco:  "Comprimento  do  casaco",
    colete:  "Comprimento  do  colete",
    conjunto:  "Comprimento  do  conjunto",
    corset:  "Comprimento  do  corset",
    jaqueta:  "Comprimento  da  jaqueta",
    macacao:  "Comprimento  do  macacão",
    outros:  "Comprimento  desejado",
    saia:  "Comprimento  da  saia",
    short:  "Comprimento  do  short",
    sobretudo:  "Comprimento  do  sobretudo",
    terno:  "Comprimento  do  terno",
    vestido:  "Comprimento  do  vestido"
};

export  const  customOrderMeasurementFields  =  {
    feminino:  [
        {  key:  "pescoco",  label:  "Pescoco  (cm)"  },
        {  key:  "braco",  label:  "Braco  (cm)"  },
        {  key:  "ombro",  label:  "Ombro  (cm)"  },
        {  key:  "busto",  label:  "Busto  (cm)"  },
        {  key:  "cintura",  label:  "Cintura  (cm)"  },
        {  key:  "quadril",  label:  "Quadril  (cm)"  },
        {  key:  "coxa",  label:  "Coxa  (cm)"  },
        {  key:  "comprimento_manga",  label:  "Comprimento  da  manga  (cm)"  },
        {  key:  "comprimento_pernas",  label:  "Comprimento  das  pernas  (cm)"  }
    ],
    masculino:  [
        {  key:  "pescoco",  label:  "Pescoco  (cm)"  },
        {  key:  "braco",  label:  "Braco  (cm)"  },
        {  key:  "ombro",  label:  "Ombro  (cm)"  },
        {  key:  "busto",  label:  "Busto  (cm)"  },
        {  key:  "cintura",  label:  "Cintura  (cm)"  },
        {  key:  "quadril",  label:  "Quadril  (cm)"  },
        {  key:  "coxa",  label:  "Coxa  (cm)"  },
        {  key:  "comprimento_manga",  label:  "Comprimento  da  manga  (cm)"  },
        {  key:  "comprimento_pernas",  label:  "Comprimento  das  pernas  (cm)"  }
    ]
}  as  const;

export  const  customOrderRequestTypeOptions  =  [
    {
        value:  "referencia_imagem",
        label:  "Enviar  imagem  de  referência"
    },
    {
        value:  "criacao_exclusiva",
        label:  "Pedir  criação  exclusiva"
    }
]  as  const;

export  const  customOrderFabricOptions  =  [
    {  value:  "algodao",  label:  "Algodao",  tier:  "simples"  },
    {  value:  "alfaiataria",  label:  "Alfaiataria",  tier:  "intermediario"  },
    {  value:  "cetim",  label:  "Cetim",  tier:  "intermediario"  },
    {  value:  "chiffon",  label:  "Chiffon",  tier:  "nobre"  },
    {  value:  "couro_sintetico",  label:  "Couro  sintetico",  tier:  "intermediario"  },
    {  value:  "crepe",  label:  "Crepe",  tier:  "intermediario"  },
    {  value:  "jeans",  label:  "Jeans",  tier:  "simples"  },
    {  value:  "laise",  label:  "Laise",  tier:  "intermediario"  },
    {  value:  "linho",  label:  "Linho",  tier:  "nobre"  },
    {  value:  "malha",  label:  "Malha",  tier:  "simples"  },
    {  value:  "moletom",  label:  "Moletom",  tier:  "simples"  },
    {  value:  "organza",  label:  "Organza",  tier:  "nobre"  },
    {  value:  "renda",  label:  "Renda",  tier:  "nobre"  },
    {  value:  "seda",  label:  "Seda",  tier:  "nobre"  },
    {  value:  "tule",  label:  "Tule",  tier:  "intermediario"  },
    {  value:  "veludo",  label:  "Veludo",  tier:  "nobre"  },
    {  value:  "viscose",  label:  "Viscose",  tier:  "simples"  },
    {  value:  "outros",  label:  "Outros",  tier:  "outros"  }
]  as  const;

export  const  customOrderComplexityOptions  =  [
    {  value:  "basica",  label:  "Básica",  percentage:  0  },
    {  value:  "intermediaria",  label:  "Intermediária",  percentage:  0.12  },
    {  value:  "avancada",  label:  "Avançada",  percentage:  0.25  },
    {  value:  "premium",  label:  "Premium",  percentage:  0.4  }
]  as  const;

export  const  customOrderFabricTierAdjustments  =  [
    {  value:  "simples",  label:  "Simples",  percentage:  0  },
    {  value:  "intermediario",  label:  "Intermediário",  percentage:  0.15  },
    {  value:  "nobre",  label:  "Nobre",  percentage:  0.3  },
    {  value:  "outros",  label:  "Outros  decidido  depois  pela  equipe",  percentage:  0  }
]  as  const;

export  const  customOrderNotionOptions  =  [
    {  value:  "botoes",  label:  "Botoes",  extraCost:  12  },
    {  value:  "ziper_comum",  label:  "Ziper  comum",  extraCost:  18  },
    {  value:  "ziper_invisivel",  label:  "Ziper  invisivel",  extraCost:  22  },
    {  value:  "ziper_tratorado",  label:  "Ziper  tratorado",  extraCost:  28  },
    {  value:  "colchetes",  label:  "Colchetes",  extraCost:  10  },
    {  value:  "elastico",  label:  "Elastico",  extraCost:  12  },
    {  value:  "entretela",  label:  "Entretela",  extraCost:  15  },
    {  value:  "forro",  label:  "Forro",  extraCost:  28  },
    {  value:  "renda",  label:  "Renda",  extraCost:  35  },
    {  value:  "bojo",  label:  "Bojo",  extraCost:  20  },
    {  value:  "ombreira",  label:  "Ombreira",  extraCost:  18  },
    {  value:  "amarracao",  label:  "Amarracao",  extraCost:  12  },
    {  value:  "barbatanas",  label:  "Barbatanas",  extraCost:  40  },
    {  value:  "vies_acabamento",  label:  "Vies/acabamento",  extraCost:  10  }
]  as  const;

export  const  customOrderSuggestedNotionsByPiece:  Record<string,  string[]>  =  {
    blazer:  ["botoes",  "entretela",  "forro",  "ombreira"],
    blusa:  ["vies_acabamento",  "ziper_invisivel"],
    calca:  ["ziper_comum",  "botoes",  "entretela"],
    camisa:  ["botoes",  "entretela",  "vies_acabamento"],
    casaco:  ["forro",  "botoes",  "entretela",  "ziper_tratorado"],
    colete:  ["forro",  "botoes",  "entretela"],
    conjunto:  ["ziper_invisivel",  "forro",  "entretela"],
    corset:  ["barbatanas",  "bojo",  "amarracao",  "forro"],
    jaqueta:  ["ziper_tratorado",  "forro",  "entretela"],
    macacao:  ["ziper_invisivel",  "forro",  "vies_acabamento"],
    outros:  [],
    saia:  ["ziper_invisivel",  "forro",  "vies_acabamento"],
    short:  ["ziper_comum",  "elastico"],
    sobretudo:  ["forro",  "entretela",  "botoes",  "ombreira"],
    terno:  ["forro",  "entretela",  "botoes",  "ombreira"],
    vestido:  ["ziper_invisivel",  "forro",  "renda"]
};

export  const  customOrderBasePriceByPiece:  Record<string,  number>  =  {
    blazer:  329,
    blusa:  149,
    calca:  189,
    camisa:  169,
    casaco:  349,
    colete:  179,
    conjunto:  289,
    corset:  329,
    jaqueta:  299,
    macacao:  259,
    outros:  199,
    saia:  159,
    short:  149,
    sobretudo:  399,
    terno:  449,
    vestido:  249
};

export  const  customOrderEstimateDisclaimer  =
    "O  valor  apresentado  \u00e9  uma  estimativa  inicial,  calculada  com  base  nas  informa\u00e7\u00f5es  fornecidas  no  pedido.  O  or\u00e7amento  final  poder\u00e1  ser  ajustado  ap\u00f3s  a  an\u00e1lise  da  equipe  respons\u00e1vel,  considerando  modelagem,  materiais,  acabamentos  e  demais  detalhes  t\u00e9cnicos  da  pe\u00e7a.";

export  const  customOrderInitialStatusFlow  =  [
    "pedido_recebido",
    "em_analise_inicial",
    "em_avaliacao_pela_equipe",
    "aguardando_contato_via_whatsapp",
    "aguardando_confirmacao_da_cliente",
    "pedido_aprovado_para_orcamento_final",
    "pedido_encerrado"
]  as  const;

export  const  customOrderStatusLabels:  Record<string,  string>  =  {
    draft:  "Rascunho",
    pedido_recebido:  "Pedido  recebido",
    em_analise_inicial:  "Em  análise  inicial",
    em_avaliacao_pela_equipe:  "Em  avaliação  pela  equipe",
    aguardando_contato_via_whatsapp:  "Aguardando  contato  via  WhatsApp",
    aguardando_confirmacao_da_cliente:  "Aguardando  confirmação  da  cliente",
    pedido_aprovado_para_orcamento_final:  "Pedido  aprovado  para  orçamento  final",
    pedido_encerrado:  "Pedido  encerrado",
    cancelado_pela_cliente:  "Cancelado  pela  cliente",
    cancelado_interno:  "Cancelado  internamente"
};

export  const  customOrderCancellationPolicyText  =  {
    beforeAnalysis:
        "Antes  da  análise:  cancelamento  direto  na  plataforma.",
    afterAnalysisBeforePayment:
        "Depois  da  análise  e  antes  do  pagamento:  cancelamento  direto  na  plataforma.",
    afterPayment:
        "Depois  do  pagamento:  cancelamento  somente  por  solicitação  e  análise  interna."
}  as  const;

export  const  customOrderAllowedAttachmentMimeTypes  =  [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
]  as  const;

export  const  customOrderAttachmentsBucket  =  "custom-orders";

export  const  customOrderMaxAttachments  =  10;

export  const  customOrderMaxAttachmentSizeBytes  =  15  *  1024  *  1024;

