export  interface  WhatsAppRecoveryInput  {
    email:  string;
    whatsapp:  string;
    recoveryCode:  string;
    expiresAt:  string;
    message:  string;
}

export  interface  PasswordRecoveryAdapter  {
    sendPasswordRecoveryViaWhatsApp(input:  WhatsAppRecoveryInput):  Promise<void>;
}
