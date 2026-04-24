export  interface  SendOrderNotificationInput  {
    email:  string;
    orderId:  string;
    message:  string;
}

export  interface  NotificationAdapter  {
    sendOrderConfirmation(input:  SendOrderNotificationInput):  Promise<void>;
}
