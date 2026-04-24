import  {  RegisterClientForm  }  from  "@/components/forms/register-client-form";

export  default  function  SignUpPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-4xl">
            <div  className="mb-6  space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Cadastro</p>
                <h1  className="text-4xl">Crie  sua  conta</h1>
                <p  className="text-sm  text-muted-foreground">
                    Crie  sua  conta  com  menos  etapas  agora  e  informe  os  dados  operacionais  somente  quando
                    forem  necessarios  no  fluxo.
                </p>
            </div>
            <RegisterClientForm  />
        </div>
    );
}
