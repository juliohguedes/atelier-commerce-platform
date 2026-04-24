import  {  createBrowserClient  }  from  "@supabase/ssr";
import  type  {  SupabaseClient  }  from  "@supabase/supabase-js";
import  {  env,  isSupabaseConfigured  }  from  "@/lib/env";

let  browserClient:  SupabaseClient  |  null  =  null;

export  function  createSupabaseBrowserClient():  SupabaseClient  {
    if  (!isSupabaseConfigured)  {
        throw  new  Error(
            "Supabase  não  configurado.  Defina  NEXT_PUBLIC_SUPABASE_URL  e  NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
    }

    if  (!browserClient)  {
        browserClient  =  createBrowserClient(
            env.NEXT_PUBLIC_SUPABASE_URL!,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

    return  browserClient;
}
