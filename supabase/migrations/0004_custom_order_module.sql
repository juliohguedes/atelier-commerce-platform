--  Tailored  order  module:  custom  requests,  estimate  flow,  status  tracking  and  attachments

create  extension  if  not  exists  pgcrypto;
create  extension  if  not  exists  citext;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_audience'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_audience  as  enum  ('feminino',  'masculino');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_production_mode'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_production_mode  as  enum  ('larga_escala',  'sob_medida');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_request_type'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_request_type  as  enum  ('referencia_imagem',  'criacao_exclusiva');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_complexity'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_complexity  as  enum  ('basica',  'intermediaria',  'avancada',  'premium');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_fabric_tier'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_fabric_tier  as  enum  ('simples',  'intermediario',  'nobre',  'outros');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_status  as  enum  (
            'draft',
            'pedido_recebido',
            'em_analise_inicial',
            'em_avaliacao_pela_equipe',
            'aguardando_contato_via_whatsapp',
            'aguardando_confirmacao_da_cliente',
            'pedido_aprovado_para_orcamento_final',
            'pedido_encerrado',
            'cancelado_pela_cliente',
            'cancelado_interno'
        );
    end  if;
end
$$;

create  table  if  not  exists  public.custom_orders  (
    id  bigint  generated  by  default  as  identity  primary  key,
    public_id  uuid  not  null  default  gen_random_uuid(),
    protocol_code  text  generated  always  as  ('PED-'  ||  lpad(id::text,  6,  '0'))  stored,
    user_id  uuid  references  auth.users  (id)  on  delete  set  null,

    audience  public.custom_order_audience  not  null,
    production_mode  public.custom_order_production_mode  not  null,
    request_type  public.custom_order_request_type  not  null,

    piece_type  text  not  null,
    piece_type_other  text,

    size_standard  text,
    size_custom  text,
    modeling  text,
    piece_length  text,

    measurements  jsonb  not  null  default  '{}'::jsonb,

    reference_notes  text,
    exclusive_creation_details  jsonb  not  null  default  '{}'::jsonb,

    fabric_type  text  not  null,
    fabric_tier  public.custom_order_fabric_tier  not  null  default  'simples',
    notions  text[]  not  null  default  '{}',
    notions_total  integer  not  null  default  0,
    complexity  public.custom_order_complexity  not  null  default  'basica',

    desired_deadline  date,
    desired_deadline_reason  text,

    visual_notes  text,
    final_notes  text,

    contact_full_name  text,
    contact_email  citext,
    contact_whatsapp  text,

    terms_accepted  boolean  not  null  default  false,
    estimate_acknowledged  boolean  not  null  default  false,

    estimated_price  numeric(10,  2)  not  null  default  0,
    estimate_breakdown  jsonb  not  null  default  '{}'::jsonb,

    status  public.custom_order_status  not  null  default  'draft',
    submitted_at  timestamptz,
    payment_confirmed_at  timestamptz,
    cancelled_at  timestamptz,
    cancelled_reason  text,

    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),

    unique  (public_id),
    unique  (protocol_code)
);

create  index  if  not  exists  custom_orders_public_id_idx
    on  public.custom_orders  (public_id);

create  index  if  not  exists  custom_orders_protocol_code_idx
    on  public.custom_orders  (protocol_code);

create  index  if  not  exists  custom_orders_user_id_idx
    on  public.custom_orders  (user_id);

create  index  if  not  exists  custom_orders_status_idx
    on  public.custom_orders  (status);

create  table  if  not  exists  public.custom_order_attachments  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  not  null  references  public.custom_orders  (id)  on  delete  cascade,
    storage_bucket  text  not  null  default  'custom-orders',
    storage_path  text  not  null,
    original_file_name  text  not  null,
    mime_type  text  not  null,
    file_size_bytes  bigint  not  null,
    created_at  timestamptz  not  null  default  now(),

    unique  (storage_path)
);

create  index  if  not  exists  custom_order_attachments_order_id_idx
    on  public.custom_order_attachments  (order_id);

create  table  if  not  exists  public.custom_order_status_history  (
    id  bigint  generated  by  default  as  identity  primary  key,
    order_id  bigint  not  null  references  public.custom_orders  (id)  on  delete  cascade,
    status  public.custom_order_status  not  null,
    note  text,
    changed_by_user_id  uuid  references  auth.users  (id)  on  delete  set  null,
    is_system  boolean  not  null  default  true,
    changed_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  custom_order_status_history_order_id_idx
    on  public.custom_order_status_history  (order_id,  changed_at  desc);

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_piece_type_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_piece_type_check
            check  (
                piece_type  =  any  (
                    array[
                        'blazer',
                        'blusa',
                        'calca',
                        'camisa',
                        'casaco',
                        'colete',
                        'conjunto',
                        'corset',
                        'jaqueta',
                        'macacao',
                        'outros',
                        'saia',
                        'short',
                        'sobretudo',
                        'terno',
                        'vestido'
                    ]
                )
            );
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_size_standard_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_size_standard_check
            check  (
                size_standard  is  null
                or  size_standard  =  any  (array['PP',  'P',  'M',  'G',  'GG',  'OUTROS'])
            );
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_modeling_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_modeling_check
            check  (
                modeling  is  null
                or  modeling  =  any  (array['justa',  'padrao',  'solta',  'oversized'])
            );
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_notions_total_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_notions_total_check
            check  (notions_total  >=  0);
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_estimated_price_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_estimated_price_check
            check  (estimated_price  >=  0);
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_orders_contact_whatsapp_check'
    )  then
        alter  table  public.custom_orders
            add  constraint  custom_orders_contact_whatsapp_check
            check  (contact_whatsapp  is  null  or  contact_whatsapp  ~  '^[0-9]{10,13}$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'custom_order_attachments_file_size_check'
    )  then
        alter  table  public.custom_order_attachments
            add  constraint  custom_order_attachments_file_size_check
            check  (file_size_bytes  >  0);
    end  if;
end
$$;

create  or  replace  function  public.handle_custom_order_status_history()
returns  trigger
language  plpgsql
security  definer
set  search_path  =  public
as  $$
begin
    if  tg_op  =  'INSERT'  then
        insert  into  public.custom_order_status_history  (order_id,  status,  note,  changed_by_user_id,  is_system)
        values  (new.id,  new.status,  'Status  inicial  do  pedido.',  auth.uid(),  true);

        return  new;
    end  if;

    if  tg_op  =  'UPDATE'  and  new.status  is  distinct  from  old.status  then
        insert  into  public.custom_order_status_history  (order_id,  status,  note,  changed_by_user_id,  is_system)
        values  (new.id,  new.status,  'Status  atualizado  automaticamente.',  auth.uid(),  true);
    end  if;

    return  new;
end;
$$;

drop  trigger  if  exists  trg_custom_orders_updated_at  on  public.custom_orders;
create  trigger  trg_custom_orders_updated_at
before  update  on  public.custom_orders
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_custom_orders_status_history_insert  on  public.custom_orders;
create  trigger  trg_custom_orders_status_history_insert
after  insert  on  public.custom_orders
for  each  row
execute  function  public.handle_custom_order_status_history();

drop  trigger  if  exists  trg_custom_orders_status_history_update  on  public.custom_orders;
create  trigger  trg_custom_orders_status_history_update
after  update  of  status  on  public.custom_orders
for  each  row
execute  function  public.handle_custom_order_status_history();

alter  table  public.custom_orders  enable  row  level  security;
alter  table  public.custom_order_attachments  enable  row  level  security;
alter  table  public.custom_order_status_history  enable  row  level  security;

drop  policy  if  exists  custom_orders_select_own_or_internal  on  public.custom_orders;
create  policy  custom_orders_select_own_or_internal
on  public.custom_orders
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_orders_insert_public_or_authenticated  on  public.custom_orders;
create  policy  custom_orders_insert_public_or_authenticated
on  public.custom_orders
for  insert
with  check  (
    (auth.uid()  is  null  and  user_id  is  null)
    or  (auth.uid()  is  not  null  and  (user_id  =  auth.uid()  or  user_id  is  null))
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_orders_update_owner_or_internal  on  public.custom_orders;
create  policy  custom_orders_update_owner_or_internal
on  public.custom_orders
for  update
using  (
    (
        user_id  =  auth.uid()
        and  (
            payment_confirmed_at  is  null
            and  status  =  any  (
                array[
                    'draft'::public.custom_order_status,
                    'pedido_recebido'::public.custom_order_status,
                    'em_analise_inicial'::public.custom_order_status,
                    'em_avaliacao_pela_equipe'::public.custom_order_status,
                    'aguardando_contato_via_whatsapp'::public.custom_order_status,
                    'aguardando_confirmacao_da_cliente'::public.custom_order_status,
                    'pedido_aprovado_para_orcamento_final'::public.custom_order_status
                ]
            )
        )
    )
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
)
with  check  (
    (
        user_id  =  auth.uid()
        and  (
            payment_confirmed_at  is  null
            and  status  =  any  (
                array[
                    'draft'::public.custom_order_status,
                    'pedido_recebido'::public.custom_order_status,
                    'em_analise_inicial'::public.custom_order_status,
                    'em_avaliacao_pela_equipe'::public.custom_order_status,
                    'aguardando_contato_via_whatsapp'::public.custom_order_status,
                    'aguardando_confirmacao_da_cliente'::public.custom_order_status,
                    'pedido_aprovado_para_orcamento_final'::public.custom_order_status
                ]
            )
        )
    )
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_orders_delete_internal  on  public.custom_orders;
create  policy  custom_orders_delete_internal
on  public.custom_orders
for  delete
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  custom_order_attachments_select_own_or_internal  on  public.custom_order_attachments;
create  policy  custom_order_attachments_select_own_or_internal
on  public.custom_order_attachments
for  select
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_attachments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_attachments_insert_own_or_internal  on  public.custom_order_attachments;
create  policy  custom_order_attachments_insert_own_or_internal
on  public.custom_order_attachments
for  insert
with  check  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_attachments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  o.user_id  is  null
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_attachments_delete_own_or_internal  on  public.custom_order_attachments;
create  policy  custom_order_attachments_delete_own_or_internal
on  public.custom_order_attachments
for  delete
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_attachments.order_id
            and  (
                (o.user_id  =  auth.uid()  and  o.payment_confirmed_at  is  null)
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_status_history_select_own_or_internal  on  public.custom_order_status_history;
create  policy  custom_order_status_history_select_own_or_internal
on  public.custom_order_status_history
for  select
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_status_history.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_status_history_insert_internal  on  public.custom_order_status_history;
create  policy  custom_order_status_history_insert_internal
on  public.custom_order_status_history
for  insert
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

grant  select,  insert,  update  on  public.custom_orders  to  anon,  authenticated;
grant  usage,  select  on  sequence  public.custom_orders_id_seq  to  anon,  authenticated;

grant  select,  insert,  delete  on  public.custom_order_attachments  to  anon,  authenticated;

grant  select  on  public.custom_order_status_history  to  authenticated;

insert  into  storage.buckets  (id,  name,  public,  file_size_limit,  allowed_mime_types)
values  (
    'custom-orders',
    'custom-orders',
    false,
    15728640,
    array['image/jpeg',  'image/png',  'image/webp',  'application/pdf']
)
on  conflict  (id)  do  update
set  file_size_limit  =  excluded.file_size_limit,
        allowed_mime_types  =  excluded.allowed_mime_types;

drop  policy  if  exists  custom_orders_upload_anon_authenticated  on  storage.objects;
create  policy  custom_orders_upload_anon_authenticated
on  storage.objects
for  insert
to  anon,  authenticated
with  check  (
    bucket_id  =  'custom-orders'
    and  (storage.foldername(name))[1]  =  'orders'
);

drop  policy  if  exists  custom_orders_read_internal  on  storage.objects;
create  policy  custom_orders_read_internal
on  storage.objects
for  select
to  authenticated
using  (
    bucket_id  =  'custom-orders'
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_orders_delete_internal  on  storage.objects;
create  policy  custom_orders_delete_internal
on  storage.objects
for  delete
to  authenticated
using  (
    bucket_id  =  'custom-orders'
    and  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);
