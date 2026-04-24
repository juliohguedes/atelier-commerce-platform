import  type  {  PasswordRecoveryAdapter  }  from  "@/adapters/auth/password-recovery-adapter";
import  {  MockPasswordRecoveryAdapter  }  from  "@/adapters/auth/password-recovery-mock";
import  {  env  }  from  "@/lib/env";

export  function  createPasswordRecoveryAdapter():  PasswordRecoveryAdapter  {
    switch  (env.PASSWORD_RECOVERY_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockPasswordRecoveryAdapter();
    }
}
