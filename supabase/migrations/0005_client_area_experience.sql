--  Client  area  module:  tailored-order  follow-up,  store  history,  reviews  and  self-service  actions

create  extension  if  not  exists  pgcrypto;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_payment_method'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_payment_method  as  enum  ('pix',  'cartao');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_payment_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_payment_status  as  enum  (
            'pending',
            'awaiting_payment',
            'approved',
            'failed',
            'cancelled',
            'refunded'
        );
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'custom_order_delivery_mode'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.custom_order_delivery_mode  as  enum  ('entrega',  'retirada');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'client_appointment_type'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.client_appointment_type  as  enum  (
            'tirar_medidas',
            'alinhamento_pedido',
            'retirada'
        );
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'client_appointment_mode'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.client_appointment_mode  as  enum  ('online',  'presencial');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'client_appointment_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.client_appointment_status  as  enum  (
            'solicitado',
            'confirmado',
            'concluido',
            'cancelado'
        );
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'store_order_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.store_order_status  as  enum  (
            'pedido_recebido',
            'pagamento_aprovado',
            'em_separacao',
            'pronto_para_envio',
            'enviado',
            'entregue',
            'cancelado'
        );
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'review_target_type'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.review_target_type  as  enum  ('custom_order',  'store_order');
    end  if;
end
$$;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'account_deletion_status'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.account_deletion_status  as  enum  (
            'pending',
            'in_review',
            'approved',
            'rejected',
            'completed'
        );
    end  if;
end
$$;

create  table  if  not  exists  public.custom_order_design_options  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  not  null  references  public.custom_orders  (id)  on  delete  cascade,
    option_code  text  not  null,
    title  text  not  null,
    preview_image_url  text,
    reference_pdf_url  text,
    team_note  text,
    is_visible_to_client  boolean  not  null  default  true,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (order_id,  option_code)
);

create  index  if  not  exists  custom_order_design_options_order_id_idx
    on  public.custom_order_design_options  (order_id,  created_at  desc);

create  table  if  not  exists  public.custom_order_final_quotes  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  not  null  unique  references  public.custom_orders  (id)  on  delete  cascade,
    currency_code  text  not  null  default  'BRL',
    final_amount  numeric(10,  2)  not  null,
    quote_summary  text  not  null,
    quote_breakdown  jsonb  not  null  default  '{}'::jsonb,
    available_at  timestamptz  not  null  default  now(),
    approved_by_client_at  timestamptz,
    approval_confirmation_seen_at  timestamptz,
    selected_payment_method  public.custom_order_payment_method,
    payment_status  public.custom_order_payment_status  not  null  default  'pending',
    payment_reference  text,
    payment_confirmed_at  timestamptz,
    production_started_at  timestamptz,
    ready_to_ship_at  timestamptz,
    shipped_at  timestamptz,
    delivered_at  timestamptz,
    updated_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    check  (final_amount  >  0)
);

create  index  if  not  exists  custom_order_final_quotes_order_id_idx
    on  public.custom_order_final_quotes  (order_id);

create  table  if  not  exists  public.custom_order_fulfillments  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  not  null  unique  references  public.custom_orders  (id)  on  delete  cascade,
    delivery_mode  public.custom_order_delivery_mode,
    delivery_address_snapshot  jsonb  not  null  default  '{}'::jsonb,
    tracking_code  text,
    tracking_link  text,
    pickup_address  text,
    pickup_instructions  text,
    notified_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  custom_order_fulfillments_order_id_idx
    on  public.custom_order_fulfillments  (order_id);

create  table  if  not  exists  public.custom_order_appointments  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  references  public.custom_orders  (id)  on  delete  set  null,
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    appointment_type  public.client_appointment_type  not  null,
    attendance_mode  public.client_appointment_mode  not  null,
    scheduled_for  timestamptz  not  null,
    status  public.client_appointment_status  not  null  default  'solicitado',
    notes  text,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  custom_order_appointments_user_id_idx
    on  public.custom_order_appointments  (user_id,  scheduled_for  desc);

create  table  if  not  exists  public.store_orders  (
    id  bigint  generated  by  default  as  identity  primary  key,
    public_id  uuid  not  null  default  gen_random_uuid(),
    order_number  text  generated  always  as  ('LOJ-'  ||  lpad(id::text,  6,  '0'))  stored,
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    status  public.store_order_status  not  null  default  'pedido_recebido',
    payment_method  public.custom_order_payment_method,
    payment_status  public.custom_order_payment_status  not  null  default  'pending',
    subtotal  numeric(10,  2)  not  null  default  0,
    shipping_cost  numeric(10,  2)  not  null  default  0,
    total_amount  numeric(10,  2)  not  null  default  0,
    tracking_code  text,
    tracking_link  text,
    shipped_at  timestamptz,
    delivered_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (public_id),
    unique  (order_number),
    check  (subtotal  >=  0),
    check  (shipping_cost  >=  0),
    check  (total_amount  >=  0)
);

create  index  if  not  exists  store_orders_user_id_idx
    on  public.store_orders  (user_id,  created_at  desc);

create  table  if  not  exists  public.store_order_items  (
    id  uuid  primary  key  default  gen_random_uuid(),
    order_id  bigint  not  null  references  public.store_orders  (id)  on  delete  cascade,
    sku  text  not  null,
    product_name  text  not  null,
    variant_description  text,
    quantity  integer  not  null,
    unit_price  numeric(10,  2)  not  null,
    line_total  numeric(10,  2)  generated  always  as  (quantity  *  unit_price)  stored,
    created_at  timestamptz  not  null  default  now(),
    check  (quantity  >  0),
    check  (unit_price  >=  0)
);

create  index  if  not  exists  store_order_items_order_id_idx
    on  public.store_order_items  (order_id);

create  table  if  not  exists  public.client_reviews  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    target_type  public.review_target_type  not  null,
    custom_order_id  bigint  references  public.custom_orders  (id)  on  delete  set  null,
    store_order_id  bigint  references  public.store_orders  (id)  on  delete  set  null,
    rating  smallint  not  null,
    headline  text,
    comment  text  not  null,
    is_public  boolean  not  null  default  true,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    check  (rating  between  1  and  5),
    check  (
        (
            target_type  =  'custom_order'::public.review_target_type
            and  custom_order_id  is  not  null
            and  store_order_id  is  null
        )
        or  (
            target_type  =  'store_order'::public.review_target_type
            and  store_order_id  is  not  null
            and  custom_order_id  is  null
        )
    )
);

create  unique  index  if  not  exists  client_reviews_custom_order_unique_idx
    on  public.client_reviews  (user_id,  custom_order_id)
    where  target_type  =  'custom_order'::public.review_target_type;

create  unique  index  if  not  exists  client_reviews_store_order_unique_idx
    on  public.client_reviews  (user_id,  store_order_id)
    where  target_type  =  'store_order'::public.review_target_type;

create  index  if  not  exists  client_reviews_user_id_idx
    on  public.client_reviews  (user_id,  created_at  desc);

create  table  if  not  exists  public.account_deletion_requests  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    reason  text  not  null,
    status  public.account_deletion_status  not  null  default  'pending',
    requested_at  timestamptz  not  null  default  now(),
    resolved_at  timestamptz,
    resolved_by  uuid  references  auth.users  (id)  on  delete  set  null,
    resolution_note  text,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  index  if  not  exists  account_deletion_requests_user_id_idx
    on  public.account_deletion_requests  (user_id,  requested_at  desc);

create  unique  index  if  not  exists  account_deletion_requests_pending_unique_idx
    on  public.account_deletion_requests  (user_id)
    where  status  in  (
        'pending'::public.account_deletion_status,
        'in_review'::public.account_deletion_status
    );

drop  trigger  if  exists  trg_custom_order_design_options_updated_at  on  public.custom_order_design_options;
create  trigger  trg_custom_order_design_options_updated_at
before  update  on  public.custom_order_design_options
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_custom_order_final_quotes_updated_at  on  public.custom_order_final_quotes;
create  trigger  trg_custom_order_final_quotes_updated_at
before  update  on  public.custom_order_final_quotes
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_custom_order_fulfillments_updated_at  on  public.custom_order_fulfillments;
create  trigger  trg_custom_order_fulfillments_updated_at
before  update  on  public.custom_order_fulfillments
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_custom_order_appointments_updated_at  on  public.custom_order_appointments;
create  trigger  trg_custom_order_appointments_updated_at
before  update  on  public.custom_order_appointments
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_orders_updated_at  on  public.store_orders;
create  trigger  trg_store_orders_updated_at
before  update  on  public.store_orders
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_client_reviews_updated_at  on  public.client_reviews;
create  trigger  trg_client_reviews_updated_at
before  update  on  public.client_reviews
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_account_deletion_requests_updated_at  on  public.account_deletion_requests;
create  trigger  trg_account_deletion_requests_updated_at
before  update  on  public.account_deletion_requests
for  each  row
execute  function  public.handle_updated_at();

alter  table  public.custom_order_design_options  enable  row  level  security;
alter  table  public.custom_order_final_quotes  enable  row  level  security;
alter  table  public.custom_order_fulfillments  enable  row  level  security;
alter  table  public.custom_order_appointments  enable  row  level  security;
alter  table  public.store_orders  enable  row  level  security;
alter  table  public.store_order_items  enable  row  level  security;
alter  table  public.client_reviews  enable  row  level  security;
alter  table  public.account_deletion_requests  enable  row  level  security;

drop  policy  if  exists  custom_order_design_options_select_owner_or_internal  on  public.custom_order_design_options;
create  policy  custom_order_design_options_select_owner_or_internal
on  public.custom_order_design_options
for  select
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_design_options.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_design_options_manage_internal  on  public.custom_order_design_options;
create  policy  custom_order_design_options_manage_internal
on  public.custom_order_design_options
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  custom_order_final_quotes_select_owner_or_internal  on  public.custom_order_final_quotes;
create  policy  custom_order_final_quotes_select_owner_or_internal
on  public.custom_order_final_quotes
for  select
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_final_quotes.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_final_quotes_insert_internal  on  public.custom_order_final_quotes;
create  policy  custom_order_final_quotes_insert_internal
on  public.custom_order_final_quotes
for  insert
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  custom_order_final_quotes_update_owner_or_internal  on  public.custom_order_final_quotes;
create  policy  custom_order_final_quotes_update_owner_or_internal
on  public.custom_order_final_quotes
for  update
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_final_quotes.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
)
with  check  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_final_quotes.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_fulfillments_select_owner_or_internal  on  public.custom_order_fulfillments;
create  policy  custom_order_fulfillments_select_owner_or_internal
on  public.custom_order_fulfillments
for  select
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_fulfillments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_fulfillments_insert_owner_or_internal  on  public.custom_order_fulfillments;
create  policy  custom_order_fulfillments_insert_owner_or_internal
on  public.custom_order_fulfillments
for  insert
with  check  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_fulfillments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_fulfillments_update_owner_or_internal  on  public.custom_order_fulfillments;
create  policy  custom_order_fulfillments_update_owner_or_internal
on  public.custom_order_fulfillments
for  update
using  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_fulfillments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
)
with  check  (
    exists  (
        select  1
        from  public.custom_orders  o
        where  o.id  =  custom_order_fulfillments.order_id
            and  (
                o.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  custom_order_appointments_select_owner_or_internal  on  public.custom_order_appointments;
create  policy  custom_order_appointments_select_owner_or_internal
on  public.custom_order_appointments
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_order_appointments_insert_owner_or_internal  on  public.custom_order_appointments;
create  policy  custom_order_appointments_insert_owner_or_internal
on  public.custom_order_appointments
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  custom_order_appointments_update_owner_or_internal  on  public.custom_order_appointments;
create  policy  custom_order_appointments_update_owner_or_internal
on  public.custom_order_appointments
for  update
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
)
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_orders_select_owner_or_internal  on  public.store_orders;
create  policy  store_orders_select_owner_or_internal
on  public.store_orders
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_orders_manage_internal  on  public.store_orders;
create  policy  store_orders_manage_internal
on  public.store_orders
for  all
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_order_items_select_owner_or_internal  on  public.store_order_items;
create  policy  store_order_items_select_owner_or_internal
on  public.store_order_items
for  select
using  (
    exists  (
        select  1
        from  public.store_orders  so
        where  so.id  =  store_order_items.order_id
            and  (
                so.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  store_order_items_manage_internal  on  public.store_order_items;
create  policy  store_order_items_manage_internal
on  public.store_order_items
for  all
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  client_reviews_select_owner_or_internal  on  public.client_reviews;
create  policy  client_reviews_select_owner_or_internal
on  public.client_reviews
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  client_reviews_insert_owner_or_internal  on  public.client_reviews;
create  policy  client_reviews_insert_owner_or_internal
on  public.client_reviews
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  client_reviews_update_owner_or_internal  on  public.client_reviews;
create  policy  client_reviews_update_owner_or_internal
on  public.client_reviews
for  update
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
)
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  client_reviews_delete_owner_or_internal  on  public.client_reviews;
create  policy  client_reviews_delete_owner_or_internal
on  public.client_reviews
for  delete
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  account_deletion_requests_select_owner_or_internal  on  public.account_deletion_requests;
create  policy  account_deletion_requests_select_owner_or_internal
on  public.account_deletion_requests
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  account_deletion_requests_insert_owner_or_admin  on  public.account_deletion_requests;
create  policy  account_deletion_requests_insert_owner_or_admin
on  public.account_deletion_requests
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_role('admin'::public.app_role)
);

drop  policy  if  exists  account_deletion_requests_update_admin  on  public.account_deletion_requests;
create  policy  account_deletion_requests_update_admin
on  public.account_deletion_requests
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

grant  select  on  public.custom_order_design_options  to  authenticated;
grant  select,  insert,  update  on  public.custom_order_final_quotes  to  authenticated;
grant  select,  insert,  update  on  public.custom_order_fulfillments  to  authenticated;
grant  select,  insert,  update  on  public.custom_order_appointments  to  authenticated;
grant  select  on  public.store_orders  to  authenticated;
grant  usage,  select  on  sequence  public.store_orders_id_seq  to  authenticated;
grant  select  on  public.store_order_items  to  authenticated;
grant  select,  insert,  update,  delete  on  public.client_reviews  to  authenticated;
grant  select,  insert  on  public.account_deletion_requests  to  authenticated;
