export  const  customOrderInternalStatusOptions  =  [
    "pedido_recebido",
    "em_analise_inicial",
    "em_avaliacao_pela_equipe",
    "aguardando_contato_via_whatsapp",
    "aguardando_confirmacao_da_cliente",
    "pedido_aprovado_para_orcamento_final",
    "pedido_encerrado",
    "cancelado_pela_cliente",
    "cancelado_interno"
]  as  const;

export  const  storeOrderInternalStatusOptions  =  [
    "pedido_recebido",
    "pagamento_aprovado",
    "em_separacao",
    "pronto_para_envio",
    "enviado",
    "entregue",
    "cancelado"
]  as  const;

export  const  paymentStatusOptions  =  [
    "pending",
    "awaiting_payment",
    "approved",
    "failed",
    "cancelled",
    "refunded"
]  as  const;

export  const  adminDashboardBlocks  =  [
    {  id:  "novos",  title:  "Pedidos  novos"  },
    {  id:  "em_analise",  title:  "Pedidos  em  análise"  },
    {  id:  "aguardando_pagamento",  title:  "Aguardando  pagamento"  },
    {  id:  "em_producao",  title:  "Em  produção"  },
    {  id:  "pronto_para_envio",  title:  "Pronto  para  envio"  },
    {  id:  "enviados",  title:  "Enviados"  },
    {  id:  "entregues",  title:  "Entregues"  },
    {  id:  "vendas_mes",  title:  "Vendas  do  mes"  }
]  as  const;

export  const  financeDashboardBlocks  =  [
    {  id:  "aguardando_orcamento",  title:  "Aguardando  orçamento  final"  },
    {  id:  "aguardando_pagamento",  title:  "Aguardando  pagamento"  },
    {  id:  "pagamentos_aprovados",  title:  "Pagamentos  aprovados"  },
    {  id:  "frete_pendente",  title:  "Pedidos  com  frete  pendente"  },
    {  id:  "nota_fiscal_pendente",  title:  "Nota  fiscal  pendente"  },
    {  id:  "notas_emitidas",  title:  "Notas  emitidas"  }
]  as  const;

export  const  salesStockDashboardBlocks  =  [
    {  id:  "produtos_ativos",  title:  "Produtos  ativos"  },
    {  id:  "estoque_baixo",  title:  "Estoque  baixo"  },
    {  id:  "indisponiveis",  title:  "Indisponiveis"  },
    {  id:  "pedidos_em_separacao",  title:  "Pedidos  em  separação"  },
    {  id:  "prontos_para_envio",  title:  "Prontos  para  envio"  },
    {  id:  "enviados_hoje",  title:  "Enviados  hoje"  }
]  as  const;

export  const  customOrderStatusLabels:  Record<string,  string>  =  {
    draft:  "Rascunho",
    pedido_recebido:  "Pedido  recebido",
    em_analise_inicial:  "Em  análise  inicial",
    em_avaliacao_pela_equipe:  "Em  avaliação  pela  equipe",
    aguardando_contato_via_whatsapp:  "Aguardando  contato  via  WhatsApp",
    aguardando_confirmacao_da_cliente:  "Aguardando  confirmação  da  cliente",
    pedido_aprovado_para_orcamento_final:  "Aprovado  para  orçamento  final",
    pedido_encerrado:  "Pedido  encerrado",
    cancelado_pela_cliente:  "Cancelado  pela  cliente",
    cancelado_interno:  "Cancelado  internamente"
};

export  const  storeOrderStatusLabels:  Record<string,  string>  =  {
    pedido_recebido:  "Pedido  recebido",
    pagamento_aprovado:  "Pagamento  aprovado",
    em_separacao:  "Em  separação",
    pronto_para_envio:  "Pronto  para  envio",
    enviado:  "Enviado",
    entregue:  "Entregue",
    cancelado:  "Cancelado"
};

export  const  paymentStatusLabels:  Record<string,  string>  =  {
    pending:  "Pendente",
    awaiting_payment:  "Aguardando  pagamento",
    approved:  "Aprovado",
    failed:  "Falhou",
    cancelled:  "Cancelado",
    refunded:  "Reembolsado"
};

export  const  financialStatusLabels  =  {
    pending_quote:  "Aguardando  orçamento  final",
    pending_payment:  "Aguardando  pagamento",
    payment_approved:  "Pagamento  aprovado",
    pending_shipping:  "Frete  pendente",
    pending_invoice:  "Nota  fiscal  pendente",
    invoice_issued:  "Nota  emitida"
}  as  const;

export  const  financeUnlockAuditEventName  =  "finance.unlock_and_update";

export  const  adminTechnicalAuditEventName  =  "admin.technical_publish";
