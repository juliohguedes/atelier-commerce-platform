import  type  {  Route  }  from  "next";
import  {  redirect  }  from  "next/navigation";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {  isSupabaseConfigured  }  from  "@/lib/env";
import  {  createSupabaseServerClient  }  from  "@/lib/supabase/server";
import  {  getUserRole  }  from  "@/services/auth/get-user-role";
import  type  {  UserRole  }  from  "@/types/auth";

export  interface  AuthenticatedContext  {
    userId:  string;
    userEmail:  string  |  null;
    role:  UserRole;
}

export  async  function  requireAuthenticatedContext(
    redirectTo:  Route  =  ROUTES.public.signIn
):  Promise<AuthenticatedContext>  {
    if  (!isSupabaseConfigured)  {
        return  {
            userId:  "local-dev-user",
            userEmail:  null,
            role:  "admin"
        };
    }

    const  supabase  =  await  createSupabaseServerClient();
    const  {
        data:  {  user  }
    }  =  await  supabase.auth.getUser();

    if  (!user)  {
        redirect(redirectTo);
    }

    const  role  =  await  getUserRole(user.id);

    return  {
        userId:  user.id,
        userEmail:  user.email  ??  null,
        role
    };
}

export  async  function  requireRole(
    allowedRoles:  UserRole[],
    redirectTo:  Route  =  ROUTES.private.dashboard
):  Promise<AuthenticatedContext>  {
    const  context  =  await  requireAuthenticatedContext();

    if  (!allowedRoles.includes(context.role))  {
        redirect(redirectTo);
    }

    return  context;
}
