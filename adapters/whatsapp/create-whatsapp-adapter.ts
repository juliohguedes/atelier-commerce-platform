import  type  {  WhatsAppAdapter  }  from  "@/adapters/whatsapp/whatsapp-adapter";
import  {  MockWhatsAppAdapter  }  from  "@/adapters/whatsapp/whatsapp-mock";
import  {  env  }  from  "@/lib/env";

export  function  createWhatsAppAdapter():  WhatsAppAdapter  {
    switch  (env.WHATSAPP_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockWhatsAppAdapter();
    }
}
