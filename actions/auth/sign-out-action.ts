"use server";

import  {  cookies  }  from  "next/headers";
import  {  redirect  }  from  "next/navigation";
import  {  getInternalAccessCookieName  }  from  "@/lib/auth/internal-access-session";
import  {  createSupabaseServerClient  }  from  "@/lib/supabase/server";

export  async  function  signOutAction():  Promise<void>  {
    const  supabase  =  await  createSupabaseServerClient();
    await  supabase.auth.signOut();
    const  cookieStore  =  await  cookies();
    cookieStore.delete(getInternalAccessCookieName());
    redirect("/");
}
