--  Internal  sectors:  admin  controls,  technical  mode  support  and  internal  calendar

alter  table  public.brand_settings
    add  column  if  not  exists  address_text  text,
    add  column  if  not  exists  business_hours  text,
    add  column  if  not  exists  instagram_url  text,
    add  column  if  not  exists  facebook_url  text,
    add  column  if  not  exists  tiktok_url  text,
    add  column  if  not  exists  legal_document_cnpj  text,
    add  column  if  not  exists  technical_draft_payload  jsonb  not  null  default  '{}'::jsonb,
    add  column  if  not  exists  technical_draft_owner  uuid  references  auth.users  (id)  on  delete  set  null,
    add  column  if  not  exists  technical_published_payload  jsonb  not  null  default  '{}'::jsonb,
    add  column  if  not  exists  technical_previous_payload  jsonb  not  null  default  '{}'::jsonb,
    add  column  if  not  exists  technical_published_version  integer  not  null  default  1,
    add  column  if  not  exists  technical_last_published_at  timestamptz,
    add  column  if  not  exists  technical_last_published_by  uuid  references  auth.users  (id)  on  delete  set  null;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'brand_settings_cnpj_format_check'
    )  then
        alter  table  public.brand_settings
            add  constraint  brand_settings_cnpj_format_check
            check  (legal_document_cnpj  is  null  or  legal_document_cnpj  ~  '^[0-9]{14}$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'brand_settings_technical_version_check'
    )  then
        alter  table  public.brand_settings
            add  constraint  brand_settings_technical_version_check
            check  (technical_published_version  >=  1);
    end  if;
end
$$;

create  index  if  not  exists  brand_settings_technical_draft_owner_idx
    on  public.brand_settings  (technical_draft_owner);

create  table  if  not  exists  public.internal_calendar_events  (
    id  uuid  primary  key  default  gen_random_uuid(),
    title  text  not  null,
    description  text,
    starts_at  timestamptz  not  null,
    ends_at  timestamptz,
    responsible_role  public.app_role,
    is_all_day  boolean  not  null  default  false,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    check  (ends_at  is  null  or  ends_at  >=  starts_at)
);

create  index  if  not  exists  internal_calendar_events_starts_at_idx
    on  public.internal_calendar_events  (starts_at  asc);

create  index  if  not  exists  internal_calendar_events_role_idx
    on  public.internal_calendar_events  (responsible_role,  starts_at  asc);

drop  trigger  if  exists  trg_internal_calendar_events_updated_at  on  public.internal_calendar_events;
create  trigger  trg_internal_calendar_events_updated_at
before  update  on  public.internal_calendar_events
for  each  row
execute  function  public.handle_updated_at();

alter  table  public.internal_calendar_events  enable  row  level  security;

drop  policy  if  exists  internal_calendar_events_select_internal  on  public.internal_calendar_events;
create  policy  internal_calendar_events_select_internal
on  public.internal_calendar_events
for  select
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  internal_calendar_events_insert_admin  on  public.internal_calendar_events;
create  policy  internal_calendar_events_insert_admin
on  public.internal_calendar_events
for  insert
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  internal_calendar_events_update_admin  on  public.internal_calendar_events;
create  policy  internal_calendar_events_update_admin
on  public.internal_calendar_events
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  internal_calendar_events_delete_admin  on  public.internal_calendar_events;
create  policy  internal_calendar_events_delete_admin
on  public.internal_calendar_events
for  delete
using  (public.has_role('admin'::public.app_role));

grant  select,  insert,  update,  delete  on  public.internal_calendar_events  to  authenticated;
