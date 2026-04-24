alter  table  public.brand_settings
add  column  if  not  exists  years_in_business  integer  not  null  default  14;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'brand_settings_years_in_business_check'
    )  then
        alter  table  public.brand_settings
            add  constraint  brand_settings_years_in_business_check
            check  (years_in_business  >=  0  and  years_in_business  <=  200);
    end  if;
end
$$;
