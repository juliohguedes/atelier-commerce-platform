export  const  DEFAULT_INTERNAL_ACCESS_COOKIE_NAME  =  "internal_access_session";
export  const  DEFAULT_INTERNAL_ACCESS_CODE_TTL_MINUTES  =  10;
export  const  DEFAULT_INTERNAL_ACCESS_SESSION_HOURS  =  12;
export  const  INTERNAL_ACCESS_MAX_ATTEMPTS  =  5;

export  const  INTERNAL_ACCESS_AUDIT_EVENTS  =  {
    requestCode:  "auth.request_internal_access_code",
    verifyCode:  "auth.verify_internal_access_code"
}  as  const;
