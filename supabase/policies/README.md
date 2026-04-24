#  Políticas  RLS

##  Base  entregue  nesta  fase

###  Perfis  e  papeis
-  `profiles`:  leitura  do  próprio  usuário  e  leitura  interna  para  `admin`,  `finance`,  `sales_stock`.
-  `profiles`:  atualização  do  próprio  usuário  e  administração  por  `admin`.
-  `user_roles`:  leitura  do  próprio  usuário  e  gestão  restrita  a  `admin`.

###  Dados  de  cliente
-  `addresses`:  cliente  pode  CRUD  dos  próprios  endereços.
-  `addresses`:  equipes  internas  (`admin`,  `finance`,  `sales_stock`)  podem  consultar/operar  quando  necessário.

###  Configuração  e  operação  interna
-  `brand_settings`:  leitura  publica;  escrita  somente  `admin`.
-  `maintenance_mode`:  leitura  publica;  escrita  somente  `admin`.
-  `internal_audit_logs`:  inserção  autenticada;  leitura  por  `admin`  e  `finance`.
-  `internal_notifications`:  leitura  do  destinatario/role  alvo  e  controle  interno.

###  Recuperação  de  conta
-  `auth_recovery_requests`:  leitura/escrita  do  próprio  usuário  e  administração  por  `admin`.

##  Funções  auxiliares  de  permissão
-  `current_user_role()`
-  `has_role(app_role)`
-  `has_any_role(app_role[])`

Essas  funções  centralizam  a  verificação  de  papeis  dentro  de  políticas  e  consultas  futuras.
