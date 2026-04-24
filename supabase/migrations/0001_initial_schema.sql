--  Base  inicial  de  papéis  e  perfis  para  o  sistema  single-company

create  type  public.app_role  as  enum  ('client',  'admin',  'finance',  'sales_stock');

create  table  if  not  exists  public.profiles  (
    id  uuid  primary  key  references  auth.users  (id)  on  delete  cascade,
    full_name  text,
    role  public.app_role  not  null  default  'client',
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

alter  table  public.profiles  enable  row  level  security;

create  policy  "profiles_select_own"  on  public.profiles
for  select
using  (auth.uid()  =  id);

create  policy  "profiles_update_own"  on  public.profiles
for  update
using  (auth.uid()  =  id);

create  or  replace  function  public.handle_updated_at()
returns  trigger
language  plpgsql
as  $$
begin
    new.updated_at  =  now();
    return  new;
end;
$$;

drop  trigger  if  exists  trg_profiles_updated_at  on  public.profiles;
create  trigger  trg_profiles_updated_at
before  update  on  public.profiles
for  each  row
execute  function  public.handle_updated_at();
