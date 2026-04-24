import  type  {  EmailAdapter,  EmailDispatchResult,  SendEmailInput  }  from  "@/adapters/email/email-adapter";
import  {  maskEmail  }  from  "@/lib/utils";

export  class  MockEmailAdapter  implements  EmailAdapter  {
    async  sendTransactionalEmail(input:  SendEmailInput):  Promise<EmailDispatchResult>  {
        const  reference  =  `MOCK_EMAIL_${Date.now()}`;

        console.info("[MOCK_EMAIL]",  {
            reference,
            to:  maskEmail(input.to),
            subject:  input.subject,
            metadata:  input.metadata  ??  null
        });

        return  {
            provider:  "mock_email",
            reference,
            status:  "sent"
        };
    }
}
