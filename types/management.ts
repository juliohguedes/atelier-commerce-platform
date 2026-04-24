export  type  ManagementReportSector  =  "todos"  |  "admin"  |  "finance"  |  "sales_stock";

export  type  ManagementReportStatus  =
    |  "todos"
    |  "pedido_recebido"
    |  "em_analise"
    |  "aguardando_pagamento"
    |  "pagamento_aprovado"
    |  "em_producao"
    |  "em_separacao"
    |  "pronto_para_envio"
    |  "enviado"
    |  "entregue"
    |  "estoque_baixo"
    |  "indisponivel";

export  interface  ManagementReportSummary  {
    totalOrders:  number;
    totalSales:  number;
    approvedPayments:  number;
    pendingPayments:  number;
    lowStockProducts:  number;
    projectedDeliveries:  number;
}

export  interface  ManagementReportOrderRow  {
    id:  string;
    source:  "custom_order"  |  "store_order";
    reference:  string;
    clientName:  string;
    sector:  "admin"  |  "finance"  |  "sales_stock";
    status:  ManagementReportStatus;
    statusLabel:  string;
    paymentStatusLabel:  string  |  null;
    createdAt:  string;
    totalAmount:  number;
}

export  interface  ManagementReportPaymentRow  {
    id:  string;
    source:  "custom_order"  |  "store_order";
    reference:  string;
    clientName:  string;
    paymentStatusLabel:  string;
    invoiceLabel:  string;
    totalAmount:  number;
    shippingCost:  number;
    createdAt:  string;
}

export  interface  ManagementReportStockRow  {
    productId:  string;
    productName:  string;
    categoryName:  string  |  null;
    collectionName:  string  |  null;
    availableQuantity:  number;
    reservedQuantity:  number;
    variantsCount:  number;
    lowStockVariants:  number;
    isActive:  boolean;
    isAvailable:  boolean;
}

export  interface  ManagementSectorPerformance  {
    sector:  Exclude<ManagementReportSector,  "todos">;
    label:  string;
    totalOrders:  number;
    totalRevenue:  number;
    pendingItems:  number;
    completionRate:  number;
    averageTicket:  number;
}

export  interface  ManagementReportsData  {
    summary:  ManagementReportSummary;
    orders:  ManagementReportOrderRow[];
    payments:  ManagementReportPaymentRow[];
    stock:  ManagementReportStockRow[];
    performance:  ManagementSectorPerformance[];
    strategicInsights:  string[];
}

export  type  InternalCalendarEntryType  =
    |  "evento_interno"
    |  "agendamento_presencial"
    |  "retirada"
    |  "pedido_em_producao"
    |  "entrega_prevista";

export  interface  InternalCalendarMetrics  {
    appointments:  number;
    pickups:  number;
    productionOrders:  number;
    projectedDeliveries:  number;
}

export  interface  InternalCalendarEntry  {
    id:  string;
    type:  InternalCalendarEntryType;
    title:  string;
    description:  string  |  null;
    scheduledAt:  string;
    sectorLabel:  string;
    orderReference:  string  |  null;
    clientName:  string  |  null;
    locationLabel:  string  |  null;
    statusLabel:  string  |  null;
}

export  interface  InternalCalendarData  {
    metrics:  InternalCalendarMetrics;
    entries:  InternalCalendarEntry[];
}
