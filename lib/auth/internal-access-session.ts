import  type  {  SupabaseClient  }  from  "@supabase/supabase-js";
import  {  DEFAULT_INTERNAL_ACCESS_COOKIE_NAME  }  from  "@/lib/constants/security";
import  {  env  }  from  "@/lib/env";
import  type  {  InternalUserRole  }  from  "@/types/auth";

export  function  getInternalAccessCookieName():  string  {
    return  env.INTERNAL_ACCESS_COOKIE_NAME  ??  DEFAULT_INTERNAL_ACCESS_COOKIE_NAME;
}

export  async  function  hasValidInternalAccessSession(
    supabase:  SupabaseClient,
    input:  {
        userId:  string;
        role:  InternalUserRole;
        sessionToken:  string  |  null  |  undefined;
    }
):  Promise<boolean>  {
    if  (!input.sessionToken)  {
        return  false;
    }

    const  {  data  }  =  await  supabase
        .from("internal_access_challenges")
        .select("id")
        .eq("user_id",  input.userId)
        .eq("role",  input.role)
        .eq("status",  "verified")
        .eq("session_token",  input.sessionToken)
        .gt("session_expires_at",  new  Date().toISOString())
        .is("revoked_at",  null)
        .limit(1)
        .maybeSingle();

    return  Boolean(data);
}
