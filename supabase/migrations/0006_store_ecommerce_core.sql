--  Store  e-commerce  core:  catalog,  cart,  wishlist,  checkout  and  stock  structure

create  extension  if  not  exists  pgcrypto;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_type
        where  typname  =  'store_stock_movement_type'
            and  typnamespace  =  'public'::regnamespace
    )  then
        create  type  public.store_stock_movement_type  as  enum  (
            'manual_increase',
            'manual_decrease',
            'reserved_on_payment',
            'released_after_review',
            'deducted_on_shipping',
            'returned_after_internal_analysis',
            'adjustment'
        );
    end  if;
end
$$;

create  table  if  not  exists  public.store_categories  (
    id  uuid  primary  key  default  gen_random_uuid(),
    slug  text  not  null,
    name  text  not  null,
    description  text,
    display_order  integer  not  null  default  0,
    is_active  boolean  not  null  default  true,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (slug),
    unique  (name)
);

create  index  if  not  exists  store_categories_active_order_idx
    on  public.store_categories  (is_active,  display_order  asc,  name  asc);

create  table  if  not  exists  public.store_collections  (
    id  uuid  primary  key  default  gen_random_uuid(),
    slug  text  not  null,
    name  text  not  null,
    theme_style  text,
    description  text,
    is_featured  boolean  not  null  default  false,
    is_active  boolean  not  null  default  true,
    starts_at  timestamptz,
    ends_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (slug),
    unique  (name)
);

create  index  if  not  exists  store_collections_active_featured_idx
    on  public.store_collections  (is_active,  is_featured  desc,  created_at  desc);

create  table  if  not  exists  public.store_products  (
    id  uuid  primary  key  default  gen_random_uuid(),
    slug  text  not  null,
    sku_base  text  not  null,
    name  text  not  null,
    short_description  text,
    description  text,
    characteristics  text[]  not  null  default  '{}',
    category_id  uuid  references  public.store_categories  (id)  on  delete  set  null,
    collection_id  uuid  references  public.store_collections  (id)  on  delete  set  null,
    theme_style  text,
    base_price  numeric(10,  2)  not  null,
    compare_at_price  numeric(10,  2),
    low_stock_threshold  integer  not  null  default  2,
    is_featured  boolean  not  null  default  false,
    is_new_arrival  boolean  not  null  default  false,
    is_active  boolean  not  null  default  true,
    sort_order  integer  not  null  default  0,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (slug),
    unique  (sku_base),
    check  (base_price  >=  0),
    check  (compare_at_price  is  null  or  compare_at_price  >=  base_price),
    check  (low_stock_threshold  >=  0)
);

create  index  if  not  exists  store_products_active_sort_idx
    on  public.store_products  (is_active,  is_featured  desc,  is_new_arrival  desc,  sort_order  asc,  created_at  desc);

create  index  if  not  exists  store_products_category_idx
    on  public.store_products  (category_id);

create  index  if  not  exists  store_products_collection_idx
    on  public.store_products  (collection_id);

create  table  if  not  exists  public.store_product_variants  (
    id  uuid  primary  key  default  gen_random_uuid(),
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    sku  text  not  null,
    size_label  text  not  null,
    color_label  text  not  null,
    variation_label  text,
    stock_quantity  integer  not  null  default  0,
    reserved_quantity  integer  not  null  default  0,
    available_quantity  integer  generated  always  as  (greatest(stock_quantity  -  reserved_quantity,  0))  stored,
    low_stock_threshold  integer,
    price_override  numeric(10,  2),
    is_active  boolean  not  null  default  true,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (sku),
    unique  (product_id,  size_label,  color_label),
    check  (stock_quantity  >=  0),
    check  (reserved_quantity  >=  0),
    check  (reserved_quantity  <=  stock_quantity),
    check  (low_stock_threshold  is  null  or  low_stock_threshold  >=  0),
    check  (price_override  is  null  or  price_override  >=  0)
);

create  index  if  not  exists  store_product_variants_product_idx
    on  public.store_product_variants  (product_id,  is_active,  size_label,  color_label);

create  index  if  not  exists  store_product_variants_stock_idx
    on  public.store_product_variants  (available_quantity  asc,  stock_quantity  asc);

create  table  if  not  exists  public.store_product_images  (
    id  uuid  primary  key  default  gen_random_uuid(),
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    variant_id  uuid  references  public.store_product_variants  (id)  on  delete  set  null,
    image_url  text  not  null,
    alt_text  text,
    display_order  integer  not  null  default  0,
    created_at  timestamptz  not  null  default  now(),
    unique  (product_id,  image_url)
);

create  index  if  not  exists  store_product_images_product_idx
    on  public.store_product_images  (product_id,  display_order  asc,  created_at  asc);

create  index  if  not  exists  store_product_images_variant_idx
    on  public.store_product_images  (variant_id);

create  table  if  not  exists  public.store_related_products  (
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    related_product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    relation_type  text  not  null  default  'related',
    created_at  timestamptz  not  null  default  now(),
    primary  key  (product_id,  related_product_id,  relation_type),
    check  (product_id  <>  related_product_id),
    check  (relation_type  =  any  (array['related',  'same_collection']))
);

create  index  if  not  exists  store_related_products_product_idx
    on  public.store_related_products  (product_id,  relation_type);

create  table  if  not  exists  public.cart_items  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    variant_id  uuid  not  null  references  public.store_product_variants  (id)  on  delete  cascade,
    quantity  integer  not  null  default  1,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (user_id,  variant_id),
    check  (quantity  >  0),
    check  (quantity  <=  20)
);

create  index  if  not  exists  cart_items_user_idx
    on  public.cart_items  (user_id,  created_at  desc);

create  table  if  not  exists  public.saved_for_later_items  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    variant_id  uuid  not  null  references  public.store_product_variants  (id)  on  delete  cascade,
    quantity  integer  not  null  default  1,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (user_id,  variant_id),
    check  (quantity  >  0),
    check  (quantity  <=  20)
);

create  index  if  not  exists  saved_for_later_items_user_idx
    on  public.saved_for_later_items  (user_id,  created_at  desc);

create  table  if  not  exists  public.wishlist_items  (
    id  uuid  primary  key  default  gen_random_uuid(),
    user_id  uuid  not  null  references  auth.users  (id)  on  delete  cascade,
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  cascade,
    variant_id  uuid  references  public.store_product_variants  (id)  on  delete  set  null,
    notify_on_restock  boolean  not  null  default  true,
    last_notified_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now()
);

create  unique  index  if  not  exists  wishlist_items_user_product_variant_unique_idx
    on  public.wishlist_items  (user_id,  product_id,  variant_id)
    where  variant_id  is  not  null;

create  unique  index  if  not  exists  wishlist_items_user_product_unique_idx
    on  public.wishlist_items  (user_id,  product_id)
    where  variant_id  is  null;

create  index  if  not  exists  wishlist_items_user_idx
    on  public.wishlist_items  (user_id,  created_at  desc);

create  table  if  not  exists  public.store_order_invoices  (
    id  bigint  generated  by  default  as  identity  primary  key,
    order_id  bigint  not  null  unique  references  public.store_orders  (id)  on  delete  cascade,
    invoice_number  text  generated  always  as  ('NF-'  ||  lpad(id::text,  6,  '0'))  stored,
    total_amount  numeric(10,  2)  not  null  default  0,
    currency_code  text  not  null  default  'BRL',
    invoice_payload  jsonb  not  null  default  '{}'::jsonb,
    invoice_url  text,
    issued_at  timestamptz  not  null  default  now(),
    emailed_at  timestamptz,
    created_at  timestamptz  not  null  default  now(),
    updated_at  timestamptz  not  null  default  now(),
    unique  (invoice_number),
    check  (total_amount  >=  0)
);

create  index  if  not  exists  store_order_invoices_order_idx
    on  public.store_order_invoices  (order_id);

create  table  if  not  exists  public.store_stock_movements  (
    id  bigint  generated  by  default  as  identity  primary  key,
    variant_id  uuid  not  null  references  public.store_product_variants  (id)  on  delete  restrict,
    product_id  uuid  not  null  references  public.store_products  (id)  on  delete  restrict,
    order_id  bigint  references  public.store_orders  (id)  on  delete  set  null,
    order_item_id  uuid  references  public.store_order_items  (id)  on  delete  set  null,
    movement_type  public.store_stock_movement_type  not  null,
    quantity  integer  not  null,
    previous_stock_quantity  integer,
    new_stock_quantity  integer,
    previous_reserved_quantity  integer,
    new_reserved_quantity  integer,
    note  text,
    metadata  jsonb  not  null  default  '{}'::jsonb,
    created_by  uuid  references  auth.users  (id)  on  delete  set  null,
    created_at  timestamptz  not  null  default  now(),
    check  (quantity  >  0)
);

create  index  if  not  exists  store_stock_movements_variant_idx
    on  public.store_stock_movements  (variant_id,  created_at  desc);

create  index  if  not  exists  store_stock_movements_order_idx
    on  public.store_stock_movements  (order_id,  created_at  desc);

create  index  if  not  exists  store_stock_movements_type_idx
    on  public.store_stock_movements  (movement_type,  created_at  desc);

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'store_categories_slug_format_check'
    )  then
        alter  table  public.store_categories
            add  constraint  store_categories_slug_format_check
            check  (slug  ~  '^[a-z0-9]+(?:-[a-z0-9]+)*$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'store_collections_slug_format_check'
    )  then
        alter  table  public.store_collections
            add  constraint  store_collections_slug_format_check
            check  (slug  ~  '^[a-z0-9]+(?:-[a-z0-9]+)*$');
    end  if;

    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'store_products_slug_format_check'
    )  then
        alter  table  public.store_products
            add  constraint  store_products_slug_format_check
            check  (slug  ~  '^[a-z0-9]+(?:-[a-z0-9]+)*$');
    end  if;
end
$$;

alter  table  public.store_orders
    add  column  if  not  exists  shipping_address_id  uuid  references  public.addresses  (id)  on  delete  set  null;
alter  table  public.store_orders
    add  column  if  not  exists  shipping_address_snapshot  jsonb  not  null  default  '{}'::jsonb;
alter  table  public.store_orders
    add  column  if  not  exists  billing_address_snapshot  jsonb  not  null  default  '{}'::jsonb;
alter  table  public.store_orders
    add  column  if  not  exists  cart_snapshot  jsonb  not  null  default  '[]'::jsonb;
alter  table  public.store_orders
    add  column  if  not  exists  delivery_mode  public.custom_order_delivery_mode;
alter  table  public.store_orders
    add  column  if  not  exists  pickup_instructions  text;
alter  table  public.store_orders
    add  column  if  not  exists  paid_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  payment_reference  text;
alter  table  public.store_orders
    add  column  if  not  exists  reserved_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  reserve_expires_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  stock_deducted_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_reason  text;
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_requested_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_requested_by  uuid  references  auth.users  (id)  on  delete  set  null;
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_review_status  text  not  null  default  'none';
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_reviewed_at  timestamptz;
alter  table  public.store_orders
    add  column  if  not  exists  cancellation_review_note  text;
alter  table  public.store_orders
    add  column  if  not  exists  notes_internal  text;

do  $$
begin
    if  not  exists  (
        select  1
        from  pg_constraint
        where  conname  =  'store_orders_cancellation_review_status_check'
    )  then
        alter  table  public.store_orders
            add  constraint  store_orders_cancellation_review_status_check
            check  (
                cancellation_review_status  =  any  (
                    array['none',  'pending_review',  'approved',  'rejected']
                )
            );
    end  if;
end
$$;

alter  table  public.store_order_items
    add  column  if  not  exists  product_id  uuid  references  public.store_products  (id)  on  delete  set  null;
alter  table  public.store_order_items
    add  column  if  not  exists  variant_id  uuid  references  public.store_product_variants  (id)  on  delete  set  null;
alter  table  public.store_order_items
    add  column  if  not  exists  size_label  text;
alter  table  public.store_order_items
    add  column  if  not  exists  color_label  text;
alter  table  public.store_order_items
    add  column  if  not  exists  collection_name  text;
alter  table  public.store_order_items
    add  column  if  not  exists  image_url  text;
alter  table  public.store_order_items
    add  column  if  not  exists  was_reserved  boolean  not  null  default  false;
alter  table  public.store_order_items
    add  column  if  not  exists  reserved_at  timestamptz;
alter  table  public.store_order_items
    add  column  if  not  exists  deducted_at  timestamptz;
alter  table  public.store_order_items
    add  column  if  not  exists  metadata  jsonb  not  null  default  '{}'::jsonb;

create  index  if  not  exists  store_order_items_product_variant_idx
    on  public.store_order_items  (product_id,  variant_id);

create  index  if  not  exists  store_orders_shipping_address_idx
    on  public.store_orders  (shipping_address_id);

create  or  replace  function  public.enforce_store_product_image_limit()
returns  trigger
language  plpgsql
as  $$
declare
    current_count  integer;
begin
    if  tg_op  =  'INSERT'  then
        select  count(*)
        into  current_count
        from  public.store_product_images  spi
        where  spi.product_id  =  new.product_id;

        if  current_count  >=  10  then
            raise  exception  'Limite  de  10  imagens  por  produto  atingido.';
        end  if;
    elsif  tg_op  =  'UPDATE'  and  new.product_id  is  distinct  from  old.product_id  then
        select  count(*)
        into  current_count
        from  public.store_product_images  spi
        where  spi.product_id  =  new.product_id;

        if  current_count  >=  10  then
            raise  exception  'Limite  de  10  imagens  por  produto  atingido  no  produto  de  destino.';
        end  if;
    end  if;

    return  new;
end;
$$;

create  or  replace  function  public.validate_store_product_image_variant()
returns  trigger
language  plpgsql
as  $$
declare
    variant_product_id  uuid;
begin
    if  new.variant_id  is  null  then
        return  new;
    end  if;

    select  spv.product_id
    into  variant_product_id
    from  public.store_product_variants  spv
    where  spv.id  =  new.variant_id;

    if  variant_product_id  is  null  then
        raise  exception  'Variação  informada  para  imagem  não  existe.';
    end  if;

    if  variant_product_id  <>  new.product_id  then
        raise  exception  'A  variação  da  imagem  precisa  pertencer  ao  mesmo  produto.';
    end  if;

    return  new;
end;
$$;

create  or  replace  function  public.sync_store_item_product_from_variant()
returns  trigger
language  plpgsql
as  $$
declare
    variant_product_id  uuid;
begin
    select  spv.product_id
    into  variant_product_id
    from  public.store_product_variants  spv
    where  spv.id  =  new.variant_id
        and  spv.is_active;

    if  variant_product_id  is  null  then
        raise  exception  'Variação  invalida  ou  inativa  para  item  de  loja.';
    end  if;

    new.product_id  =  variant_product_id;
    return  new;
end;
$$;

create  or  replace  function  public.sync_wishlist_product_from_variant()
returns  trigger
language  plpgsql
as  $$
declare
    variant_product_id  uuid;
begin
    if  new.variant_id  is  null  then
        return  new;
    end  if;

    select  spv.product_id
    into  variant_product_id
    from  public.store_product_variants  spv
    where  spv.id  =  new.variant_id;

    if  variant_product_id  is  null  then
        raise  exception  'Variação  invalida  para  item  de  favoritos.';
    end  if;

    new.product_id  =  variant_product_id;
    return  new;
end;
$$;

create  or  replace  function  public.notify_store_variant_stock_events()
returns  trigger
language  plpgsql
security  definer
set  search_path  =  public
as  $$
declare
    previous_available  integer  :=  greatest(old.stock_quantity  -  old.reserved_quantity,  0);
    current_available  integer  :=  greatest(new.stock_quantity  -  new.reserved_quantity,  0);
    threshold_value  integer  :=  0;
    product_name_value  text  :=  'Produto';
begin
    if  tg_op  <>  'UPDATE'  then
        return  new;
    end  if;

    if  (new.stock_quantity  is  not  distinct  from  old.stock_quantity)
          and  (new.reserved_quantity  is  not  distinct  from  old.reserved_quantity)  then
        return  new;
    end  if;

    select
        coalesce(new.low_stock_threshold,  sp.low_stock_threshold,  2),
        sp.name
    into  threshold_value,  product_name_value
    from  public.store_products  sp
    where  sp.id  =  new.product_id;

    if  previous_available  <=  0  and  current_available  >  0  then
        with  targets  as  (
            select  wi.id,  wi.user_id
            from  public.wishlist_items  wi
            where  wi.notify_on_restock
                and  wi.product_id  =  new.product_id
                and  (wi.variant_id  is  null  or  wi.variant_id  =  new.id)
                and  (
                    wi.last_notified_at  is  null
                    or  wi.last_notified_at  <  now()  -  interval  '6  hours'
                )
        )
        insert  into  public.internal_notifications  (
            recipient_user_id,
            channel,
            title,
            body,
            payload,
            status
        )
        select
            t.user_id,
            'in_app'::public.notification_channel,
            'Item  favorito  de  volta  ao  estoque',
            format('%s  voltou  ao  estoque.  Aproveite  para  finalizar  sua  compra.',  product_name_value),
            jsonb_build_object(
                'event',  'wishlist_restock',
                'product_id',  new.product_id,
                'variant_id',  new.id,
                'sku',  new.sku,
                'available_quantity',  current_available
            ),
            'pending'::public.notification_status
        from  targets  t;

        update  public.wishlist_items  wi
        set  last_notified_at  =  now()
        where  wi.notify_on_restock
            and  wi.product_id  =  new.product_id
            and  (wi.variant_id  is  null  or  wi.variant_id  =  new.id)
            and  (
                wi.last_notified_at  is  null
                or  wi.last_notified_at  <  now()  -  interval  '6  hours'
            );
    end  if;

    if  previous_available  >  threshold_value  and  current_available  <=  threshold_value  then
        insert  into  public.internal_notifications  (
            recipient_role,
            is_global,
            channel,
            title,
            body,
            payload,
            status
        )
        values  (
            'sales_stock'::public.app_role,
            true,
            'in_app'::public.notification_channel,
            'Alerta  de  estoque  baixo',
            format(
                'O  item  %s  (%s)  atingiu  estoque  baixo.  Disponível:  %s.',
                product_name_value,
                new.sku,
                current_available
            ),
            jsonb_build_object(
                'event',  'low_stock_alert',
                'product_id',  new.product_id,
                'variant_id',  new.id,
                'sku',  new.sku,
                'available_quantity',  current_available,
                'threshold',  threshold_value
            ),
            'pending'::public.notification_status
        );
    end  if;

    return  new;
end;
$$;

drop  trigger  if  exists  trg_store_categories_updated_at  on  public.store_categories;
create  trigger  trg_store_categories_updated_at
before  update  on  public.store_categories
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_collections_updated_at  on  public.store_collections;
create  trigger  trg_store_collections_updated_at
before  update  on  public.store_collections
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_products_updated_at  on  public.store_products;
create  trigger  trg_store_products_updated_at
before  update  on  public.store_products
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_product_variants_updated_at  on  public.store_product_variants;
create  trigger  trg_store_product_variants_updated_at
before  update  on  public.store_product_variants
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_cart_items_updated_at  on  public.cart_items;
create  trigger  trg_cart_items_updated_at
before  update  on  public.cart_items
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_saved_for_later_items_updated_at  on  public.saved_for_later_items;
create  trigger  trg_saved_for_later_items_updated_at
before  update  on  public.saved_for_later_items
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_wishlist_items_updated_at  on  public.wishlist_items;
create  trigger  trg_wishlist_items_updated_at
before  update  on  public.wishlist_items
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_order_invoices_updated_at  on  public.store_order_invoices;
create  trigger  trg_store_order_invoices_updated_at
before  update  on  public.store_order_invoices
for  each  row
execute  function  public.handle_updated_at();

drop  trigger  if  exists  trg_store_product_images_limit  on  public.store_product_images;
create  trigger  trg_store_product_images_limit
before  insert  or  update  on  public.store_product_images
for  each  row
execute  function  public.enforce_store_product_image_limit();

drop  trigger  if  exists  trg_store_product_images_variant_guard  on  public.store_product_images;
create  trigger  trg_store_product_images_variant_guard
before  insert  or  update  on  public.store_product_images
for  each  row
execute  function  public.validate_store_product_image_variant();

drop  trigger  if  exists  trg_cart_items_sync_product  on  public.cart_items;
create  trigger  trg_cart_items_sync_product
before  insert  or  update  on  public.cart_items
for  each  row
execute  function  public.sync_store_item_product_from_variant();

drop  trigger  if  exists  trg_saved_for_later_items_sync_product  on  public.saved_for_later_items;
create  trigger  trg_saved_for_later_items_sync_product
before  insert  or  update  on  public.saved_for_later_items
for  each  row
execute  function  public.sync_store_item_product_from_variant();

drop  trigger  if  exists  trg_wishlist_items_sync_product  on  public.wishlist_items;
create  trigger  trg_wishlist_items_sync_product
before  insert  or  update  on  public.wishlist_items
for  each  row
execute  function  public.sync_wishlist_product_from_variant();

drop  trigger  if  exists  trg_store_product_variants_stock_notifications  on  public.store_product_variants;
create  trigger  trg_store_product_variants_stock_notifications
after  update  of  stock_quantity,  reserved_quantity  on  public.store_product_variants
for  each  row
execute  function  public.notify_store_variant_stock_events();

alter  table  public.store_categories  enable  row  level  security;
alter  table  public.store_collections  enable  row  level  security;
alter  table  public.store_products  enable  row  level  security;
alter  table  public.store_product_variants  enable  row  level  security;
alter  table  public.store_product_images  enable  row  level  security;
alter  table  public.store_related_products  enable  row  level  security;
alter  table  public.cart_items  enable  row  level  security;
alter  table  public.saved_for_later_items  enable  row  level  security;
alter  table  public.wishlist_items  enable  row  level  security;
alter  table  public.store_order_invoices  enable  row  level  security;
alter  table  public.store_stock_movements  enable  row  level  security;

drop  policy  if  exists  store_categories_select_public_or_internal  on  public.store_categories;
create  policy  store_categories_select_public_or_internal
on  public.store_categories
for  select
using  (
    is_active
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_categories_manage_internal  on  public.store_categories;
create  policy  store_categories_manage_internal
on  public.store_categories
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_collections_select_public_or_internal  on  public.store_collections;
create  policy  store_collections_select_public_or_internal
on  public.store_collections
for  select
using  (
    is_active
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_collections_manage_internal  on  public.store_collections;
create  policy  store_collections_manage_internal
on  public.store_collections
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_products_select_public_or_internal  on  public.store_products;
create  policy  store_products_select_public_or_internal
on  public.store_products
for  select
using  (
    is_active
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_products_manage_internal  on  public.store_products;
create  policy  store_products_manage_internal
on  public.store_products
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_product_variants_select_public_or_internal  on  public.store_product_variants;
create  policy  store_product_variants_select_public_or_internal
on  public.store_product_variants
for  select
using  (
    (
        is_active
        and  exists  (
            select  1
            from  public.store_products  sp
            where  sp.id  =  store_product_variants.product_id
                and  sp.is_active
        )
    )
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_product_variants_manage_internal  on  public.store_product_variants;
create  policy  store_product_variants_manage_internal
on  public.store_product_variants
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_product_images_select_public_or_internal  on  public.store_product_images;
create  policy  store_product_images_select_public_or_internal
on  public.store_product_images
for  select
using  (
    exists  (
        select  1
        from  public.store_products  sp
        where  sp.id  =  store_product_images.product_id
            and  (
                sp.is_active
                or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  store_product_images_manage_internal  on  public.store_product_images;
create  policy  store_product_images_manage_internal
on  public.store_product_images
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_related_products_select_public_or_internal  on  public.store_related_products;
create  policy  store_related_products_select_public_or_internal
on  public.store_related_products
for  select
using  (
    (
        exists  (
            select  1
            from  public.store_products  sp
            where  sp.id  =  store_related_products.product_id
                and  sp.is_active
        )
        and  exists  (
            select  1
            from  public.store_products  rp
            where  rp.id  =  store_related_products.related_product_id
                and  rp.is_active
        )
    )
    or  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_related_products_manage_internal  on  public.store_related_products;
create  policy  store_related_products_manage_internal
on  public.store_related_products
for  all
using  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  cart_items_select_owner  on  public.cart_items;
create  policy  cart_items_select_owner
on  public.cart_items
for  select
using  (user_id  =  auth.uid());

drop  policy  if  exists  cart_items_insert_owner  on  public.cart_items;
create  policy  cart_items_insert_owner
on  public.cart_items
for  insert
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  cart_items_update_owner  on  public.cart_items;
create  policy  cart_items_update_owner
on  public.cart_items
for  update
using  (user_id  =  auth.uid())
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  cart_items_delete_owner  on  public.cart_items;
create  policy  cart_items_delete_owner
on  public.cart_items
for  delete
using  (user_id  =  auth.uid());

drop  policy  if  exists  saved_for_later_items_select_owner  on  public.saved_for_later_items;
create  policy  saved_for_later_items_select_owner
on  public.saved_for_later_items
for  select
using  (user_id  =  auth.uid());

drop  policy  if  exists  saved_for_later_items_insert_owner  on  public.saved_for_later_items;
create  policy  saved_for_later_items_insert_owner
on  public.saved_for_later_items
for  insert
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  saved_for_later_items_update_owner  on  public.saved_for_later_items;
create  policy  saved_for_later_items_update_owner
on  public.saved_for_later_items
for  update
using  (user_id  =  auth.uid())
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  saved_for_later_items_delete_owner  on  public.saved_for_later_items;
create  policy  saved_for_later_items_delete_owner
on  public.saved_for_later_items
for  delete
using  (user_id  =  auth.uid());

drop  policy  if  exists  wishlist_items_select_owner  on  public.wishlist_items;
create  policy  wishlist_items_select_owner
on  public.wishlist_items
for  select
using  (user_id  =  auth.uid());

drop  policy  if  exists  wishlist_items_insert_owner  on  public.wishlist_items;
create  policy  wishlist_items_insert_owner
on  public.wishlist_items
for  insert
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  wishlist_items_update_owner  on  public.wishlist_items;
create  policy  wishlist_items_update_owner
on  public.wishlist_items
for  update
using  (user_id  =  auth.uid())
with  check  (user_id  =  auth.uid());

drop  policy  if  exists  wishlist_items_delete_owner  on  public.wishlist_items;
create  policy  wishlist_items_delete_owner
on  public.wishlist_items
for  delete
using  (user_id  =  auth.uid());

drop  policy  if  exists  store_orders_select_owner_or_internal  on  public.store_orders;
drop  policy  if  exists  store_orders_manage_internal  on  public.store_orders;
create  policy  store_orders_select_owner_or_internal
on  public.store_orders
for  select
using  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_orders_insert_owner_or_internal  on  public.store_orders;
create  policy  store_orders_insert_owner_or_internal
on  public.store_orders
for  insert
with  check  (
    user_id  =  auth.uid()
    or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  store_orders_update_internal  on  public.store_orders;
create  policy  store_orders_update_internal
on  public.store_orders
for  update
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_orders_delete_internal  on  public.store_orders;
create  policy  store_orders_delete_internal
on  public.store_orders
for  delete
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_order_items_select_owner_or_internal  on  public.store_order_items;
drop  policy  if  exists  store_order_items_manage_internal  on  public.store_order_items;
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

drop  policy  if  exists  store_order_items_insert_owner_or_internal  on  public.store_order_items;
create  policy  store_order_items_insert_owner_or_internal
on  public.store_order_items
for  insert
with  check  (
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

drop  policy  if  exists  store_order_items_update_internal  on  public.store_order_items;
create  policy  store_order_items_update_internal
on  public.store_order_items
for  update
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_order_items_delete_internal  on  public.store_order_items;
create  policy  store_order_items_delete_internal
on  public.store_order_items
for  delete
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_order_invoices_select_owner_or_internal  on  public.store_order_invoices;
create  policy  store_order_invoices_select_owner_or_internal
on  public.store_order_invoices
for  select
using  (
    exists  (
        select  1
        from  public.store_orders  so
        where  so.id  =  store_order_invoices.order_id
            and  (
                so.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  store_order_invoices_insert_owner_or_internal  on  public.store_order_invoices;
create  policy  store_order_invoices_insert_owner_or_internal
on  public.store_order_invoices
for  insert
with  check  (
    exists  (
        select  1
        from  public.store_orders  so
        where  so.id  =  store_order_invoices.order_id
            and  (
                so.user_id  =  auth.uid()
                or  public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[])
            )
    )
);

drop  policy  if  exists  store_order_invoices_update_internal  on  public.store_order_invoices;
create  policy  store_order_invoices_update_internal
on  public.store_order_invoices
for  update
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]))
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_order_invoices_delete_internal  on  public.store_order_invoices;
create  policy  store_order_invoices_delete_internal
on  public.store_order_invoices
for  delete
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_stock_movements_select_internal  on  public.store_stock_movements;
create  policy  store_stock_movements_select_internal
on  public.store_stock_movements
for  select
using  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_stock_movements_insert_internal  on  public.store_stock_movements;
create  policy  store_stock_movements_insert_internal
on  public.store_stock_movements
for  insert
with  check  (public.has_any_role(array['admin',  'finance',  'sales_stock']::public.app_role[]));

drop  policy  if  exists  store_stock_movements_update_internal  on  public.store_stock_movements;
create  policy  store_stock_movements_update_internal
on  public.store_stock_movements
for  update
using  (public.has_role('admin'::public.app_role))
with  check  (public.has_role('admin'::public.app_role));

drop  policy  if  exists  store_stock_movements_delete_internal  on  public.store_stock_movements;
create  policy  store_stock_movements_delete_internal
on  public.store_stock_movements
for  delete
using  (public.has_role('admin'::public.app_role));

grant  select  on  public.store_categories  to  anon,  authenticated;
grant  select  on  public.store_collections  to  anon,  authenticated;
grant  select  on  public.store_products  to  anon,  authenticated;
grant  select  on  public.store_product_variants  to  anon,  authenticated;
grant  select  on  public.store_product_images  to  anon,  authenticated;
grant  select  on  public.store_related_products  to  anon,  authenticated;

grant  insert,  update,  delete  on  public.store_categories  to  authenticated;
grant  insert,  update,  delete  on  public.store_collections  to  authenticated;
grant  insert,  update,  delete  on  public.store_products  to  authenticated;
grant  insert,  update,  delete  on  public.store_product_variants  to  authenticated;
grant  insert,  update,  delete  on  public.store_product_images  to  authenticated;
grant  insert,  update,  delete  on  public.store_related_products  to  authenticated;

grant  select,  insert,  update,  delete  on  public.cart_items  to  authenticated;
grant  select,  insert,  update,  delete  on  public.saved_for_later_items  to  authenticated;
grant  select,  insert,  update,  delete  on  public.wishlist_items  to  authenticated;

grant  select,  insert,  update,  delete  on  public.store_orders  to  authenticated;
grant  usage,  select  on  sequence  public.store_orders_id_seq  to  authenticated;

grant  select,  insert,  update,  delete  on  public.store_order_items  to  authenticated;
grant  select,  insert,  update,  delete  on  public.store_order_invoices  to  authenticated;
grant  usage,  select  on  sequence  public.store_order_invoices_id_seq  to  authenticated;

grant  select,  insert,  update,  delete  on  public.store_stock_movements  to  authenticated;
grant  usage,  select  on  sequence  public.store_stock_movements_id_seq  to  authenticated;

insert  into  storage.buckets  (id,  name,  public,  file_size_limit,  allowed_mime_types)
values  (
    'store-products',
    'store-products',
    true,
    10485760,
    array['image/jpeg',  'image/png',  'image/webp']
)
on  conflict  (id)  do  update
set  public  =  excluded.public,
        file_size_limit  =  excluded.file_size_limit,
        allowed_mime_types  =  excluded.allowed_mime_types;

drop  policy  if  exists  storage_store_products_select_public  on  storage.objects;
create  policy  storage_store_products_select_public
on  storage.objects
for  select
to  public
using  (bucket_id  =  'store-products');

drop  policy  if  exists  storage_store_products_insert_internal  on  storage.objects;
create  policy  storage_store_products_insert_internal
on  storage.objects
for  insert
to  authenticated
with  check  (
    bucket_id  =  'store-products'
    and  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  storage_store_products_update_internal  on  storage.objects;
create  policy  storage_store_products_update_internal
on  storage.objects
for  update
to  authenticated
using  (
    bucket_id  =  'store-products'
    and  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
)
with  check  (
    bucket_id  =  'store-products'
    and  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

drop  policy  if  exists  storage_store_products_delete_internal  on  storage.objects;
create  policy  storage_store_products_delete_internal
on  storage.objects
for  delete
to  authenticated
using  (
    bucket_id  =  'store-products'
    and  public.has_any_role(array['admin',  'sales_stock']::public.app_role[])
);

insert  into  public.store_categories  (slug,  name,  description,  display_order,  is_active)
values
    ('alfaiataria',  'Alfaiataria',  'Modelagens  estruturadas  para  uso  social  e  executivo.',  1,  true),
    ('vestidos',  'Vestidos',  'Vestidos  autorais  para  diferentes  ocasioes.',  2,  true),
    ('casacos-jaquetas',  'Casacos  e  Jaquetas',  'Peças  para  composições  premium  em  dias  amenos.',  3,  true),
    ('conjuntos',  'Conjuntos',  'Combinacoes  coordenadas  com  identidade  da  marca.',  4,  true),
    ('camisas-blusas',  'Camisas  e  Blusas',  'Base  elegante  para  guarda-roupa  sofisticado.',  5,  true),
    ('saias-shorts',  'Saias  e  Shorts',  'Peças  versateis  para  looks  urbanos  e  refinados.',  6,  true)
on  conflict  (slug)  do  nothing;

insert  into  public.store_collections  (slug,  name,  theme_style,  description,  is_featured,  is_active)
values
    ('noir-signature',  'Noir  Signature',  'Minimalismo  noturno',  'Linhas  limpas  em  preto  profundo  e  detalhes  foscos.',  true,  true),
    ('atelier-essence',  'Atelier  Essence',  'Elegância  contemporanea',  'Texturas  premium  para  uso  diario  com  assinatura  autoral.',  true,  true),
    ('urban-tailoring',  'Urban  Tailoring',  'Alfaiataria  urbana',  'Cortes  versateis  para  cidade  e  eventos.',  false,  true),
    ('gala-heritage',  'Gala  Heritage',  'Festa  e  ocasiao  especial',  'Peças  de  impacto  com  acabamento  refinado.',  false,  true)
on  conflict  (slug)  do  nothing;

with  cat  as  (
    select  id,  slug
    from  public.store_categories
),
col  as  (
    select  id,  slug
    from  public.store_collections
)
insert  into  public.store_products  (
    slug,
    sku_base,
    name,
    short_description,
    description,
    characteristics,
    category_id,
    collection_id,
    theme_style,
    base_price,
    compare_at_price,
    low_stock_threshold,
    is_featured,
    is_new_arrival,
    is_active,
    sort_order,
    metadata
)
values
    (
        'blazer-aurora',
        'BLZ-AUR',
        'Blazer  Aurora',
        'Blazer  estruturado  com  acabamento  premium  em  preto  fosco.',
        'Blazer  de  alfaiataria  com  corte  acinturado,  lapela  marcada  e  forro  suave  para  uso  prolongado.',
        array['Forro  interno  premium',  'Fechamento  frontal  com  botoes',  'Modelagem  estruturada'],
        (select  id  from  cat  where  slug  =  'alfaiataria'),
        (select  id  from  col  where  slug  =  'noir-signature'),
        'Minimalismo  noturno',
        459.00,
        519.00,
        3,
        true,
        true,
        true,
        1,
        '{"sales_count":  42}'::jsonb
    ),
    (
        'vestido-imperial',
        'VTD-IMP',
        'Vestido  Imperial  Slim',
        'Vestido  midi  em  crepe  com  silhueta  elegante.',
        'Vestido  com  decote  suave,  cintura  marcada  e  caimento  fluido  para  eventos  e  jantares  especiais.',
        array['Crepe  premium',  'Caimento  midi',  'Ajuste  posterior  discreto'],
        (select  id  from  cat  where  slug  =  'vestidos'),
        (select  id  from  col  where  slug  =  'gala-heritage'),
        'Festa  e  ocasiao  especial',
        389.00,
        null,
        2,
        false,
        true,
        true,
        2,
        '{"sales_count":  29}'::jsonb
    ),
    (
        'jaqueta-noir-biker',
        'JQT-NBK',
        'Jaqueta  Noir  Biker',
        'Jaqueta  com  recortes  modernos  e  toque  de  elegância  urbana.',
        'Peça  versatil  para  meia  estacao,  com  ziper  frontal  e  estrutura  leve  para  composições  premium.',
        array['Ziper  frontal',  'Recortes  ergonomicos',  'Uso  urbano  premium'],
        (select  id  from  cat  where  slug  =  'casacos-jaquetas'),
        (select  id  from  col  where  slug  =  'urban-tailoring'),
        'Alfaiataria  urbana',
        329.00,
        null,
        2,
        false,
        false,
        true,
        3,
        '{"sales_count":  18}'::jsonb
    ),
    (
        'conjunto-lumiere',
        'CNJ-LUM',
        'Conjunto  Lumiere',
        'Conjunto  coordenado  com  blazer  leve  e  calca  reta.',
        'Conjunto  pensado  para  praticidade  sem  abrir  mao  de  acabamento  sofisticado  e  conforto.',
        array['Blazer  leve',  'Calca  reta',  'Composição  coordenada'],
        (select  id  from  cat  where  slug  =  'conjuntos'),
        (select  id  from  col  where  slug  =  'atelier-essence'),
        'Elegância  contemporanea',
        349.00,
        399.00,
        2,
        true,
        false,
        true,
        4,
        '{"sales_count":  36}'::jsonb
    ),
    (
        'camisa-essence-seda',
        'CMS-ESD',
        'Camisa  Essence  Seda',
        'Camisa  premium  com  toque  acetinado  e  fechamento  delicado.',
        'Camisa  para  composições  formais  e  casuais  sofisticadas,  com  costura  limpa  e  tecido  de  alta  qualidade.',
        array['Toque  acetinado',  'Botoes  personalizados',  'Modelagem  elegante'],
        (select  id  from  cat  where  slug  =  'camisas-blusas'),
        (select  id  from  col  where  slug  =  'atelier-essence'),
        'Elegância  contemporanea',
        219.00,
        null,
        3,
        false,
        true,
        true,
        5,
        '{"sales_count":  24}'::jsonb
    ),
    (
        'saia-midi-dourada',
        'SIA-MDG',
        'Saia  Midi  Dourada',
        'Saia  midi  com  brilho  discreto  e  cintura  alta.',
        'Saia  com  textura  refinada  para  produções  noturnas  ou  composições  autorais  durante  o  dia.',
        array['Cintura  alta',  'Comprimento  midi',  'Detalhes  em  dourado  fosco'],
        (select  id  from  cat  where  slug  =  'saias-shorts'),
        (select  id  from  col  where  slug  =  'noir-signature'),
        'Minimalismo  noturno',
        199.00,
        null,
        2,
        false,
        false,
        true,
        6,
        '{"sales_count":  15}'::jsonb
    )
on  conflict  (slug)  do  nothing;

insert  into  public.store_product_variants  (
    product_id,
    sku,
    size_label,
    color_label,
    variation_label,
    stock_quantity,
    reserved_quantity,
    low_stock_threshold,
    price_override,
    is_active
)
values
    ((select  id  from  public.store_products  where  slug  =  'blazer-aurora'),  'BLZ-AUR-PRE-P',  'P',  'Preto  Fosco',  'P  /  Preto  Fosco',  8,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'blazer-aurora'),  'BLZ-AUR-PRE-M',  'M',  'Preto  Fosco',  'M  /  Preto  Fosco',  6,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'blazer-aurora'),  'BLZ-AUR-PRE-G',  'G',  'Preto  Fosco',  'G  /  Preto  Fosco',  3,  0,  2,  null,  true),

    ((select  id  from  public.store_products  where  slug  =  'vestido-imperial'),  'VTD-IMP-BOR-P',  'P',  'Bordo',  'P  /  Bordo',  5,  0,  1,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'vestido-imperial'),  'VTD-IMP-BOR-M',  'M',  'Bordo',  'M  /  Bordo',  4,  0,  1,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'vestido-imperial'),  'VTD-IMP-PRE-M',  'M',  'Preto',  'M  /  Preto',  2,  0,  1,  399.00,  true),

    ((select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),  'JQT-NBK-PRE-P',  'P',  'Preto',  'P  /  Preto',  7,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),  'JQT-NBK-PRE-M',  'M',  'Preto',  'M  /  Preto',  5,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),  'JQT-NBK-VER-M',  'M',  'Verde  Militar',  'M  /  Verde  Militar',  3,  0,  2,  null,  true),

    ((select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),  'CNJ-LUM-ARE-P',  'P',  'Areia',  'P  /  Areia',  5,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),  'CNJ-LUM-ARE-M',  'M',  'Areia',  'M  /  Areia',  5,  0,  2,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),  'CNJ-LUM-PRE-M',  'M',  'Preto',  'M  /  Preto',  2,  0,  2,  null,  true),

    ((select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),  'CMS-ESD-OFF-P',  'P',  'Off-white',  'P  /  Off-white',  10,  0,  3,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),  'CMS-ESD-OFF-M',  'M',  'Off-white',  'M  /  Off-white',  8,  0,  3,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),  'CMS-ESD-PRE-M',  'M',  'Preto',  'M  /  Preto',  4,  0,  2,  null,  true),

    ((select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),  'SIA-MDG-DOR-P',  'P',  'Dourado  Fosco',  'P  /  Dourado  Fosco',  4,  0,  1,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),  'SIA-MDG-DOR-M',  'M',  'Dourado  Fosco',  'M  /  Dourado  Fosco',  3,  0,  1,  null,  true),
    ((select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),  'SIA-MDG-PRE-M',  'M',  'Preto',  'M  /  Preto',  6,  0,  1,  null,  true)
on  conflict  (sku)  do  nothing;

insert  into  public.store_product_images  (
    product_id,
    image_url,
    alt_text,
    display_order
)
values
    ((select  id  from  public.store_products  where  slug  =  'blazer-aurora'),  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',  'Blazer  Aurora  frontal',  1),
    ((select  id  from  public.store_products  where  slug  =  'blazer-aurora'),  'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1200&q=80',  'Blazer  Aurora  em  detalhe',  2),

    ((select  id  from  public.store_products  where  slug  =  'vestido-imperial'),  'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80',  'Vestido  Imperial  em  estudio',  1),
    ((select  id  from  public.store_products  where  slug  =  'vestido-imperial'),  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',  'Vestido  Imperial  detalhe  de  tecido',  2),

    ((select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',  'Jaqueta  Noir  Biker  look  completo',  1),
    ((select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=80',  'Jaqueta  Noir  Biker  acabamento',  2),

    ((select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),  'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8ac?auto=format&fit=crop&w=1200&q=80',  'Conjunto  Lumiere  versão  areia',  1),
    ((select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',  'Conjunto  Lumiere  no  corpo',  2),

    ((select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',  'Camisa  Essence  Seda  frontal',  1),
    ((select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',  'Camisa  Essence  Seda  gola  e  botoes',  2),

    ((select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',  'Saia  Midi  Dourada  look  completo',  1),
    ((select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',  'Saia  Midi  Dourada  detalhe',  2)
on  conflict  (product_id,  image_url)  do  nothing;

insert  into  public.store_related_products  (product_id,  related_product_id,  relation_type)
values
    (
        (select  id  from  public.store_products  where  slug  =  'blazer-aurora'),
        (select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),
        'related'
    ),
    (
        (select  id  from  public.store_products  where  slug  =  'blazer-aurora'),
        (select  id  from  public.store_products  where  slug  =  'saia-midi-dourada'),
        'same_collection'
    ),
    (
        (select  id  from  public.store_products  where  slug  =  'conjunto-lumiere'),
        (select  id  from  public.store_products  where  slug  =  'camisa-essence-seda'),
        'same_collection'
    ),
    (
        (select  id  from  public.store_products  where  slug  =  'vestido-imperial'),
        (select  id  from  public.store_products  where  slug  =  'jaqueta-noir-biker'),
        'related'
    )
on  conflict  do  nothing;
