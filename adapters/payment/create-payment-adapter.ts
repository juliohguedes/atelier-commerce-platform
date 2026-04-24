import  type  {  PaymentAdapter  }  from  "@/adapters/payment/payment-adapter";
import  {  MockPaymentAdapter  }  from  "@/adapters/payment/payment-mock";
import  {  env  }  from  "@/lib/env";

export  function  createPaymentAdapter():  PaymentAdapter  {
    switch  (env.PAYMENT_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockPaymentAdapter();
    }
}
