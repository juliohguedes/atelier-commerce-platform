import  {
    customOrderInitialStatusFlow,
    customOrderStatusLabels
}  from  "@/lib/constants/custom-order";
import  type  {  CustomOrderStatus  }  from  "@/types/custom-order";

export  const  cancellableStatusesBeforePayment:  CustomOrderStatus[]  =  [
    "draft",
    "pedido_recebido",
    "em_analise_inicial",
    "em_avaliacao_pela_equipe",
    "aguardando_contato_via_whatsapp",
    "aguardando_confirmacao_da_cliente",
    "pedido_aprovado_para_orcamento_final"
];

export  function  getCustomOrderStatusLabel(status:  CustomOrderStatus):  string  {
    return  customOrderStatusLabels[status]  ??  status;
}

export  function  getInitialStatusTimeline():  readonly  string[]  {
    return  customOrderInitialStatusFlow;
}
