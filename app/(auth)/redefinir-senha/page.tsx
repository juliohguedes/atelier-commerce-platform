import  {  ResetPasswordForm  }  from  "@/components/forms/reset-password-form";

export  default  function  ResetPasswordPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-md">
            <div  className="mb-6  space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Acesso  seguro</p>
                <h1  className="text-4xl">Redefinir  senha</h1>
                <p  className="text-sm  text-muted-foreground">
                    Defina  uma  nova  senha  para  continuar  no  sistema.
                </p>
            </div>
            <ResetPasswordForm  />
        </div>
    );
}
