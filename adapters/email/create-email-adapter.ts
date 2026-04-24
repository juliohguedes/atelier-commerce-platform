import  type  {  EmailAdapter  }  from  "@/adapters/email/email-adapter";
import  {  MockEmailAdapter  }  from  "@/adapters/email/email-mock";
import  {  env  }  from  "@/lib/env";

export  function  createEmailAdapter():  EmailAdapter  {
    switch  (env.EMAIL_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockEmailAdapter();
    }
}
