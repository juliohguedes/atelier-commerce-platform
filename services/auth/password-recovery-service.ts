import  type  {  PasswordRecoveryAdapter  }  from  "@/adapters/auth/password-recovery-adapter";
import  {  createPasswordRecoveryAdapter  }  from  "@/adapters/auth/create-password-recovery-adapter";

export  interface  PasswordRecoveryWhatsAppRequest  {
    email:  string;
    whatsapp:  string;
    recoveryCode:  string;
    expiresAt:  string;
}

export  class  PasswordRecoveryService  {
    constructor(private  readonly  adapter:  PasswordRecoveryAdapter)  {}

    async  requestWhatsAppRecovery(input:  PasswordRecoveryWhatsAppRequest):  Promise<void>  {
        await  this.adapter.sendPasswordRecoveryViaWhatsApp({
            email:  input.email,
            whatsapp:  input.whatsapp,
            recoveryCode:  input.recoveryCode,
            expiresAt:  input.expiresAt,
            message:  `Codigo  para  recuperacao  de  senha:  ${input.recoveryCode}`
        });
    }
}

export  const  passwordRecoveryService  =  new  PasswordRecoveryService(
    createPasswordRecoveryAdapter()
);
