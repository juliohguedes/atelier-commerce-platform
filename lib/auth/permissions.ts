import  type  {  UserRole  }  from  "@/types/auth";

export  interface  RouteAccessRule  {
    prefix:  string;
    allowedRoles:  UserRole[];
}

const  routeAccessRules:  RouteAccessRule[]  =  [
    {
        prefix:  "/painel/admin",
        allowedRoles:  ["admin"]
    },
    {
        prefix:  "/painel/financeiro",
        allowedRoles:  ["admin",  "finance"]
    },
    {
        prefix:  "/painel/vendas-estoque",
        allowedRoles:  ["admin",  "sales_stock"]
    },
    {
        prefix:  "/painel/relatorios",
        allowedRoles:  ["admin",  "finance",  "sales_stock"]
    },
    {
        prefix:  "/painel/calendario",
        allowedRoles:  ["admin",  "finance",  "sales_stock"]
    },
    {
        prefix:  "/painel/cliente",
        allowedRoles:  ["admin",  "client"]
    },
    {
        prefix:  "/painel",
        allowedRoles:  ["admin",  "client",  "finance",  "sales_stock"]
    }
];

export  function  getRouteAccessRule(pathname:  string):  RouteAccessRule  |  null  {
    return  routeAccessRules.find((rule)  =>  pathname.startsWith(rule.prefix))  ??  null;
}

export  function  canAccessPath(role:  UserRole,  pathname:  string):  boolean  {
    if  (!pathname.startsWith("/painel"))  {
        return  true;
    }

    const  matchedRule  =  getRouteAccessRule(pathname);

    if  (!matchedRule)  {
        return  false;
    }

    return  matchedRule.allowedRoles.includes(role);
}
