alter  table  public.store_orders
    add  column  if  not  exists  shipping_carrier  text;
