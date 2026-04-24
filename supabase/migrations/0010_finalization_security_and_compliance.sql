--  Finalization  phase:  operational  security,  compliance  records  and  backup  structure

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'internal_access_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.internal_access_status  as  enum  (
            'pending',
            'verified',
            'expired',
            'revoked'
        );
    end  if;
end
$$;

create  table  if  not  exists  public.internal_access_challenges  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    role  public.app_role  not  null,
    destination_email  citext  not  null,
    code_hash  text  not  null,
    attempts  integer  not  null  default  0,
    status  public.internal_access_status  not  null  default  'pending',
    expires_at  timestamptz  not  null,
    verified_at  timestamptz,
    session_token  text,
    session_expires_at  timestamptz,
    revoked_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    check  (role  =  any  (array['admin',  'finance',  'sales_stock']::public.app_role[])),
    check  (attempts  >=  0  and  attempts  <=  10)
);

create  index  if  not  exists  internal_access_challenges_user_idx
    on  public.internal_access_challenges  (user_id,  role,  created_at  desc);

create  index  if  not  exists  internal_access_challenges_status_idx
    on  public.internal_access_challenges  (status,  expires_at  asc);

create  unique  index  if  not  exists  internal_access_challenges_session_token_unique_idx
    on  public.internal_access_challenges  (session_token)
    where  session_token  is  not  null;

create  table  if  not  exists  public.system_backups  (
    id  uuid  primary  key  default  gen_random_uuid(),
    context_area  text  not  null,
    entity_table  text  not  null,
    entity_id  text,
    backup_reason  text  not  null,
    snapshot  jsonb  not  null  default  '{}'::jsonb,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  system_backups_entity_idx
    on  public.system_backups  (entity_table,  entity_id,  created_at  desc);

create  index  if  not  exists  system_backups_created_at_idx
    on  public.system_backups  (created_at  desc);

create  table  if  not  exists  public.consent_records  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  references  auth.users  (id)  on  delete  set  null,
    email  citext,
    consent_slug  text  not  null,
    consent_version  text  not  null,
    accepted  boolean  not  null  default  true,
    accepted_at  timestamptz  not  null  default  now(),
    context_table  text,
    context_id  text,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    created_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  consent_records_user_idx
    on  public.consent_records  (user_id,  created_at  desc);

create  index  if  not  exists  consent_records_email_idx
    on  public.consent_records  (email,  created_at  desc);

create  index  if  not  exists  consent_records_slug_idx
    on  public.consent_records  (consent_slug,  created_at  desc);

drop  trigger  if  exists  trg_internal_access_challenges_updated_at  on  public.internal_access_challenges;
create  trigger  trg_internal_access_challenges_updated_at
before  update  on  public.internal_access_challenges
for  each  row
execute  function  public.handle_updated_at();

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
    accepted_terms  boolean  :=  coalesce((metadata  ->>  'accepted_terms')::boolean,  false);
    accepted_privacy_policy  boolean  :=  coalesce((metadata  ->>  'accepted_privacy_policy')::boolean,  false);
    terms_version  text  :=  coalesce(nullif(trim(metadata  ->>  'terms_version'),  ''),  '2026-04');
    privacy_policy_version  text  :=  coalesce(nullif(trim(metadata  ->>  'privacy_policy_version'),  ''),  '2026-04');
    terms_accepted_at  timestamptz  :=  coalesce(nullif(metadata  ->>  'terms_accepted_at',  '')::timestamptz,  now());
    privacy_accepted_at  timestamptz  :=  coalesce(nullif(metadata  ->>  'privacy_policy_accepted_at',  '')::timestamptz,  now());
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

    if  accepted_terms  then
        insert  into  public.consent_records  (
            user_id,
            email,
            consent_slug,
            consent_version,
            accepted,
            accepted_at,
            context_table,
            context_id,
            metadata
        )
        values  (
            new.id,
            new.email,
            'terms_and_conditions',
            terms_version,
            true,
            terms_accepted_at,
            'profiles',
            new.id::text,
            jsonb_build_object('origin',  'auth_signup')
        );
    end  if;

    if  accepted_privacy_policy  then
        insert  into  public.consent_records  (
            user_id,
            email,
            consent_slug,
            consent_version,
            accepted,
            accepted_at,
            context_table,
            context_id,
            metadata
        )
        values  (
            new.id,
            new.email,
            'privacy_policy',
            privacy_policy_version,
            true,
            privacy_accepted_at,
            'profiles',
            new.id::text,
            jsonb_build_object('origin',  'auth_signup')
        );
    end  if;

    return  new;
end;
$$;

alter  table  public.internal_access_challenges  enable  row  level  security;
alter  table  public.system_backups  enable  row  level  security;
alter  table  public.consent_records  enable  row  level  security;

drop  policy  if  exists  internal_access_challenges_select_own  on  public.internal_access_challenges;
create  policy  internal_access_challenges_select_own
on  public.internal_access_challenges
for  select
using  (
    user_id  =  auth.uid()
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  internal_access_challenges_insert_own  on  public.internal_access_challenges;
create  policy  internal_access_challenges_insert_own
on  public.internal_access_challenges
for  insert
with  check  (
    user_id  =  auth.uid()
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  internal_access_challenges_update_own  on  public.internal_access_challenges;
create  policy  internal_access_challenges_update_own
on  public.internal_access_challenges
for  update
using  (
    user_id  =  auth.uid()
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
)
with  check  (
    user_id  =  auth.uid()
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  system_backups_select_internal  on  public.system_backups;
create  policy  system_backups_select_internal
on  public.system_backups
for  select
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  system_backups_insert_internal  on  public.system_backups;
create  policy  system_backups_insert_internal
on  public.system_backups
for  insert
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  consent_records_select_self_or_admin  on  public.consent_records;
create  policy  consent_records_select_self_or_admin
on  public.consent_records
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  consent_records_insert_self_or_internal  on  public.consent_records;
create  policy  consent_records_insert_self_or_internal
on  public.consent_records
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

grant  select,  insert,  update  on  public.internal_access_challenges  to  authenticated;
grant  select,  insert  on  public.system_backups  to  authenticated;
grant  select,  insert  on  public.consent_records  to  authenticated;
