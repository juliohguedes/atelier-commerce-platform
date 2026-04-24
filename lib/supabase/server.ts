import  {  createServerClient  }  from  "@supabase/ssr";
import  type  {  SupabaseClient  }  from  "@supabase/supabase-js";
import  {  cookies  }  from  "next/headers";
import  {  env,  isSupabaseConfigured  }  from  "@/lib/env";

export  async  function  createSupabaseServerClient():  Promise<SupabaseClient>  {
    if  (!isSupabaseConfigured)  {
        throw  new  Error(
            "Supabase  não  configurado.  Defina  NEXT_PUBLIC_SUPABASE_URL  e  NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
    }

    const  cookieStore  =  await  cookies();

    return  createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL!,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:  {
                getAll()  {
                    return  cookieStore.getAll();
                },
                setAll(cookiesToSet)  {
                    try  {
                        cookiesToSet.forEach(({  name,  value,  options  })  =>  {
                            cookieStore.set(name,  value,  options);
                        });
                    }  catch  {
                        //  ignore  in  server  components  that  cannot  write  cookies
                    }
                }
            }
        }
    );
}
