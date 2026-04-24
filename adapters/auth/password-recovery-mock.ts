import  {
    type  PasswordRecoveryAdapter,
    type  WhatsAppRecoveryInput
}  from  "@/adapters/auth/password-recovery-adapter";
import  {  maskEmail,  maskPhone  }  from  "@/lib/utils";

export  class  MockPasswordRecoveryAdapter  implements  PasswordRecoveryAdapter  {
    async  sendPasswordRecoveryViaWhatsApp(input:  WhatsAppRecoveryInput):  Promise<void>  {
        console.info(
            `[MOCK_WHATSAPP_RECOVERY]  ${maskEmail(input.email)}  ->  ${maskPhone(input.whatsapp)}  |  expira  em  ${input.expiresAt}  |  codigo  ${input.recoveryCode}`
        );
    }
}
