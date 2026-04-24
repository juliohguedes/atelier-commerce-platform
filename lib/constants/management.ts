import  type  {
    InternalCalendarEntryType,
    ManagementReportSector,
    ManagementReportStatus
}  from  "@/types/management";

export  const  managementSectorLabels:  Record<ManagementReportSector,  string>  =  {
    todos:  "Todos  os  setores",
    admin:  "Admin",
    finance:  "Financeiro",
    sales_stock:  "Vendas  e  estoque"
};

export  const  managementStatusLabels:  Record<ManagementReportStatus,  string>  =  {
    todos:  "Todos  os  status",
    pedido_recebido:  "Pedido  recebido",
    em_analise:  "Em  análise",
    aguardando_pagamento:  "Aguardando  pagamento",
    pagamento_aprovado:  "Pagamento  aprovado",
    em_producao:  "Em  produção",
    em_separacao:  "Em  separação",
    pronto_para_envio:  "Pronto  para  envio",
    enviado:  "Enviado",
    entregue:  "Entregue",
    estoque_baixo:  "Estoque  baixo",
    indisponivel:  "Indisponivel"
};

export  const  internalCalendarTypeLabels:  Record<InternalCalendarEntryType,  string>  =  {
    evento_interno:  "Evento  interno",
    agendamento_presencial:  "Agendamento  presencial",
    retirada:  "Retirada",
    pedido_em_producao:  "Pedido  em  produção",
    entrega_prevista:  "Entrega  prevista"
};
