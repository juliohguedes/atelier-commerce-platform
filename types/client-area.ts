import  type  {  CustomOrderStatus  }  from  "@/types/custom-order";

export  type  ClientPaymentMethod  =  "pix"  |  "cartao";
export  type  ClientPaymentStatus  =
    |  "pending"
    |  "awaiting_payment"
    |  "approved"
    |  "failed"
    |  "cancelled"
    |  "refunded";

export  type  ClientDeliveryMode  =  "entrega"  |  "retirada";

export  type  ClientAppointmentType  =
    |  "tirar_medidas"
    |  "alinhamento_pedido"
    |  "retirada";
export  type  ClientAppointmentMode  =  "online"  |  "presencial";
export  type  ClientAppointmentStatus  =
    |  "solicitado"
    |  "confirmado"
    |  "concluido"
    |  "cancelado";

export  type  ClientStoreOrderStatus  =
    |  "pedido_recebido"
    |  "pagamento_aprovado"
    |  "em_separacao"
    |  "pronto_para_envio"
    |  "enviado"
    |  "entregue"
    |  "cancelado";

export  type  ClientReviewTargetType  =  "custom_order"  |  "store_order";

export  interface  ClientCustomOrderAttachment  {
    id:  string;
    fileName:  string;
    mimeType:  string;
    storagePath:  string;
    createdAt:  string;
}

export  interface  ClientCustomOrderDesignOption  {
    id:  string;
    optionCode:  string;
    title:  string;
    previewImageUrl:  string  |  null;
    referencePdfUrl:  string  |  null;
    teamNote:  string  |  null;
    createdAt:  string;
}

export  interface  ClientCustomOrderFinalQuote  {
    finalAmount:  number;
    quoteSummary:  string;
    paymentStatus:  ClientPaymentStatus;
    paymentMethod:  ClientPaymentMethod  |  null;
    approvedByClientAt:  string  |  null;
    paymentConfirmedAt:  string  |  null;
    productionStartedAt:  string  |  null;
    readyToShipAt:  string  |  null;
    shippedAt:  string  |  null;
    deliveredAt:  string  |  null;
}

export  interface  ClientCustomOrderFulfillment  {
    deliveryMode:  ClientDeliveryMode  |  null;
    trackingCode:  string  |  null;
    trackingLink:  string  |  null;
    pickupAddress:  string  |  null;
    pickupInstructions:  string  |  null;
}

export  interface  ClientCustomOrderSummary  {
    publicId:  string;
    protocolCode:  string;
    status:  CustomOrderStatus;
    statusLabel:  string;
    pieceType:  string;
    pieceTypeLabel:  string;
    productionModeLabel:  string;
    estimatedPrice:  number;
    createdAt:  string;
    workflowStatusLabel:  string;
    attachments:  ClientCustomOrderAttachment[];
    designOptions:  ClientCustomOrderDesignOption[];
    finalQuote:  ClientCustomOrderFinalQuote  |  null;
    fulfillment:  ClientCustomOrderFulfillment  |  null;
}

export  interface  ClientStoreOrderItem  {
    id:  string;
    sku:  string;
    productName:  string;
    variantDescription:  string  |  null;
    quantity:  number;
    unitPrice:  number;
    lineTotal:  number;
}

export  interface  ClientStoreOrderSummary  {
    publicId:  string;
    orderNumber:  string;
    status:  ClientStoreOrderStatus;
    statusLabel:  string;
    paymentStatus:  ClientPaymentStatus;
    totalAmount:  number;
    trackingCode:  string  |  null;
    trackingLink:  string  |  null;
    createdAt:  string;
    deliveredAt:  string  |  null;
    items:  ClientStoreOrderItem[];
}

export  interface  ClientAppointmentSummary  {
    id:  string;
    orderPublicId:  string  |  null;
    appointmentType:  ClientAppointmentType;
    attendanceMode:  ClientAppointmentMode;
    scheduledFor:  string;
    status:  ClientAppointmentStatus;
    notes:  string  |  null;
}

export  interface  ClientNotificationSummary  {
    id:  string;
    channel:  "in_app"  |  "email"  |  "whatsapp";
    status:  "pending"  |  "sent"  |  "failed"  |  "read";
    title:  string;
    body:  string;
    createdAt:  string;
}

export  interface  ClientReviewSummary  {
    id:  string;
    targetType:  ClientReviewTargetType;
    targetPublicId:  string  |  null;
    orderReference:  string;
    rating:  number;
    headline:  string  |  null;
    comment:  string;
    createdAt:  string;
}

export  interface  ClientAccountDeletionRequestSummary  {
    id:  string;
    status:  "pending"  |  "in_review"  |  "approved"  |  "rejected"  |  "completed";
    reason:  string;
    requestedAt:  string;
    resolutionNote:  string  |  null;
}

export  interface  ClientDashboardMetrics  {
    customOrdersInProgress:  number;
    customOrdersHistory:  number;
    storeOrdersInProgress:  number;
    notificationsPending:  number;
}

export  interface  ClientDashboardData  {
    metrics:  ClientDashboardMetrics;
    customOrdersInProgress:  ClientCustomOrderSummary[];
    customOrdersHistory:  ClientCustomOrderSummary[];
    storeOrdersInProgress:  ClientStoreOrderSummary[];
    storeOrdersHistory:  ClientStoreOrderSummary[];
    appointments:  ClientAppointmentSummary[];
    notifications:  ClientNotificationSummary[];
    reviews:  ClientReviewSummary[];
    latestDeletionRequest:  ClientAccountDeletionRequestSummary  |  null;
}
