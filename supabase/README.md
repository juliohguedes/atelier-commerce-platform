#  Supabase  no  Projeto

Este  diretorio  concentra  tudo  que  sustenta  banco,  auth,  permissões  e  seed.

##  Estrutura

-  `migrations/`:  evolução  versionada  do  schema
-  `seed/`:  seed  demo  e  guia  de  dados
-  `seed.sql`:  ponto  de  entrada  padrao  para  Supabase  CLI
-  `policies/`:  apoio  documental  para  RLS

##  O  Que  Já  Existe

-  auth  base  com  `profiles`,  `user_roles`  e  `addresses`
-  configurações  da  marca  e  modo  manutenção
-  pedidos  sob  medida
-  área  da  cliente
-  loja,  estoque,  pedidos  e  notas
-  eventos  internos
-  relatórios  e  conteúdo  auxiliar
-  auditoria,  consentimentos  e  backups
-  segundo  fator  para  acessos  internos

##  Ordem  Atual  de  Migrations

1.  `0001_initial_schema.sql`
2.  `0002_auth_permissions_foundation.sql`
3.  `0003_brand_settings_years_in_business.sql`
4.  `0004_custom_order_module.sql`
5.  `0005_client_area_experience.sql`
6.  `0006_store_ecommerce_core.sql`
7.  `0007_internal_sector_admin_controls.sql`
8.  `0008_store_orders_shipping_carrier.sql`
9.  `0009_site_auxiliary_content.sql`
10.  `0010_finalization_security_and_compliance.sql`

##  Como  Aplicar

Você  pode  usar:

-  SQL  Editor  do  Supabase
-  Supabase  CLI,  se  o  seu  ambiente  local  já  estiver  configurado

Depois  das  migrations,  execute  o  seed:

-  [`seed/demo_seed.sql`](./seed/demo_seed.sql)

##  Observações

-  o  seed  foi  pensado  para  demo  e  portfolio
-  as  integrações  externas  continuam  mockadas  no  app
-  os  dados  criados  alimentam  dashboards,  relatarios,  calendário  e  área  da  cliente
