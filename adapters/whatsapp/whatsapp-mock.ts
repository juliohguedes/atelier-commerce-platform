import  type  {
    SendWhatsAppMessageInput,
    WhatsAppAdapter,
    WhatsAppDispatchResult
}  from  "@/adapters/whatsapp/whatsapp-adapter";
import  {  maskPhone  }  from  "@/lib/utils";

export  class  MockWhatsAppAdapter  implements  WhatsAppAdapter  {
    async  sendMessage(
        input:  SendWhatsAppMessageInput
    ):  Promise<WhatsAppDispatchResult>  {
        const  reference  =  `MOCK_WPP_${Date.now()}`;

        console.info("[MOCK_WHATSAPP]",  {
            reference,
            to:  maskPhone(input.to),
            template:  input.template  ??  null,
            metadata:  input.metadata  ??  null
        });

        return  {
            provider:  "mock_whatsapp",
            reference,
            status:  "sent"
        };
    }
}
