import  type  {  Route  }  from  "next";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {
    isInternalUserRole,
    type  InternalUserRole,
    type  UserRole
}  from  "@/types/auth";

export  function  getInternalSignInRoute(role:  InternalUserRole):  Route  {
    switch  (role)  {
        case  "admin":
            return  ROUTES.public.signInAdmin;
        case  "finance":
            return  ROUTES.public.signInFinance;
        case  "sales_stock":
            return  ROUTES.public.signInSalesStock;
    }
}

export  function  resolveInternalSignInRoute(role:  UserRole  |  null  |  undefined):  Route  {
    if  (!isInternalUserRole(role))  {
        return  ROUTES.public.signIn;
    }

    return  getInternalSignInRoute(role);
}

export  function  shouldRequireInternalAccess(
    role:  UserRole  |  null  |  undefined,
    pathname:  string
):  boolean  {
    return  isInternalUserRole(role)  &&  pathname.startsWith("/painel");
}
