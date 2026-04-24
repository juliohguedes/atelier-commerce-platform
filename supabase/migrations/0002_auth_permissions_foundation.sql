--  Auth,  permissions  and  data  foundation  for  the  single-company  SaaS

create  extension  if  not  exists  pgcrypto;
create  extension  if  not  exists  citext;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'app_role'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.app_role  as  enum  ('client',  'admin',  'finance',  'sales_stock');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'notification_channel'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.notification_channel  as  enum  ('in_app',  'email',  'whatsapp');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'notification_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.notification_status  as  enum  ('pending',  'sent',  'failed',  'read');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'recovery_channel'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.recovery_channel  as  enum  ('email',  'whatsapp');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'recovery_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.recovery_status  as  enum  ('pending',  'sent',  'used',  'expired',  'failed');
    end  if;
end
$$;

create  or  replace  function  public.handle_updated_at()
returns  trigger
language  plpgsql
as  $$
begin
    new.updated_at  =  now();
    return  new;
end;
$$;

create  or  replace  function  public.normalize_digits(value  text)
returns  text
language  sql
immutable
as  $$
    select  nullif(regexp_replace(coalesce(value,  ''),  '\\D',  '',  'g'),  '');
$$;

create  table  if  not  exists  public.profiles  (
    id  uuid  primary  key  references  auth.users  (id)  on  delete  cascade,
    full_name  text,
    role  public.app_role  not  null  default  'client',
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

alter  table  public.profiles  add  column  if  not  exists  email  citext;
alter  table  public.profiles  add  column  if  not  exists  whatsapp  text;
alter  table  public.profiles  add  column  if  not  exists  cpf  text;
alter  table  public.profiles  add  column  if  not  exists  preferred_locale  text  not  null  default  'pt-BR';
alter  table  public.profiles  add  column  if  not  exists  avatar_url  text;
alter  table  public.profiles  add  column  if  not  exists  birth_date  date;

update  public.profiles
set  full_name  =  coalesce(nullif(trim(full_name),  ''),  'Cliente')
where  full_name  is  null
      or  trim(full_name)  =  '';

alter  table  public.profiles  alter  column  full_name  set  default  'Cliente';
alter  table  public.profiles  alter  column  full_name  set  not  null;

update  public.profiles  p
set  email  =  u.email::citext
from  auth.users  u
where  p.id  =  u.id
    and  p.email  is  null;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'profiles_cpf_format_check'
    )  then
        alter  table  public.profiles
            add  constraint  profiles_cpf_format_check
            check  (cpf  is  null  or  cpf  ~  '^[0-9]{11}$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'profiles_whatsapp_format_check'
    )  then
        alter  table  public.profiles
            add  constraint  profiles_whatsapp_format_check
            check  (whatsapp  is  null  or  whatsapp  ~  '^[0-9]{10,13}$');
    end  if;
end
$$;

create  unique  index  if  not  exists  profiles_email_unique_idx
    on  public.profiles  (email)
    where  email  is  not  null;

create  unique  index  if  not  exists  profiles_cpf_unique_idx
    on  public.profiles  (cpf)
    where  cpf  is  not  null;

create  table  if  not  exists  public.user_roles  (
    id  bigint  generated  by  default  as  identity  primary  key,
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    role  public.app_role  not  null,
    is_primary  boolean  not  null  default  false,
    is_active  boolean  not  null  default  true,
    granted_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (user_id,  role)
);

create  index  if  not  exists  user_roles_user_id_idx
    on  public.user_roles  (user_id);

create  unique  index  if  not  exists  user_roles_single_primary_idx
    on  public.user_roles  (user_id)
    where  is_primary  and  is_active;

do  $$
begin
    if  exists  (
        select  1
        from  information_schema.columns
        where  table_schema  =  'public'
            and  table_name  =  'profiles'
            and  column_name  =  'role'
    )  then
        insert  into  public.user_roles  (user_id,  role,  is_primary,  is_active)
        select  p.id,  p.role,  true,  true
        from  public.profiles  p
        on  conflict  (user_id,  role)  do  nothing;
    end  if;
end
$$;

insert  into  public.user_roles  (user_id,  role,  is_primary,  is_active)
select  u.id,  'client'::public.app_role,  true,  true
from  auth.users  u
where  not  exists  (
    select  1
    from  public.user_roles  ur
    where  ur.user_id  =  u.id
        and  ur.is_active
)
on  conflict  (user_id,  role)  do  nothing;

update  public.user_roles  ur
set  is_primary  =  true,
        updated_at  =  now()
where  ur.id  in  (
    select  min(ur2.id)
    from  public.user_roles  ur2
    where  ur2.is_active
        and  not  exists  (
            select  1
            from  public.user_roles  ur3
            where  ur3.user_id  =  ur2.user_id
                and  ur3.is_active
                and  ur3.is_primary
        )
    group  by  ur2.user_id
);

create  or  replace  function  public.enforce_single_primary_role()
returns  trigger
language  plpgsql
as  $$
begin
    if  new.is_active  and  new.is_primary  then
        update  public.user_roles
        set  is_primary  =  false,
                updated_at  =  now()
        where  user_id  =  new.user_id
            and  id  <>  coalesce(new.id,  -1)
            and  is_primary  =  true;
    elsif  new.is_active  and  not  exists  (
        select  1
        from  public.user_roles  ur
        where  ur.user_id  =  new.user_id
            and  ur.id  <>  coalesce(new.id,  -1)
            and  ur.is_active
            and  ur.is_primary
    )  then
        new.is_primary  =  true;
    elsif  not  new.is_active  then
        new.is_primary  =  false;
    end  if;

    return  new;
end;
$$;

create  or  replace  function  public.ensure_primary_role_after_delete()
returns  trigger
language  plpgsql
as  $$
begin
    if  not  exists  (
        select  1
        from  public.user_roles  ur
        where  ur.user_id  =  old.user_id
            and  ur.is_active
            and  ur.is_primary
    )  then
        update  public.user_roles
        set  is_primary  =  true,
                updated_at  =  now()
        where  id  =  (
            select  ur2.id
            from  public.user_roles  ur2
            where  ur2.user_id  =  old.user_id
                and  ur2.is_active
            order  by  ur2.created_at  asc,  ur2.id  asc
            limit  1
        );
    end  if;

    return  old;
end;
$$;

drop  trigger  if  exists  trg_user_roles_single_primary  on  public.user_roles;
create  trigger  trg_user_roles_single_primary
before  insert  or  update  on  public.user_roles
for  each  row
execute  function  public.enforce_single_primary_role();

drop  trigger  if  exists  trg_user_roles_after_delete  on  public.user_roles;
create  trigger  trg_user_roles_after_delete
after  delete  on  public.user_roles
for  each  row
execute  function  public.ensure_primary_role_after_delete();

create  table  if  not  exists  public.addresses  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    label  text  not  null  default  'Endereço',
    recipient_name  text  not  null,
    zip_code  text  not  null,
    street  text  not  null,
    number  text  not  null,
    complement  text,
    neighborhood  text  not  null,
    city  text  not  null,
    state  text  not  null,
    country_code  text  not  null  default  'BR',
    is_primary  boolean  not  null  default  false,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  addresses_user_id_idx
    on  public.addresses  (user_id);

create  unique  index  if  not  exists  addresses_single_primary_idx
    on  public.addresses  (user_id)
    where  is_primary;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'addresses_zip_code_format_check'
    )  then
        alter  table  public.addresses
            add  constraint  addresses_zip_code_format_check
            check  (zip_code  ~  '^[0-9]{8}$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'addresses_state_format_check'
    )  then
        alter  table  public.addresses
            add  constraint  addresses_state_format_check
            check  (state  ~  '^[A-Z]{2}$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'addresses_country_code_format_check'
    )  then
        alter  table  public.addresses
            add  constraint  addresses_country_code_format_check
            check  (country_code  ~  '^[A-Z]{2}$');
    end  if;
end
$$;

create  or  replace  function  public.enforce_single_primary_address()
returns  trigger
language  plpgsql
as  $$
begin
    if  new.is_primary  then
        update  public.addresses
        set  is_primary  =  false,
                updated_at  =  now()
        where  user_id  =  new.user_id
            and  id  <>  coalesce(new.id,  '00000000-0000-0000-0000-000000000000'::uuid)
            and  is_primary  =  true;
    elsif  not  exists  (
        select  1
        from  public.addresses  a
        where  a.user_id  =  new.user_id
            and  a.id  <>  coalesce(new.id,  '00000000-0000-0000-0000-000000000000'::uuid)
            and  a.is_primary
    )  then
        new.is_primary  =  true;
    end  if;

    return  new;
end;
$$;

create  or  replace  function  public.ensure_primary_address_after_delete()
returns  trigger
language  plpgsql
as  $$
begin
    if  not  exists  (
        select  1
        from  public.addresses  a
        where  a.user_id  =  old.user_id
            and  a.is_primary
    )  then
        update  public.addresses
        set  is_primary  =  true,
                updated_at  =  now()
        where  id  =  (
            select  a2.id
            from  public.addresses  a2
            where  a2.user_id  =  old.user_id
            order  by  a2.created_at  asc,  a2.id  asc
            limit  1
        );
    end  if;

    return  old;
end;
$$;

drop  trigger  if  exists  trg_addresses_single_primary  on  public.addresses;
create  trigger  trg_addresses_single_primary
before  insert  or  update  on  public.addresses
for  each  row
execute  function  public.enforce_single_primary_address();

drop  trigger  if  exists  trg_addresses_after_delete  on  public.addresses;
create  trigger  trg_addresses_after_delete
after  delete  on  public.addresses
for  each  row
execute  function  public.ensure_primary_address_after_delete();

create  table  if  not  exists  public.brand_settings  (
    id  uuid  primary  key  default  gen_random_uuid(),
    singleton_key  boolean  not  null  default  true,
    brand_name  text  not  null  default  'Maison  Aurea',
    legal_name  text,
    support_email  citext,
    support_whatsapp  text,
    currency_code  text  not  null  default  'BRL',
    locale  text  not  null  default  'pt-BR',
    timezone  text  not  null  default  'America/Sao_Paulo',
    maintenance_banner  text,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (singleton_key)
);

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'brand_settings_support_whatsapp_format_check'
    )  then
        alter  table  public.brand_settings
            add  constraint  brand_settings_support_whatsapp_format_check
            check  (support_whatsapp  is  null  or  support_whatsapp  ~  '^[0-9]{10,13}$');
    end  if;
end
$$;

insert  into  public.brand_settings  (singleton_key)
values  (true)
on  conflict  (singleton_key)  do  nothing;

create  table  if  not  exists  public.internal_audit_logs  (
    id  bigint  generated  by  default  as  identity  primary  key,
    actor_user_id  uuid  references  auth.users  (id)  on  delete  set  null,
    actor_role  public.app_role,
    event_name  text  not  null,
    entity_schema  text  not  null  default  'public',
    entity_table  text  not  null,
    entity_id  text,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    ip_address  inet,
    user_agent  text,
    created_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  internal_audit_logs_actor_user_idx
    on  public.internal_audit_logs  (actor_user_id);

create  index  if  not  exists  internal_audit_logs_created_at_idx
    on  public.internal_audit_logs  (created_at  desc);

create  table  if  not  exists  public.internal_notifications  (
    id  uuid  primary  key  default  gen_random_uuid(),
    recipient_user_id  uuid  references  auth.users  (id)  on  delete  cascade,
    recipient_role  public.app_role,
    is_global  boolean  not  null  default  false,
    channel  public.notification_channel  not  null  default  'in_app',
    title  text  not  null,
    body  text  not  null,
    payload  jsonb  not  null  default  '{}'::jsonb,
    status  public.notification_status  not  null  default  'pending',
    scheduled_for  timestamptz,
    delivered_at  timestamptz,
    read_at  timestamptz,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  internal_notifications_user_idx
    on  public.internal_notifications  (recipient_user_id,  created_at  desc);

create  index  if  not  exists  internal_notifications_role_idx
    on  public.internal_notifications  (recipient_role,  created_at  desc);

create  table  if  not  exists  public.maintenance_mode  (
    id  smallint  primary  key  default  1,
    enabled  boolean  not  null  default  false,
    message  text  not  null  default  'Sistema  em  manutenção  programada.',
    allow_roles  public.app_role[]  not  null  default  array['admin']::public.app_role[],
    starts_at  timestamptz,
    ends_at  timestamptz,
    updated_by  uuid  references  auth.users  (id)  on  delete  set  null,
    updated_at  timestamptz  not  null  default  now(),
    check  (id  =  1)
);

insert  into  public.maintenance_mode  (id)
values  (1)
on  conflict  (id)  do  nothing;

create  table  if  not  exists  public.auth_recovery_requests  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    channel  public.recovery_channel  not  null,
    destination  text  not  null,
    status  public.recovery_status  not  null  default  'pending',
    token_hash  text,
    expires_at  timestamptz,
    consumed_at  timestamptz,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    requested_ip  inet,
    user_agent  text,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  auth_recovery_requests_user_idx
    on  public.auth_recovery_requests  (user_id,  created_at  desc);

create  or  replace  function  public.current_user_role()
returns  public.app_role
language  sql
security  definer
stable
set  search_path  =  public
as  $$
    select  coalesce(
        (
            select  ur.role
            from  public.user_roles  ur
            where  ur.user_id  =  auth.uid()
                and  ur.is_active
            order  by  ur.is_primary  desc,  ur.created_at  asc,  ur.id  asc
            limit  1
        ),
        'client'::public.app_role
    );
$$;

create  or  replace  function  public.has_any_role(target_roles  public.app_role[])
returns  boolean
language  sql
security  definer
stable
set  search_path  =  public
as  $$
    select  exists  (
        select  1
        from  public.user_roles  ur
        where  ur.user_id  =  auth.uid()
            and  ur.is_active
            and  ur.role  =  any(target_roles)
    );
$$;

create  or  replace  function  public.has_role(target_role  public.app_role)
returns  boolean
language  sql
security  definer
stable
set  search_path  =  public
as  $$
    select  public.has_any_role(array[target_role]::public.app_role[]);
$$;

create  or  replace  function  public.handle_auth_user_created()
returns  trigger
language  plpgsql
security  definer
set  search_path  =  public
as  $$
declare
    metadata  jsonb  :=  coalesce(new.raw_user_meta_data,  '{}'::jsonb);
    main_address  jsonb  :=  metadata  ->  'main_address';
    extra_addresses  jsonb  :=  metadata  ->  'additional_addresses';
    metadata_full_name  text  :=  nullif(trim(metadata  ->>  'full_name'),  '');
    metadata_whatsapp  text  :=  public.normalize_digits(metadata  ->>  'whatsapp');
    metadata_cpf  text  :=  public.normalize_digits(metadata  ->>  'cpf');
    main_zip  text;
    main_street  text;
    main_number  text;
    main_neighborhood  text;
    main_city  text;
    main_state  text;
begin
    insert  into  public.profiles  (
        id,
        full_name,
        email,
        whatsapp,
        cpf,
        preferred_locale
    )
    values  (
        new.id,
        coalesce(metadata_full_name,  split_part(new.email,  '@',  1),  'Cliente'),
        new.email,
        metadata_whatsapp,
        metadata_cpf,
        coalesce(nullif(trim(metadata  ->>  'preferred_locale'),  ''),  'pt-BR')
    )
    on  conflict  (id)  do  update
        set  email  =  excluded.email,
                full_name  =  coalesce(nullif(public.profiles.full_name,  ''),  excluded.full_name),
                whatsapp  =  coalesce(public.profiles.whatsapp,  excluded.whatsapp),
                cpf  =  coalesce(public.profiles.cpf,  excluded.cpf),
                updated_at  =  now();

    insert  into  public.user_roles  (user_id,  role,  is_primary,  is_active)
    values  (new.id,  'client',  true,  true)
    on  conflict  (user_id,  role)  do  update
        set  is_active  =  true,
                is_primary  =  true,
                updated_at  =  now();

    if  jsonb_typeof(main_address)  =  'object'  then
        main_zip  :=  public.normalize_digits(main_address  ->>  'zip_code');
        main_street  :=  nullif(trim(main_address  ->>  'street'),  '');
        main_number  :=  nullif(trim(main_address  ->>  'number'),  '');
        main_neighborhood  :=  nullif(trim(main_address  ->>  'neighborhood'),  '');
        main_city  :=  nullif(trim(main_address  ->>  'city'),  '');
        main_state  :=  upper(coalesce(trim(main_address  ->>  'state'),  ''));

        if  length(coalesce(main_zip,  ''))  =  8
              and  main_street  is  not  null
              and  main_number  is  not  null
              and  main_neighborhood  is  not  null
              and  main_city  is  not  null
              and  length(main_state)  =  2  then
            insert  into  public.addresses  (
                user_id,
                label,
                recipient_name,
                zip_code,
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                is_primary
            )
            values  (
                new.id,
                coalesce(nullif(trim(main_address  ->>  'label'),  ''),  'Principal'),
                coalesce(nullif(trim(main_address  ->>  'recipient_name'),  ''),  coalesce(metadata_full_name,  'Cliente')),
                main_zip,
                main_street,
                main_number,
                nullif(trim(main_address  ->>  'complement'),  ''),
                main_neighborhood,
                main_city,
                main_state,
                true
            );
        end  if;
    end  if;

    if  jsonb_typeof(extra_addresses)  =  'array'  then
        insert  into  public.addresses  (
            user_id,
            label,
            recipient_name,
            zip_code,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            is_primary
        )
        select
            new.id,
            coalesce(nullif(trim(item  ->>  'label'),  ''),  'Endereço  adicional'),
            coalesce(
                nullif(trim(item  ->>  'recipient_name'),  ''),
                coalesce(metadata_full_name,  'Cliente')
            ),
            public.normalize_digits(item  ->>  'zip_code'),
            trim(item  ->>  'street'),
            trim(item  ->>  'number'),
            nullif(trim(item  ->>  'complement'),  ''),
            trim(item  ->>  'neighborhood'),
            trim(item  ->>  'city'),
            upper(trim(item  ->>  'state')),
            false
        from  jsonb_array_elements(extra_addresses)  as  item
        where  jsonb_typeof(item)  =  'object'
            and  length(coalesce(public.normalize_digits(item  ->>  'zip_code'),  ''))  =  8
            and  nullif(trim(item  ->>  'street'),  '')  is  not  null
            and  nullif(trim(item  ->>  'number'),  '')  is  not  null
            and  nullif(trim(item  ->>  'neighborhood'),  '')  is  not  null
            and  nullif(trim(item  ->>  'city'),  '')  is  not  null
            and  length(upper(coalesce(trim(item  ->>  'state'),  '')))  =  2;
    end  if;

    return  new;
end;
$$;

create  or  replace  function  public.handle_auth_user_updated()
returns  trigger
language  plpgsql
security  definer
set  search_path  =  public
as  $$
begin
    if  new.email  is  distinct  from  old.email  then
        update  public.profiles
        set  email  =  new.email,
                updated_at  =  now()
        where  id  =  new.id;
    end  if;

    if  new.raw_user_meta_data  is  distinct  from  old.raw_user_meta_data  then
        update  public.profiles
        set  full_name  =  coalesce(nullif(trim(new.raw_user_meta_data  ->>  'full_name'),  ''),  full_name),
                whatsapp  =  coalesce(public.normalize_digits(new.raw_user_meta_data  ->>  'whatsapp'),  whatsapp),
                cpf  =  coalesce(public.normalize_digits(new.raw_user_meta_data  ->>  'cpf'),  cpf),
                updated_at  =  now()
        where  id  =  new.id;
    end  if;

    return  new;
end;
$$;

drop  trigger  if  exists  trg_profiles_updated_at  on  public.profiles;
create  trigger  trg_profiles_updated_at
before  update  on  public.profiles
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_user_roles_updated_at  on  public.user_roles;
create  trigger  trg_user_roles_updated_at
before  update  on  public.user_roles
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_addresses_updated_at  on  public.addresses;
create  trigger  trg_addresses_updated_at
before  update  on  public.addresses
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_brand_settings_updated_at  on  public.brand_settings;
create  trigger  trg_brand_settings_updated_at
before  update  on  public.brand_settings
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_internal_notifications_updated_at  on  public.internal_notifications;
create  trigger  trg_internal_notifications_updated_at
before  update  on  public.internal_notifications
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_auth_recovery_requests_updated_at  on  public.auth_recovery_requests;
create  trigger  trg_auth_recovery_requests_updated_at
before  update  on  public.auth_recovery_requests
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_on_auth_user_created  on  auth.users;
create  trigger  trg_on_auth_user_created
after  insert  on  auth.users
for  each  row
execute  function  public.handle_auth_user_created();

drop  trigger  if  exists  trg_on_auth_user_updated  on  auth.users;
create  trigger  trg_on_auth_user_updated
after  update  of  email,  raw_user_meta_data  on  auth.users
for  each  row
execute  function  public.handle_auth_user_updated();

alter  table  public.profiles  enable  row  level  security;
alter  table  public.user_roles  enable  row  level  security;
alter  table  public.addresses  enable  row  level  security;
alter  table  public.brand_settings  enable  row  level  security;
alter  table  public.internal_audit_logs  enable  row  level  security;
alter  table  public.internal_notifications  enable  row  level  security;
alter  table  public.maintenance_mode  enable  row  level  security;
alter  table  public.auth_recovery_requests  enable  row  level  security;

drop  policy  if  exists  profiles_select_own  on  public.profiles;
drop  policy  if  exists  profiles_update_own  on  public.profiles;
drop  policy  if  exists  profiles_select_self_or_internal  on  public.profiles;
create  policy  profiles_select_self_or_internal
on  public.profiles
for  select
using  (
    id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  profiles_insert_self_or_admin  on  public.profiles;
create  policy  profiles_insert_self_or_admin
on  public.profiles
for  insert
with  check  (
    id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  profiles_update_self_or_admin  on  public.profiles;
create  policy  profiles_update_self_or_admin
on  public.profiles
for  update
using  (
    id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
)
with  check  (
    id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  profiles_delete_admin  on  public.profiles;
create  policy  profiles_delete_admin
on  public.profiles
for  delete
using  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  user_roles_select_own_or_admin  on  public.user_roles;
create  policy  user_roles_select_own_or_admin
on  public.user_roles
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  user_roles_insert_admin  on  public.user_roles;
create  policy  user_roles_insert_admin
on  public.user_roles
for  insert
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  user_roles_update_admin  on  public.user_roles;
create  policy  user_roles_update_admin
on  public.user_roles
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  user_roles_delete_admin  on  public.user_roles;
create  policy  user_roles_delete_admin
on  public.user_roles
for  delete
using  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  addresses_select_own_or_internal  on  public.addresses;
create  policy  addresses_select_own_or_internal
on  public.addresses
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  addresses_insert_own_or_internal  on  public.addresses;
create  policy  addresses_insert_own_or_internal
on  public.addresses
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  addresses_update_own_or_internal  on  public.addresses;
create  policy  addresses_update_own_or_internal
on  public.addresses
for  update
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
)
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  addresses_delete_own_or_internal  on  public.addresses;
create  policy  addresses_delete_own_or_internal
on  public.addresses
for  delete
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  brand_settings_select_public  on  public.brand_settings;
create  policy  brand_settings_select_public
on  public.brand_settings
for  select
using  (true);

drop  policy  if  exists  brand_settings_insert_admin  on  public.brand_settings;
create  policy  brand_settings_insert_admin
on  public.brand_settings
for  insert
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  brand_settings_update_admin  on  public.brand_settings;
create  policy  brand_settings_update_admin
on  public.brand_settings
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  brand_settings_delete_admin  on  public.brand_settings;
create  policy  brand_settings_delete_admin
on  public.brand_settings
for  delete
using  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  internal_audit_logs_select_admin_finance  on  public.internal_audit_logs;
create  policy  internal_audit_logs_select_admin_finance
on  public.internal_audit_logs
for  select
using  (public.has_any_role(array['admin',  'finance']::public.app_role[]));

drop  policy  if  exists  internal_audit_logs_insert_authenticated  on  public.internal_audit_logs;
create  policy  internal_audit_logs_insert_authenticated
on  public.internal_audit_logs
for  insert
with  check  (auth.uid()  is  not  null);

drop  policy  if  exists  internal_notifications_select_target  on  public.internal_notifications;
create  policy  internal_notifications_select_target
on  public.internal_notifications
for  select
using  (
    public.has_role('admin'::public.app_role)
    or  is_global
    or  recipient_user_id  =  auth.uid()
    or  (recipient_role  is  not  null  and  public.has_role(recipient_role))
);

drop  policy  if  exists  internal_notifications_insert_internal  on  public.internal_notifications;
create  policy  internal_notifications_insert_internal
on  public.internal_notifications
for  insert
with  check  (
    public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  internal_notifications_update_target_or_admin  on  public.internal_notifications;
create  policy  internal_notifications_update_target_or_admin
on  public.internal_notifications
for  update
using  (
    public.has_role('admin'::public.app_role)
    or  recipient_user_id  =  auth.uid()
)
with  check  (
    public.has_role('admin'::public.app_role)
    or  recipient_user_id  =  auth.uid()
);

drop  policy  if  exists  internal_notifications_delete_admin  on  public.internal_notifications;
create  policy  internal_notifications_delete_admin
on  public.internal_notifications
for  delete
using  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  maintenance_mode_select_public  on  public.maintenance_mode;
create  policy  maintenance_mode_select_public
on  public.maintenance_mode
for  select
using  (true);

drop  policy  if  exists  maintenance_mode_insert_admin  on  public.maintenance_mode;
create  policy  maintenance_mode_insert_admin
on  public.maintenance_mode
for  insert
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  maintenance_mode_update_admin  on  public.maintenance_mode;
create  policy  maintenance_mode_update_admin
on  public.maintenance_mode
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  maintenance_mode_delete_admin  on  public.maintenance_mode;
create  policy  maintenance_mode_delete_admin
on  public.maintenance_mode
for  delete
using  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  auth_recovery_requests_select_owner_or_admin  on  public.auth_recovery_requests;
create  policy  auth_recovery_requests_select_owner_or_admin
on  public.auth_recovery_requests
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  auth_recovery_requests_insert_owner_or_admin  on  public.auth_recovery_requests;
create  policy  auth_recovery_requests_insert_owner_or_admin
on  public.auth_recovery_requests
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  auth_recovery_requests_update_owner_or_admin  on  public.auth_recovery_requests;
create  policy  auth_recovery_requests_update_owner_or_admin
on  public.auth_recovery_requests
for  update
using  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
)
with  check  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  auth_recovery_requests_delete_admin  on  public.auth_recovery_requests;
create  policy  auth_recovery_requests_delete_admin
on  public.auth_recovery_requests
for  delete
using  (public.has_role('admin'::public.app_role));

grant  usage  on  schema  public  to  anon,  authenticated;

grant  select  on  public.brand_settings  to  anon;

grant  select  on  public.profiles  to  authenticated;
grant  insert,  update  on  public.profiles  to  authenticated;

grant  select  on  public.user_roles  to  authenticated;
grant  insert,  update,  delete  on  public.user_roles  to  authenticated;

grant  usage,  select  on  sequence  public.user_roles_id_seq  to  authenticated;

grant  select,  insert,  update,  delete  on  public.addresses  to  authenticated;

grant  select,  insert,  update,  delete  on  public.brand_settings  to  authenticated;

grant  select,  insert  on  public.internal_audit_logs  to  authenticated;
grant  usage,  select  on  sequence  public.internal_audit_logs_id_seq  to  authenticated;

grant  select,  insert,  update,  delete  on  public.internal_notifications  to  authenticated;

grant  select,  insert,  update,  delete  on  public.maintenance_mode  to  authenticated;

grant  select,  insert,  update,  delete  on  public.auth_recovery_requests  to  authenticated;

grant  execute  on  function  public.current_user_role()  to  authenticated;
grant  execute  on  function  public.has_any_role(public.app_role[])  to  authenticated;
grant  execute  on  function  public.has_role(public.app_role)  to  authenticated;
