import  type  {  Route  }  from  "next";

function  asRoute(value:  string):  Route  {
    return  value  as  Route;
}

export  const  ROUTES  =  {
    public:  {
        home:  asRoute("/"),
        contact:  asRoute("/contato"),
        shop:  asRoute("/loja"),
        tailored:  asRoute("/sob-medida"),
        signIn:  asRoute("/entrar"),
        signInAdmin:  asRoute("/entrar/admin"),
        signInFinance:  asRoute("/entrar/financeiro"),
        signInSalesStock:  asRoute("/entrar/vendas-estoque"),
        signUp:  asRoute("/cadastro"),
        forgotPassword:  asRoute("/recuperar-senha"),
        resetPassword:  asRoute("/redefinir-senha"),
        maintenance:  asRoute("/manutencao")
    },
    private:  {
        dashboard:  asRoute("/painel"),
        client:  asRoute("/painel/cliente"),
        clientTailored:  asRoute("/painel/cliente/sob-medida"),
        clientStore:  asRoute("/painel/cliente/loja"),
        clientStoreCart:  asRoute("/painel/cliente/loja/carrinho"),
        clientAccount:  asRoute("/painel/cliente/conta"),
        admin:  asRoute("/painel/admin"),
        adminAuxiliary:  asRoute("/painel/admin/auxiliares"),
        finance:  asRoute("/painel/financeiro"),
        salesStock:  asRoute("/painel/vendas-estoque"),
        reports:  asRoute("/painel/relatorios"),
        calendar:  asRoute("/painel/calendario")
    },
    auth:  {
        callback:  asRoute("/auth/callback")
    }
}  as  const;

export  const  privateRoutePrefixes  =  ["/painel"]  as  const;

export  const  authRoutePrefixes  =  [
    ROUTES.public.signIn,
    ROUTES.public.signUp,
    ROUTES.public.forgotPassword,
    ROUTES.public.resetPassword
]  as  const;
