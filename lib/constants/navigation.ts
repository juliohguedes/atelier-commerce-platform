import  type  {  Route  }  from  "next";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  type  {  UserRole  }  from  "@/types/auth";

export  interface  NavigationItem  {
    href:  Route;
    label:  string;
}

export  const  publicNavigation:  NavigationItem[]  =  [
    {
        href:  ROUTES.public.home,
        label:  "Início"
    },
    {
        href:  ROUTES.public.shop,
        label:  "Loja"
    },
    {
        href:  ROUTES.public.tailored,
        label:  "Sob  medida"
    },
    {
        href:  ROUTES.public.contact,
        label:  "Contato"
    }
];

export  const  privateNavigationByRole:  Record<UserRole,  NavigationItem[]>  =  {
    client:  [
        {  href:  ROUTES.private.dashboard,  label:  "Visão  geral"  },
        {  href:  ROUTES.private.client,  label:  "Dashboard  da  cliente"  },
        {  href:  ROUTES.private.clientTailored,  label:  "Pedidos  sob  medida"  },
        {  href:  ROUTES.private.clientStore,  label:  "Loja  online"  },
        {  href:  ROUTES.private.clientStoreCart,  label:  "Carrinho  e  checkout"  },
        {  href:  ROUTES.private.clientAccount,  label:  "Minha  conta"  }
    ],
    admin:  [
        {  href:  ROUTES.private.dashboard,  label:  "Visão  geral"  },
        {  href:  ROUTES.private.admin,  label:  "Administração"  },
        {  href:  ROUTES.private.adminAuxiliary,  label:  "Áreas  auxiliares"  },
        {  href:  ROUTES.private.finance,  label:  "Financeiro"  },
        {  href:  ROUTES.private.salesStock,  label:  "Vendas  e  estoque"  },
        {  href:  ROUTES.private.reports,  label:  "Relatórios"  },
        {  href:  ROUTES.private.calendar,  label:  "Calendário"  }
    ],
    finance:  [
        {  href:  ROUTES.private.dashboard,  label:  "Visão  geral"  },
        {  href:  ROUTES.private.finance,  label:  "Financeiro"  },
        {  href:  ROUTES.private.reports,  label:  "Relatórios"  },
        {  href:  ROUTES.private.calendar,  label:  "Calendário"  }
    ],
    sales_stock:  [
        {  href:  ROUTES.private.dashboard,  label:  "Visão  geral"  },
        {  href:  ROUTES.private.salesStock,  label:  "Vendas  e  estoque"  },
        {  href:  ROUTES.private.reports,  label:  "Relatórios"  },
        {  href:  ROUTES.private.calendar,  label:  "Calendário"  }
    ]
};
