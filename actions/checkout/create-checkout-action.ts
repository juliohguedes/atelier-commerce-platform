"use server";

import  {  checkoutPayloadSchema  }  from  "@/lib/validations/checkout";
import  {  checkoutService  }  from  "@/services/checkout/checkout-service";

export  async  function  createCheckoutAction(input:  unknown)  {
    const  payload  =  checkoutPayloadSchema.parse(input);
    return  checkoutService.createOrder(payload);
}
