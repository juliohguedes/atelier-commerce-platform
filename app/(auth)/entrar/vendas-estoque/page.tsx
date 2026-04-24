import  {  LoginForm  }  from  "@/components/forms/login-form";
import  {  ROUTES  }  from  "@/lib/constants/routes";

export  default  function  SalesStockSignInEntryPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-md  space-y-6">
            <div  className="space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Acesso  interno</p>
                <h1  className="text-4xl">Entrar  em  vendas  e  estoque</h1>
                <p  className="text-sm  text-muted-foreground">
                    Operação  da  loja,  disponibilidade,  estoque,  envio,  rastreio  e  pedidos  online.
                </p>
            </div>

            <LoginForm
                badge="Setor  vendas  e  estoque"
                defaultNextPath={ROUTES.private.salesStock}
                description="Entre  com  sua  conta  operacional  para  controlar  produtos,  expedição  e  rastreamento."
                expectedInternalRole="sales_stock"
                hideGoogleSignIn
                hideSignUpLink
                title="Login  de  vendas  e  estoque"
            />
        </div>
    );
}
