import  {  LoginForm  }  from  "@/components/forms/login-form";
import  {  ROUTES  }  from  "@/lib/constants/routes";

export  default  function  AdminSignInEntryPage()  {
    return  (
        <div  className="mx-auto  w-full  max-w-md  space-y-6">
            <div  className="space-y-2  text-center">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Acesso  interno</p>
                <h1  className="text-4xl">Entrar  como  admin</h1>
                <p  className="text-sm  text-muted-foreground">
                    Controle  geral  do  site,  identidade  visual,  acessos  internos,  manutenção  e  histórico
                    crítico  da  marca.
                </p>
            </div>

            <LoginForm
                badge="Setor  admin"
                defaultNextPath={ROUTES.private.admin}
                description="Entre  com  sua  conta  administrativa  para  acessar  a  governanca  completa  da  operação."
                expectedInternalRole="admin"
                hideGoogleSignIn
                hideSignUpLink
                title="Login  do  setor  admin"
            />
        </div>
    );
}
