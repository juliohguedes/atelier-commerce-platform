import  type  {  ShippingAdapter  }  from  "@/adapters/shipping/shipping-adapter";
import  {  MockShippingAdapter  }  from  "@/adapters/shipping/shipping-mock";
import  {  env  }  from  "@/lib/env";

export  function  createShippingAdapter():  ShippingAdapter  {
    switch  (env.SHIPPING_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockShippingAdapter();
    }
}
