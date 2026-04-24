import  {  LoginForm  }  from  "@/components/forms/login-form";
import  {  ROUTES  }  from  "@/lib/constants/routes";

export  default  function  FinanceSignInEntryPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-md  space-y-6">
            <div  className="space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Acesso  interno</p>
                <h1  className="text-4xl">Entrar  no  financeiro</h1>
                <p  className="text-sm  text-muted-foreground">
                    Orçamento  final,  pagamento,  frete,  nota  fiscal  e  auditoria  financeira  com  desbloqueio.
                </p>
            </div>

            <LoginForm
                badge="Setor  financeiro"
                defaultNextPath={ROUTES.private.finance}
                description="Entre  com  sua  conta  financeira  para  operar  pagamentos  e  emissão  com  rastreabilidade."
                expectedInternalRole="finance"
                hideGoogleSignIn
                hideSignUpLink
                title="Login  do  setor  financeiro"
            />
        </div>
    );
}
