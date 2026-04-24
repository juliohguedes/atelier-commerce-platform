create  table  if  not  exists  public.site_auxiliary_content  (
    singleton_key  boolean  primary  key  default  true,
    gallery_pieces  jsonb  not  null  default  '[]'::jsonb,
    featured_collections  jsonb  not  null  default  '[]'::jsonb,
    testimonials  jsonb  not  null  default  '[]'::jsonb,
    faq_items  jsonb  not  null  default  '[]'::jsonb,
    legal_sections  jsonb  not  null  default  '[]'::jsonb,
    location_info  jsonb  not  null  default  '{}'::jsonb,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    check  (singleton_key  =  true)
);

insert  into  public.site_auxiliary_content  (singleton_key)
values  (true)
on  conflict  (singleton_key)  do  nothing;

drop  trigger  if  exists  trg_site_auxiliary_content_updated_at  on  public.site_auxiliary_content;
create  trigger  trg_site_auxiliary_content_updated_at
before  update  on  public.site_auxiliary_content
for  each  row
execute  function  public.handle_updated_at();

alter  table  public.site_auxiliary_content  enable  row  level  security;

drop  policy  if  exists  site_auxiliary_content_select_public  on  public.site_auxiliary_content;
create  policy  site_auxiliary_content_select_public
on  public.site_auxiliary_content
for  select
using  (true);

drop  policy  if  exists  site_auxiliary_content_insert_admin  on  public.site_auxiliary_content;
create  policy  site_auxiliary_content_insert_admin
on  public.site_auxiliary_content
for  insert
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  site_auxiliary_content_update_admin  on  public.site_auxiliary_content;
create  policy  site_auxiliary_content_update_admin
on  public.site_auxiliary_content
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  site_auxiliary_content_delete_admin  on  public.site_auxiliary_content;
create  policy  site_auxiliary_content_delete_admin
on  public.site_auxiliary_content
for  delete
using  (public.has_role('admin'::public.app_role));

grant  select  on  public.site_auxiliary_content  to  anon;
grant  select,  insert,  update,  delete  on  public.site_auxiliary_content  to  authenticated;
