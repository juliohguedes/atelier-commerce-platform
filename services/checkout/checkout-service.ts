import  type  {  NotificationAdapter  }  from  "@/adapters/notifications/notification-adapter";
import  {  MockNotificationAdapter  }  from  "@/adapters/notifications/notification-mock";
import  type  {  PaymentAdapter  }  from  "@/adapters/payment/payment-adapter";
import  {  createPaymentAdapter  }  from  "@/adapters/payment/create-payment-adapter";
import  type  {  ShippingAdapter  }  from  "@/adapters/shipping/shipping-adapter";
import  {  createShippingAdapter  }  from  "@/adapters/shipping/create-shipping-adapter";
import  type  {  CheckoutPayload,  OrderSummary  }  from  "@/types/commerce";

export  class  CheckoutService  {
    constructor(
        private  readonly  paymentAdapter:  PaymentAdapter,
        private  readonly  shippingAdapter:  ShippingAdapter,
        private  readonly  notificationAdapter:  NotificationAdapter
    )  {}

    async  createOrder(payload:  CheckoutPayload):  Promise<OrderSummary>  {
        const  subtotal  =  payload.items.reduce(
            (acc,  item)  =>  acc  +  item.quantity  *  item.unitPrice,
            0
        );

        const  shippingQuote  =  await  this.shippingAdapter.quote(
            payload.shippingAddress,
            payload.items
        );

        const  amountInCents  =  Math.round((subtotal  +  shippingQuote.amountInCents  /  100)  *  100);

        const  payment  =  await  this.paymentAdapter.createPaymentIntent({
            amountInCents,
            method:  "pix",
            customerEmail:  payload.customerEmail,
            metadata:  {
                context:  "checkout_mock"
            }
        });

        const  order:  OrderSummary  =  {
            orderId:  `PED-${Date.now()}`,
            status:  "pending",
            subtotal,
            shippingCost:  shippingQuote.amountInCents  /  100,
            total:  subtotal  +  shippingQuote.amountInCents  /  100,
            paymentReference:  payment.reference,
            createdAt:  new  Date().toISOString()
        };

        await  this.notificationAdapter.sendOrderConfirmation({
            email:  payload.customerEmail,
            orderId:  order.orderId,
            message:  "Seu  pedido  foi  recebido  e  está  em  análise."
        });

        return  order;
    }
}

export  const  checkoutService  =  new  CheckoutService(
    createPaymentAdapter(),
    createShippingAdapter(),
    new  MockNotificationAdapter()
);
