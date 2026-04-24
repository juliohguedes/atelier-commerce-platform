import  Link  from  "next/link";
import  {  requireAuthenticatedContext  }  from  "@/lib/auth/guards";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {  Card,  CardContent,  CardDescription,  CardHeader,  CardTitle  }  from  "@/components/ui/card";

export  default  async  function  DashboardPage()  {
    const  {  role  }  =  await  requireAuthenticatedContext();

    const  internalCards  =  [
        {
            href:  ROUTES.private.admin,
            title:  "Admin",
            description:  "Operação  geral,  conteúdo  institucional  e  governanca.",
            visible:  role  ===  "admin"
        },
        {
            href:  ROUTES.private.finance,
            title:  "Financeiro",
            description:  "Orçamento  final,  pagamento,  frete,  nota  fiscal  e  auditoria.",
            visible:  role  ===  "admin"  ||  role  ===  "finance"
        },
        {
            href:  ROUTES.private.salesStock,
            title:  "Vendas  e  estoque",
            description:  "Produtos  da  loja,  disponibilidade,  pedidos,  envio  e  rastreio.",
            visible:  role  ===  "admin"  ||  role  ===  "sales_stock"
        },
        {
            href:  ROUTES.private.reports,
            title:  "Relatórios",
            description:  "Pedidos,  vendas,  pagamentos,  estoque  e  desempenho  por  setor.",
            visible:  role  ===  "admin"  ||  role  ===  "finance"  ||  role  ===  "sales_stock"
        },
        {
            href:  ROUTES.private.calendar,
            title:  "Calendário",
            description:  "Agendamentos,  retiradas,  produção  e  entregas  previstas.",
            visible:  role  ===  "admin"  ||  role  ===  "finance"  ||  role  ===  "sales_stock"
        },
        {
            href:  ROUTES.private.adminAuxiliary,
            title:  "Áreas  auxiliares",
            description:  "FAQ,  termos,  privacidade,  depoimentos,  galeria  e  coleções.",
            visible:  role  ===  "admin"
        },
        {
            href:  ROUTES.private.client,
            title:  "Área  da  cliente",
            description:  "Acompanhamento  de  pedidos  sob  medida  e  loja  online.",
            visible:  role  ===  "admin"  ||  role  ===  "client"
        }
    ].filter((card)  =>  card.visible);

    return  (
        <div  className="space-y-6">
            <header  className="space-y-2">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Painel</p>
                <h1  className="text-4xl">Visão  geral</h1>
                <p  className="text-muted-foreground">
                    Acessos  internos  organizados  por  setor,  com  permissão  real  por  papel.
                </p>
            </header>

            <div  className="grid  gap-4  md:grid-cols-2  xl:grid-cols-4">
                {internalCards.map((card)  =>  (
                    <Link  key={card.href}  href={card.href}>
                        <Card  className="h-full  border-border/70  bg-card/60  hover:border-gold-500/60">
                            <CardHeader>
                                <CardTitle>{card.title}</CardTitle>
                                <CardDescription>{card.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p  className="text-sm  text-gold-400">Acessar  painel</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
