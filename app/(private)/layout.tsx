import  {  PrivateShell  }  from  "@/components/layout/private-shell";
import  {  requireAuthenticatedContext  }  from  "@/lib/auth/guards";
import  {  isSupabaseConfigured  }  from  "@/lib/env";

interface  PrivateLayoutProps  {
    children:  React.ReactNode;
}

export  default  async  function  PrivateLayout({  children  }:  PrivateLayoutProps)  {
    if  (!isSupabaseConfigured)  {
        return  <PrivateShell  role={"admin"}>{children}</PrivateShell>;
    }

    const  {  role  }  =  await  requireAuthenticatedContext();

    return  <PrivateShell  role={role}>{children}</PrivateShell>;
}
