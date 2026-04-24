import  {
    type  NotificationAdapter,
    type  SendOrderNotificationInput
}  from  "@/adapters/notifications/notification-adapter";

export  class  MockNotificationAdapter  implements  NotificationAdapter  {
    async  sendOrderConfirmation(input:  SendOrderNotificationInput):  Promise<void>  {
        console.info(
            `[MOCK_NOTIFICATION]  Pedido  ${input.orderId}  enviado  para  ${input.email}:  ${input.message}`
        );
    }
}
