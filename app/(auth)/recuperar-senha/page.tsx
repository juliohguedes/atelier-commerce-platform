import  {  ForgotPasswordForm  }  from  "@/components/forms/forgot-password-form";

export  default  function  ForgotPasswordPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-md">
            <div  className="mb-6  space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Seguranca</p>
                <h1  className="text-4xl">Recuperar  senha</h1>
                <p  className="text-sm  text-muted-foreground">
                    Informe  seu  e-mail  para  receber  o  link  de  redefinição.
                </p>
            </div>
            <ForgotPasswordForm  />
        </div>
    );
}
