--  Demo  seed  for  portfolio  and  local  development
--  Recommended  demo  password  for  all  seeded  users:  DemoModa2026!

insert  into  auth.users  (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
values
    (
        '00000000-0000-0000-0000-000000000000',
        '10000000-0000-4000-8000-000000000001',
        'authenticated',
        'authenticated',
        'ana@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-01T09:00:00-03:00',
        '2026-04-18T09:00:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Ana  Martins",
            "whatsapp":"11988112233",
            "cpf":"12345678901",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-01T09:00:00-03:00",
            "privacy_policy_accepted_at":"2026-04-01T09:00:00-03:00"
        }'::jsonb,
        false,
        '2026-04-01T09:00:00-03:00',
        '2026-04-18T09:00:00-03:00',
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '10000000-0000-4000-8000-000000000002',
        'authenticated',
        'authenticated',
        'mariana@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-02T10:30:00-03:00',
        '2026-04-19T08:20:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Mariana  Falcão",
            "whatsapp":"11988223344",
            "cpf":"23456789012",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-02T10:30:00-03:00",
            "privacy_policy_accepted_at":"2026-04-02T10:30:00-03:00"
        }'::jsonb,
        false,
        '2026-04-02T10:30:00-03:00',
        '2026-04-19T08:20:00-03:00',
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '10000000-0000-4000-8000-000000000003',
        'authenticated',
        'authenticated',
        'renata@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-03T11:40:00-03:00',
        '2026-04-19T16:05:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Renata  Campos",
            "whatsapp":"11988334455",
            "cpf":"34567890123",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-03T11:40:00-03:00",
            "privacy_policy_accepted_at":"2026-04-03T11:40:00-03:00"
        }'::jsonb,
        false,
        '2026-04-03T11:40:00-03:00',
        '2026-04-19T16:05:00-03:00',
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '20000000-0000-4000-8000-000000000001',
        'authenticated',
        'authenticated',
        'admin@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-01T08:00:00-03:00',
        '2026-04-20T08:10:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Helena  Duarte",
            "whatsapp":"11988445566",
            "cpf":"45678901234",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-01T08:00:00-03:00",
            "privacy_policy_accepted_at":"2026-04-01T08:00:00-03:00"
        }'::jsonb,
        false,
        '2026-04-01T08:00:00-03:00',
        '2026-04-20T08:10:00-03:00',
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '20000000-0000-4000-8000-000000000002',
        'authenticated',
        'authenticated',
        'financeiro@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-01T08:10:00-03:00',
        '2026-04-20T09:25:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Caio  Nobre",
            "whatsapp":"11988556677",
            "cpf":"56789012345",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-01T08:10:00-03:00",
            "privacy_policy_accepted_at":"2026-04-01T08:10:00-03:00"
        }'::jsonb,
        false,
        '2026-04-01T08:10:00-03:00',
        '2026-04-20T09:25:00-03:00',
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        '20000000-0000-4000-8000-000000000003',
        'authenticated',
        'authenticated',
        'operacoes@projeto-ecommerce.demo',
        crypt('DemoModa2026!',  gen_salt('bf')),
        '2026-04-01T08:20:00-03:00',
        '2026-04-20T10:15:00-03:00',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{
            "full_name":"Lucas  Prado",
            "whatsapp":"11988667788",
            "cpf":"67890123456",
            "preferred_locale":"pt-BR",
            "accepted_terms":true,
            "accepted_privacy_policy":true,
            "terms_version":"2026-04",
            "privacy_policy_version":"2026-04",
            "terms_accepted_at":"2026-04-01T08:20:00-03:00",
            "privacy_policy_accepted_at":"2026-04-01T08:20:00-03:00"
        }'::jsonb,
        false,
        '2026-04-01T08:20:00-03:00',
        '2026-04-20T10:15:00-03:00',
        '',
        '',
        '',
        ''
    )
on  conflict  (id)  do  update
set  email  =  excluded.email,
        encrypted_password  =  excluded.encrypted_password,
        raw_user_meta_data  =  excluded.raw_user_meta_data,
        updated_at  =  excluded.updated_at,
        last_sign_in_at  =  excluded.last_sign_in_at;

insert  into  auth.identities  (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
values
    ('10000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000001',  '{"sub":"10000000-0000-4000-8000-000000000001","email":"ana@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-18T09:00:00-03:00',  '2026-04-01T09:00:00-03:00',  '2026-04-18T09:00:00-03:00'),
    ('10000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000002',  '{"sub":"10000000-0000-4000-8000-000000000002","email":"mariana@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-19T08:20:00-03:00',  '2026-04-02T10:30:00-03:00',  '2026-04-19T08:20:00-03:00'),
    ('10000000-0000-4000-8000-000000000003',  '10000000-0000-4000-8000-000000000003',  '10000000-0000-4000-8000-000000000003',  '{"sub":"10000000-0000-4000-8000-000000000003","email":"renata@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-19T16:05:00-03:00',  '2026-04-03T11:40:00-03:00',  '2026-04-19T16:05:00-03:00'),
    ('20000000-0000-4000-8000-000000000001',  '20000000-0000-4000-8000-000000000001',  '20000000-0000-4000-8000-000000000001',  '{"sub":"20000000-0000-4000-8000-000000000001","email":"admin@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-20T08:10:00-03:00',  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:10:00-03:00'),
    ('20000000-0000-4000-8000-000000000002',  '20000000-0000-4000-8000-000000000002',  '20000000-0000-4000-8000-000000000002',  '{"sub":"20000000-0000-4000-8000-000000000002","email":"financeiro@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-20T09:25:00-03:00',  '2026-04-01T08:10:00-03:00',  '2026-04-20T09:25:00-03:00'),
    ('20000000-0000-4000-8000-000000000003',  '20000000-0000-4000-8000-000000000003',  '20000000-0000-4000-8000-000000000003',  '{"sub":"20000000-0000-4000-8000-000000000003","email":"operacoes@projeto-ecommerce.demo"}'::jsonb,  'email',  '2026-04-20T10:15:00-03:00',  '2026-04-01T08:20:00-03:00',  '2026-04-20T10:15:00-03:00')
on  conflict  (id)  do  update
set  identity_data  =  excluded.identity_data,
        last_sign_in_at  =  excluded.last_sign_in_at,
        updated_at  =  excluded.updated_at;

update  public.addresses
set  is_primary  =  false
where  user_id  in  (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000003'
);

insert  into  public.addresses  (
    id,
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
    is_primary,
    created_at,
    updated_at
)
values
    ('30000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000001',  'Principal',  'Ana  Martins',  '01311000',  'Rua  Bela  Cintra',  '220',  'Apto  81',  'Consolacao',  'São  Paulo',  'SP',  true,  '2026-04-01T09:00:00-03:00',  '2026-04-18T09:00:00-03:00'),
    ('30000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000002',  'Principal',  'Mariana  Falcão',  '04002001',  'Rua  Cubatao',  '150',  null,  'Paraiso',  'São  Paulo',  'SP',  true,  '2026-04-02T10:30:00-03:00',  '2026-04-19T08:20:00-03:00'),
    ('30000000-0000-4000-8000-000000000003',  '10000000-0000-4000-8000-000000000003',  'Principal',  'Renata  Campos',  '22790120',  'Rua  Voluntarios  da  Patria',  '990',  'Sala  08',  'Botafogo',  'Rio  de  Janeiro',  'RJ',  true,  '2026-04-03T11:40:00-03:00',  '2026-04-19T16:05:00-03:00')
on  conflict  (id)  do  update
set  recipient_name  =  excluded.recipient_name,
        zip_code  =  excluded.zip_code,
        street  =  excluded.street,
        number  =  excluded.number,
        complement  =  excluded.complement,
        neighborhood  =  excluded.neighborhood,
        city  =  excluded.city,
        state  =  excluded.state,
        is_primary  =  excluded.is_primary,
        updated_at  =  excluded.updated_at;

insert  into  public.user_roles  (user_id,  role,  is_primary,  is_active,  created_at,  updated_at)
values
    ('20000000-0000-4000-8000-000000000001',  'admin',  true,  true,  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:10:00-03:00'),
    ('20000000-0000-4000-8000-000000000002',  'finance',  true,  true,  '2026-04-01T08:10:00-03:00',  '2026-04-20T09:25:00-03:00'),
    ('20000000-0000-4000-8000-000000000003',  'sales_stock',  true,  true,  '2026-04-01T08:20:00-03:00',  '2026-04-20T10:15:00-03:00')
on  conflict  (user_id,  role)  do  update
set  is_primary  =  excluded.is_primary,
        is_active  =  excluded.is_active,
        updated_at  =  excluded.updated_at;

update  public.user_roles
set  is_primary  =  false
where  user_id  in  (
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000003'
)
    and  role  =  'client';

update  public.brand_settings
set
    brand_name  =  'Maison  Aurea',
    legal_name  =  'Maison  Aurea  Moda  Autoral  LTDA',
    support_email  =  'contato@projeto-ecommerce.demo',
    support_whatsapp  =  '11988778899',
    address_text  =  'Rua  Haddock  Lobo,  640  -  Cerqueira  Cesar,  São  Paulo  -  SP',
    business_hours  =  'Segunda  a  sexta,  10h  as  19h.  Sabado  com  horário  agendado.',
    instagram_url  =  'https://instagram.com/projeto-ecommerce.demo',
    facebook_url  =  'https://facebook.com/projeto-ecommerce.demo',
    tiktok_url  =  'https://tiktok.com/@projeto-ecommerce.demo',
    legal_document_cnpj  =  '12345678000199',
    maintenance_banner  =  'Ambiente  demo  com  integrações  mockadas  e  seed  portfolio.',
    years_in_business  =  14,
    technical_draft_payload  =  '{"theme":"gold-matte","homepageVersion":"demo-2026-04"}'::jsonb,
    technical_published_payload  =  '{"theme":"gold-matte","homepageVersion":"demo-2026-04"}'::jsonb,
    technical_previous_payload  =  '{"theme":"classic-black","homepageVersion":"demo-2026-03"}'::jsonb,
    technical_published_version  =  4,
    technical_last_published_at  =  '2026-04-18T20:10:00-03:00',
    technical_last_published_by  =  '20000000-0000-4000-8000-000000000001',
    updated_at  =  '2026-04-20T08:10:00-03:00'
where  singleton_key  =  true;

update  public.maintenance_mode
set
    enabled  =  false,
    message  =  'Sistema  em  manutenção  programada.',
    allow_roles  =  array['admin']::public.app_role[],
    starts_at  =  null,
    ends_at  =  null,
    updated_by  =  '20000000-0000-4000-8000-000000000001',
    updated_at  =  '2026-04-20T08:15:00-03:00'
where  id  =  1;

insert  into  public.site_auxiliary_content  (
    singleton_key,
    gallery_pieces,
    featured_collections,
    testimonials,
    faq_items,
    legal_sections,
    location_info,
    updated_at
)
values  (
    true,
    '[
        {"id":"piece-noir-blazer","name":"Blazer  Noir  Signature","description":"Alfaiataria  estruturada  com  acabamento  interno  premium  e  forro  acetinado.","imageUrl":"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80","category":"Alfaiataria"},
        {"id":"piece-satin-dress","name":"Vestido  Satin  Atelier","description":"Vestido  de  evento  com  brilho  discreto,  caimento  elegante  e  proposta  sob  medida.","imageUrl":"https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80","category":"Eventos"},
        {"id":"piece-capsule-shirt","name":"Camisa  Capsule  Aura","description":"Peca  versatil  para  loja  e  atendimento  presencial,  com  shape  limpo  e  toque  nobre.","imageUrl":"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80","category":"Casual  premium"}
    ]'::jsonb,
    '[
        {"id":"collection-noir","title":"Noir  Signature","summary":"Coleção  de  alfaiataria  feminina  com  foco  em  contraste,  estrutura  e  acabamento  de  atelier.","badge":"Coleção  hero"},
        {"id":"collection-aura","title":"Aura  Studio","summary":"Linha  de  peças  fluidas,  versateis  e  pensadas  para  agenda  urbana  com  toque  autoral.","badge":"Destaque  da  loja"}
    ]'::jsonb,
    '[
        {"id":"testimonial-ana","customerName":"Ana  Martins","context":"Sob  medida  para  evento","quote":"A  Maison  Aurea  conseguiu  traduzir  exatamente  a  linguagem  que  eu  queria.  Atendimento  impecável  e  entrega  super  organizada.","rating":5},
        {"id":"testimonial-renata","customerName":"Renata  Campos","context":"Compra  na  loja  online","quote":"A  experiência  na  loja  foi  premium  do  início  ao  fim,  com  rastreio  claro  e  acabamento  acima  do  esperado.","rating":5}
    ]'::jsonb,
    '[
        {"id":"faq-prazo","question":"Qual  o  prazo  medio  para  peças  sob  medida?","answer":"Os  prazos  variam  conforme  complexidade  e  agenda  do  atelier,  mas  o  painel  interno  e  o  fluxo  da  cliente  mantem  tudo  atualizado."},
        {"id":"faq-retirada","question":"Posso  retirar  presencialmente?","answer":"Sim.  O  calendário  interno  organiza  retiradas,  provas  e  entregas  presenciais  com  antecedencia  e  confirmação."},
        {"id":"faq-loja","question":"A  loja  online  trabalha  com  estoque  real?","answer":"Sim.  O  módulo  de  vendas  e  estoque  usa  disponibilidade  por  variação  e  registra  movimentações  de  reserva  e  baixa."}
    ]'::jsonb,
    '[
        {"id":"legal-termos","title":"Termos  e  condições","summary":"Regras  de  atendimento,  aprovação,  produção  e  uso  da  plataforma  em  ambiente  de  demo  ou  operação  real.","items":["Pedidos  sob  medida  dependem  de  validacao  técnica  e  aprovação  financeira.","Alterações  sensíveis  podem  gerar  notificação  previa  e  trilha  de  auditoria.","Conteúdos  e  identidade  visual  podem  ser  atualizados  apenas  por  administração  autorizada."]},
        {"id":"legal-privacidade","title":"Política  de  privacidade","summary":"Tratamento  básico  de  dados  pessoais  com  foco  em  atendimento,  entregas,  auditoria  operacional  e  solicitações  LGPD.","items":["Dados  de  contato  e  endereço  são  usados  para  atendimento,  entrega  e  suporte.","Solicitações  de  exclusão  de  conta  ficam  registradas  para  acompanhamento  administrativo.","Dados  sensíveis  podem  ser  mascarados  em  logs  e  mocks  de  integração  quando  necessário."]}
    ]'::jsonb,
    '{
        "showroomName":"Maison  Aurea  Atelier",
        "addressLine":"Rua  Haddock  Lobo,  640  -  Cerqueira  Cesar",
        "cityState":"Sao  Paulo  -  SP",
        "openingHours":"Seg  a  sex,  10h  as  19h  |  Sab  com  agendamento",
        "mapEmbedUrl":"https://www.google.com/maps?q=Rua+Haddock+Lobo+640+Sao+Paulo&output=embed"
    }'::jsonb,
    '2026-04-20T08:20:00-03:00'
)
on  conflict  (singleton_key)  do  update
set  gallery_pieces  =  excluded.gallery_pieces,
        featured_collections  =  excluded.featured_collections,
        testimonials  =  excluded.testimonials,
        faq_items  =  excluded.faq_items,
        legal_sections  =  excluded.legal_sections,
        location_info  =  excluded.location_info,
        updated_at  =  excluded.updated_at;

insert  into  public.store_categories  (id,  slug,  name,  description,  display_order,  is_active,  created_at,  updated_at)
values
    ('40000000-0000-4000-8000-000000000001',  'alfaiataria',  'Alfaiataria',  'Peças  estruturadas  com  acabamento  refinado.',  1,  true,  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:00:00-03:00'),
    ('40000000-0000-4000-8000-000000000002',  'vestidos',  'Vestidos',  'Vestidos  de  festa,  eventos  e  coleções  autorais.',  2,  true,  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:00:00-03:00')
on  conflict  (id)  do  update
set  slug  =  excluded.slug,
        name  =  excluded.name,
        description  =  excluded.description,
        display_order  =  excluded.display_order,
        updated_at  =  excluded.updated_at;

insert  into  public.store_collections  (id,  slug,  name,  theme_style,  description,  is_featured,  is_active,  starts_at,  ends_at,  created_at,  updated_at)
values
    ('41000000-0000-4000-8000-000000000001',  'noir-signature',  'Noir  Signature',  'dramatico-luxo',  'Capsula  com  preto  profundo,  brilho  controlado  e  alfaiataria  premium.',  true,  true,  '2026-04-01T00:00:00-03:00',  null,  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:00:00-03:00'),
    ('41000000-0000-4000-8000-000000000002',  'aura-studio',  'Aura  Studio',  'urbano-fluido',  'Linha  mais  leve  para  loja  online,  agenda  urbana  e  styling  contemporaneo.',  true,  true,  '2026-04-01T00:00:00-03:00',  null,  '2026-04-01T08:00:00-03:00',  '2026-04-20T08:00:00-03:00')
on  conflict  (id)  do  update
set  slug  =  excluded.slug,
        name  =  excluded.name,
        theme_style  =  excluded.theme_style,
        description  =  excluded.description,
        is_featured  =  excluded.is_featured,
        updated_at  =  excluded.updated_at;

insert  into  public.store_products  (
    id,  slug,  sku_base,  name,  short_description,  description,  characteristics,  category_id,  collection_id,  theme_style,  base_price,  compare_at_price,  low_stock_threshold,  is_featured,  is_new_arrival,  is_active,  sort_order,  metadata,  created_by,  created_at,  updated_at
)
values
    ('42000000-0000-4000-8000-000000000001',  'blazer-noir-signature',  'NOIR-BLZ',  'Blazer  Noir  Signature',  'Blazer  estruturado  com  acabamento  premium.',  'Blazer  de  alfaiataria  com  ombro  levemente  marcado,  forro  interno  acetinado  e  proposta  sofisticada  para  eventos  e  styling  urbano.',  array['forro  acetinado','acabamento  premium','alfaiataria'],  '40000000-0000-4000-8000-000000000001',  '41000000-0000-4000-8000-000000000001',  'luxo-estruturado',  459.00,  529.00,  2,  true,  true,  true,  1,  '{"highlight":"hero-store"}'::jsonb,  '20000000-0000-4000-8000-000000000003',  '2026-04-01T08:30:00-03:00',  '2026-04-20T08:30:00-03:00'),
    ('42000000-0000-4000-8000-000000000002',  'vestido-satin-atelier',  'AURA-VST',  'Vestido  Satin  Atelier',  'Vestido  de  evento  com  brilho  discreto.',  'Vestido  midi  com  recorte  clean,  tecido  acetinado  e  proposta  para  festas  intimistas,  eventos  e  atendimento  premium.',  array['caimento  leve','evento','atelier'],  '40000000-0000-4000-8000-000000000002',  '41000000-0000-4000-8000-000000000002',  'evento-fluido',  689.00,  null,  1,  true,  true,  true,  2,  '{"channel":"store"}'::jsonb,  '20000000-0000-4000-8000-000000000003',  '2026-04-01T08:40:00-03:00',  '2026-04-20T08:40:00-03:00'),
    ('42000000-0000-4000-8000-000000000003',  'camisa-capsule-aura',  'AURA-CMS',  'Camisa  Capsule  Aura',  'Camisa  premium  para  agenda  urbana.',  'Camisa  de  base  nobre  com  toque  macio,  shape  contemporaneo  e  acabamento  interno  pensado  para  uso  frequente.',  array['toque  macio','uso  diario','acabamento  fino'],  '40000000-0000-4000-8000-000000000001',  '41000000-0000-4000-8000-000000000002',  'urbano-clean',  329.00,  379.00,  2,  false,  true,  true,  3,  '{"channel":"store"}'::jsonb,  '20000000-0000-4000-8000-000000000003',  '2026-04-01T08:50:00-03:00',  '2026-04-20T08:50:00-03:00')
on  conflict  (id)  do  update
set  name  =  excluded.name,
        short_description  =  excluded.short_description,
        description  =  excluded.description,
        category_id  =  excluded.category_id,
        collection_id  =  excluded.collection_id,
        base_price  =  excluded.base_price,
        compare_at_price  =  excluded.compare_at_price,
        low_stock_threshold  =  excluded.low_stock_threshold,
        is_featured  =  excluded.is_featured,
        is_new_arrival  =  excluded.is_new_arrival,
        is_active  =  excluded.is_active,
        sort_order  =  excluded.sort_order,
        metadata  =  excluded.metadata,
        updated_at  =  excluded.updated_at;

insert  into  public.store_product_variants  (
    id,  product_id,  sku,  size_label,  color_label,  variation_label,  stock_quantity,  reserved_quantity,  low_stock_threshold,  price_override,  is_active,  metadata,  created_at,  updated_at
)
values
    ('43000000-0000-4000-8000-000000000001',  '42000000-0000-4000-8000-000000000001',  'NOIR-BLZ-PRE-M',  'M',  'Preto  fosco',  'Preto  fosco  /  M',  6,  1,  2,  null,  true,  '{}'::jsonb,  '2026-04-01T09:00:00-03:00',  '2026-04-20T09:00:00-03:00'),
    ('43000000-0000-4000-8000-000000000002',  '42000000-0000-4000-8000-000000000001',  'NOIR-BLZ-PRE-G',  'G',  'Preto  fosco',  'Preto  fosco  /  G',  4,  0,  2,  null,  true,  '{}'::jsonb,  '2026-04-01T09:00:00-03:00',  '2026-04-20T09:00:00-03:00'),
    ('43000000-0000-4000-8000-000000000003',  '42000000-0000-4000-8000-000000000002',  'AURA-VST-CHA-P',  'P',  'Champagne',  'Champagne  /  P',  4,  1,  1,  null,  true,  '{}'::jsonb,  '2026-04-01T09:10:00-03:00',  '2026-04-20T09:10:00-03:00'),
    ('43000000-0000-4000-8000-000000000004',  '42000000-0000-4000-8000-000000000002',  'AURA-VST-CHA-M',  'M',  'Champagne',  'Champagne  /  M',  2,  0,  1,  null,  true,  '{}'::jsonb,  '2026-04-01T09:10:00-03:00',  '2026-04-20T09:10:00-03:00'),
    ('43000000-0000-4000-8000-000000000005',  '42000000-0000-4000-8000-000000000003',  'AURA-CMS-OFF-M',  'M',  'Off  white',  'Off  white  /  M',  7,  0,  2,  null,  true,  '{}'::jsonb,  '2026-04-01T09:20:00-03:00',  '2026-04-20T09:20:00-03:00'),
    ('43000000-0000-4000-8000-000000000006',  '42000000-0000-4000-8000-000000000003',  'AURA-CMS-PRE-G',  'G',  'Preto',  'Preto  /  G',  3,  0,  2,  null,  true,  '{}'::jsonb,  '2026-04-01T09:20:00-03:00',  '2026-04-20T09:20:00-03:00')
on  conflict  (id)  do  update
set  stock_quantity  =  excluded.stock_quantity,
        reserved_quantity  =  excluded.reserved_quantity,
        low_stock_threshold  =  excluded.low_stock_threshold,
        is_active  =  excluded.is_active,
        updated_at  =  excluded.updated_at;

insert  into  public.store_product_images  (id,  product_id,  variant_id,  image_url,  alt_text,  display_order,  created_at)
values
    ('44000000-0000-4000-8000-000000000001',  '42000000-0000-4000-8000-000000000001',  null,  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',  'Blazer  Noir  Signature',  1,  '2026-04-01T09:30:00-03:00'),
    ('44000000-0000-4000-8000-000000000002',  '42000000-0000-4000-8000-000000000002',  null,  'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80',  'Vestido  Satin  Atelier',  1,  '2026-04-01T09:30:00-03:00'),
    ('44000000-0000-4000-8000-000000000003',  '42000000-0000-4000-8000-000000000003',  null,  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',  'Camisa  Capsule  Aura',  1,  '2026-04-01T09:30:00-03:00')
on  conflict  (id)  do  update
set  image_url  =  excluded.image_url,
        alt_text  =  excluded.alt_text,
        display_order  =  excluded.display_order;

insert  into  public.custom_orders  (
    id,  public_id,  user_id,  audience,  production_mode,  request_type,  piece_type,  piece_type_other,  size_standard,  size_custom,  modeling,  piece_length,  measurements,  reference_notes,  exclusive_creation_details,  fabric_type,  fabric_tier,  notions,  notions_total,  complexity,  desired_deadline,  desired_deadline_reason,  visual_notes,  final_notes,  contact_full_name,  contact_email,  contact_whatsapp,  terms_accepted,  estimate_acknowledged,  estimated_price,  estimate_breakdown,  status,  submitted_at,  created_at,  updated_at
)
values
    (101,  '50000000-0000-4000-8000-000000000101',  '10000000-0000-4000-8000-000000000001',  'feminino',  'sob_medida',  'referencia_imagem',  'vestido',  null,  null,  null,  null,  null,  '{"busto":90,"cintura":72,"quadril":98,"comprimento_manga":60,"comprimento_pernas":112}'::jsonb,  'Vestido  para  jantar  de  gala  com  referência  enviada  em  PDF.',  '{}'::jsonb,  'cetim',  'nobre',  array['forro','ziper_invisivel'],  2,  'premium',  '2026-05-12',  'Evento  familiar  em  São  Paulo.',  'Quero  uma  silhueta  elegante  com  brilho  discreto.',  'Se  possível,  considerar  prova  presencial.',  'Ana  Martins',  'ana@projeto-ecommerce.demo',  '11988112233',  true,  true,  1680.00,  '{"estimatedTotal":1680,"notionsTotal":2,"fabricTier":"nobre"}'::jsonb,  'em_analise_inicial',  '2026-04-16T14:00:00-03:00',  '2026-04-16T13:45:00-03:00',  '2026-04-18T09:00:00-03:00'),
    (102,  '50000000-0000-4000-8000-000000000102',  '10000000-0000-4000-8000-000000000002',  'feminino',  'sob_medida',  'criacao_exclusiva',  'conjunto',  null,  null,  null,  null,  null,  '{"busto":92,"cintura":74,"quadril":100,"comprimento_manga":58,"comprimento_pernas":108}'::jsonb,  'Conjunto  para  editorial  autoral.',  '{"estilo":"minimalista","cor_desejada":"off  white"}'::jsonb,  'alfaiataria',  'intermediario',  array['botoes','forro'],  2,  'avancada',  '2026-05-25',  'Shooting  e  campanha  interna.',  'Gostaria  de  proposta  com  calca  e  blazer  leve.',  'Preciso  aprovar  rápido  para  seguir  com  agenda.',  'Mariana  Falcão',  'mariana@projeto-ecommerce.demo',  '11988223344',  true,  true,  1420.00,  '{"estimatedTotal":1420,"notionsTotal":2,"fabricTier":"intermediário"}'::jsonb,  'aguardando_confirmacao_da_cliente',  '2026-04-14T11:20:00-03:00',  '2026-04-14T10:40:00-03:00',  '2026-04-18T17:20:00-03:00'),
    (103,  '50000000-0000-4000-8000-000000000103',  '10000000-0000-4000-8000-000000000003',  'feminino',  'sob_medida',  'referencia_imagem',  'corset',  null,  null,  null,  null,  null,  '{"busto":88,"cintura":68,"quadril":94,"comprimento_manga":55,"comprimento_pernas":105}'::jsonb,  'Corset  com  referência  de  passarela  e  ajuste  para  evento  noturno.',  '{}'::jsonb,  'renda',  'nobre',  array['barbatanas','forro','ziper_invisivel'],  3,  'premium',  '2026-05-05',  'Evento  em  hotel  no  Rio  de  Janeiro.',  'Preciso  de  sustentação  e  acabamento  premium.',  'Atenção  especial  ao  conforto  da  peça.',  'Renata  Campos',  'renata@projeto-ecommerce.demo',  '11988334455',  true,  true,  1890.00,  '{"estimatedTotal":1890,"notionsTotal":3,"fabricTier":"nobre"}'::jsonb,  'pedido_recebido',  '2026-04-10T15:10:00-03:00',  '2026-04-10T14:30:00-03:00',  '2026-04-18T12:15:00-03:00'),
    (104,  '50000000-0000-4000-8000-000000000104',  '10000000-0000-4000-8000-000000000001',  'feminino',  'sob_medida',  'criacao_exclusiva',  'blazer',  null,  null,  null,  null,  null,  '{"ombro":41,"busto":91,"cintura":73,"quadril":97,"comprimento_manga":59,"comprimento_pernas":109}'::jsonb,  'Blazer  exclusivo  para  retirada  presencial.',  '{"estilo":"alfaiataria  leve","cor_desejada":"preto"}'::jsonb,  'alfaiataria',  'intermediario',  array['forro','botoes'],  2,  'avancada',  '2026-04-28',  'Entrega  antes  de  viagem  corporativa.',  'Desejo  ombro  bem  resolvido  e  cintura  marcada.',  'Pode  ser  retirado  no  atelier.',  'Ana  Martins',  'ana@projeto-ecommerce.demo',  '11988112233',  true,  true,  1320.00,  '{"estimatedTotal":1320,"notionsTotal":2,"fabricTier":"intermediário"}'::jsonb,  'pedido_recebido',  '2026-04-08T16:30:00-03:00',  '2026-04-08T15:45:00-03:00',  '2026-04-18T14:00:00-03:00'),
    (105,  '50000000-0000-4000-8000-000000000105',  '10000000-0000-4000-8000-000000000002',  'feminino',  'sob_medida',  'referencia_imagem',  'vestido',  null,  null,  null,  null,  null,  '{"busto":93,"cintura":75,"quadril":101,"comprimento_manga":57,"comprimento_pernas":110}'::jsonb,  'Vestido  de  madrinha  já  concluído  e  entregue.',  '{}'::jsonb,  'chiffon',  'intermediario',  array['forro','ziper_invisivel'],  2,  'avancada',  '2026-04-15',  'Entrega  concluída.',  'Cliente  pediu  leveza  e  movimento.',  'Projeto  encerrado  com  prova  final  aprovada.',  'Mariana  Falcão',  'mariana@projeto-ecommerce.demo',  '11988223344',  true,  true,  1480.00,  '{"estimatedTotal":1480,"notionsTotal":2,"fabricTier":"intermediário"}'::jsonb,  'pedido_encerrado',  '2026-04-01T12:00:00-03:00',  '2026-04-01T11:10:00-03:00',  '2026-04-16T18:20:00-03:00')
on  conflict  (id)  do  update
set  user_id  =  excluded.user_id,
        estimated_price  =  excluded.estimated_price,
        estimate_breakdown  =  excluded.estimate_breakdown,
        status  =  excluded.status,
        updated_at  =  excluded.updated_at;

insert  into  public.custom_order_attachments  (id,  order_id,  storage_bucket,  storage_path,  original_file_name,  mime_type,  file_size_bytes,  created_at)
values
    ('51000000-0000-4000-8000-000000000001',  101,  'custom-orders',  'orders/PED-000101/referencia-vestido.pdf',  'referencia-vestido.pdf',  'application/pdf',  582144,  '2026-04-16T13:50:00-03:00'),
    ('51000000-0000-4000-8000-000000000002',  102,  'custom-orders',  'orders/PED-000102/editorial-conjunto.jpg',  'editorial-conjunto.jpg',  'image/jpeg',  412210,  '2026-04-14T10:45:00-03:00')
on  conflict  (id)  do  update
set  original_file_name  =  excluded.original_file_name,
        mime_type  =  excluded.mime_type,
        file_size_bytes  =  excluded.file_size_bytes;

insert  into  public.custom_order_design_options  (id,  order_id,  option_code,  title,  preview_image_url,  reference_pdf_url,  team_note,  is_visible_to_client,  created_by,  created_at,  updated_at)
values
    ('52000000-0000-4000-8000-000000000001',  102,  'MOD-01',  'Conjunto  editorial  com  cintura  marcada',  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',  null,  'Opção  com  blazer  leve  e  calca  reta  para  campanha  principal.',  true,  '20000000-0000-4000-8000-000000000001',  '2026-04-17T10:00:00-03:00',  '2026-04-17T10:00:00-03:00'),
    ('52000000-0000-4000-8000-000000000002',  102,  'MOD-02',  'Conjunto  minimalista  com  calca  ampla',  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',  null,  'Opção  com  leitura  mais  ampla  para  lookbook  secundario.',  true,  '20000000-0000-4000-8000-000000000001',  '2026-04-17T10:05:00-03:00',  '2026-04-17T10:05:00-03:00')
on  conflict  (id)  do  update
set  title  =  excluded.title,
        team_note  =  excluded.team_note,
        updated_at  =  excluded.updated_at;

insert  into  public.custom_order_final_quotes  (
    id,  order_id,  currency_code,  final_amount,  quote_summary,  quote_breakdown,  available_at,  approved_by_client_at,  selected_payment_method,  payment_status,  payment_reference,  payment_confirmed_at,  production_started_at,  ready_to_ship_at,  shipped_at,  delivered_at,  updated_by,  created_at,  updated_at
)
values
    ('53000000-0000-4000-8000-000000000001',  102,  'BRL',  1580.00,  'Conjunto  editorial  com  prova  rápida  e  acabamento  premium.',  '{"tecido":780,"modelagem":460,"acabamento":340}'::jsonb,  '2026-04-18T17:10:00-03:00',  null,  null,  'awaiting_payment',  'PIX-CUSTOM-102',  null,  null,  null,  null,  null,  '20000000-0000-4000-8000-000000000002',  '2026-04-18T17:10:00-03:00',  '2026-04-18T17:10:00-03:00'),
    ('53000000-0000-4000-8000-000000000002',  103,  'BRL',  1890.00,  'Corset  com  construcao  premium,  barbatanas  e  prova  final  incluída.',  '{"tecido":820,"estrutura":690,"acabamento":380}'::jsonb,  '2026-04-12T16:00:00-03:00',  '2026-04-12T18:00:00-03:00',  'pix',  'approved',  'PIX-CUSTOM-103',  '2026-04-13T09:30:00-03:00',  '2026-04-14T08:00:00-03:00',  null,  null,  null,  '20000000-0000-4000-8000-000000000002',  '2026-04-12T16:00:00-03:00',  '2026-04-18T12:15:00-03:00'),
    ('53000000-0000-4000-8000-000000000003',  104,  'BRL',  1320.00,  'Blazer  sob  medida  aprovado  com  retirada  no  atelier.',  '{"tecido":540,"modelagem":420,"acabamento":360}'::jsonb,  '2026-04-09T10:00:00-03:00',  '2026-04-09T14:00:00-03:00',  'cartao',  'approved',  'CARD-CUSTOM-104',  '2026-04-09T14:15:00-03:00',  '2026-04-10T09:00:00-03:00',  '2026-04-20T09:00:00-03:00',  null,  null,  '20000000-0000-4000-8000-000000000002',  '2026-04-09T10:00:00-03:00',  '2026-04-20T09:00:00-03:00'),
    ('53000000-0000-4000-8000-000000000004',  105,  'BRL',  1480.00,  'Vestido  finalizado  e  entregue  com  sucesso.',  '{"tecido":620,"modelagem":460,"acabamento":400}'::jsonb,  '2026-04-02T11:00:00-03:00',  '2026-04-02T15:00:00-03:00',  'pix',  'approved',  'PIX-CUSTOM-105',  '2026-04-02T15:10:00-03:00',  '2026-04-04T09:00:00-03:00',  '2026-04-10T11:00:00-03:00',  '2026-04-11T08:30:00-03:00',  '2026-04-15T13:30:00-03:00',  '20000000-0000-4000-8000-000000000002',  '2026-04-02T11:00:00-03:00',  '2026-04-15T13:30:00-03:00')
on  conflict  (id)  do  update
set  final_amount  =  excluded.final_amount,
        payment_status  =  excluded.payment_status,
        payment_reference  =  excluded.payment_reference,
        updated_at  =  excluded.updated_at;

insert  into  public.custom_order_fulfillments  (
    id,  order_id,  delivery_mode,  delivery_address_snapshot,  tracking_code,  tracking_link,  pickup_address,  pickup_instructions,  notified_at,  created_at,  updated_at
)
values
    ('54000000-0000-4000-8000-000000000001',  103,  'entrega',  '{"city":"Rio  de  Janeiro","state":"RJ"}'::jsonb,  null,  null,  null,  null,  '2026-04-14T09:00:00-03:00',  '2026-04-14T09:00:00-03:00',  '2026-04-18T12:15:00-03:00'),
    ('54000000-0000-4000-8000-000000000002',  104,  'retirada',  '{}'::jsonb,  null,  null,  'Maison  Aurea  Atelier  -  Rua  Haddock  Lobo,  640',  'Retirar  com  documento  e  horário  confirmado.',  '2026-04-20T09:10:00-03:00',  '2026-04-20T09:00:00-03:00',  '2026-04-20T09:10:00-03:00'),
    ('54000000-0000-4000-8000-000000000003',  105,  'entrega',  '{"city":"São  Paulo","state":"SP"}'::jsonb,  'BRCUSTOM105',  'https://mock.shipping.local/rastreio/BRCUSTOM105',  null,  null,  '2026-04-11T08:35:00-03:00',  '2026-04-11T08:30:00-03:00',  '2026-04-15T13:30:00-03:00')
on  conflict  (id)  do  update
set  tracking_code  =  excluded.tracking_code,
        tracking_link  =  excluded.tracking_link,
        updated_at  =  excluded.updated_at;

insert  into  public.custom_order_appointments  (
    id,  order_id,  user_id,  appointment_type,  attendance_mode,  scheduled_for,  status,  notes,  created_at,  updated_at
)
values
    ('55000000-0000-4000-8000-000000000001',  101,  '10000000-0000-4000-8000-000000000001',  'tirar_medidas',  'presencial',  '2026-04-22T15:00:00-03:00',  'confirmado',  'Medidas  iniciais  no  atelier.',  '2026-04-18T09:05:00-03:00',  '2026-04-18T09:05:00-03:00'),
    ('55000000-0000-4000-8000-000000000002',  104,  '10000000-0000-4000-8000-000000000001',  'retirada',  'presencial',  '2026-04-21T17:00:00-03:00',  'confirmado',  'Retirada  do  blazer  sob  medida.',  '2026-04-20T09:05:00-03:00',  '2026-04-20T09:05:00-03:00'),
    ('55000000-0000-4000-8000-000000000003',  105,  '10000000-0000-4000-8000-000000000002',  'alinhamento_pedido',  'online',  '2026-04-05T11:00:00-03:00',  'concluido',  'Aprovação  final  antes  da  entrega.',  '2026-04-04T10:00:00-03:00',  '2026-04-05T11:40:00-03:00')
on  conflict  (id)  do  update
set  status  =  excluded.status,
        notes  =  excluded.notes,
        updated_at  =  excluded.updated_at;

insert  into  public.store_orders  (
    id,  public_id,  user_id,  status,  payment_method,  payment_status,  subtotal,  shipping_cost,  total_amount,  shipping_carrier,  tracking_code,  tracking_link,  shipped_at,  delivered_at,  created_at,  updated_at,  shipping_address_id,  shipping_address_snapshot,  billing_address_snapshot,  cart_snapshot,  delivery_mode,  paid_at,  payment_reference,  reserved_at,  stock_deducted_at,  notes_internal
)
values
    (201,  '60000000-0000-4000-8000-000000000201',  '10000000-0000-4000-8000-000000000003',  'pedido_recebido',  'pix',  'awaiting_payment',  459.00,  28.90,  487.90,  null,  null,  null,  null,  null,  '2026-04-19T15:10:00-03:00',  '2026-04-19T15:10:00-03:00',  '30000000-0000-4000-8000-000000000003',  '{"recipient_name":"Renata  Campos","street":"Rua  Voluntarios  da  Patria","number":"990","city":"Rio  de  Janeiro","state":"RJ","zip_code":"22790120"}'::jsonb,  '{"recipient_name":"Renata  Campos","street":"Rua  Voluntarios  da  Patria","number":"990","city":"Rio  de  Janeiro","state":"RJ","zip_code":"22790120"}'::jsonb,  '[{"sku":"NOIR-BLZ-PRE-M","product_name":"Blazer  Noir  Signature","quantity":1,"unit_price":459}]'::jsonb,  'entrega',  null,  'PIX-STORE-201',  null,  null,  'Checkout  criado  com  integrações  mock.'),
    (202,  '60000000-0000-4000-8000-000000000202',  '10000000-0000-4000-8000-000000000002',  'em_separacao',  'cartao',  'approved',  689.00,  24.90,  713.90,  'Correios  Expresso  Mock',  null,  null,  null,  null,  '2026-04-18T10:20:00-03:00',  '2026-04-18T12:40:00-03:00',  '30000000-0000-4000-8000-000000000002',  '{"recipient_name":"Mariana  Falcão","street":"Rua  Cubatao","number":"150","city":"São  Paulo","state":"SP","zip_code":"04002001"}'::jsonb,  '{"recipient_name":"Mariana  Falcão","street":"Rua  Cubatao","number":"150","city":"São  Paulo","state":"SP","zip_code":"04002001"}'::jsonb,  '[{"sku":"AURA-VST-CHA-P","product_name":"Vestido  Satin  Atelier","quantity":1,"unit_price":689}]'::jsonb,  'entrega',  '2026-04-18T10:40:00-03:00',  'CARD-STORE-202',  '2026-04-18T10:45:00-03:00',  null,  'Pagamento  aprovado,  separação  iniciada.'),
    (203,  '60000000-0000-4000-8000-000000000203',  '10000000-0000-4000-8000-000000000001',  'pronto_para_envio',  'pix',  'approved',  329.00,  19.90,  348.90,  'Correios  Expresso  Mock',  null,  null,  null,  null,  '2026-04-17T14:10:00-03:00',  '2026-04-20T09:40:00-03:00',  '30000000-0000-4000-8000-000000000001',  '{"recipient_name":"Ana  Martins","street":"Rua  Bela  Cintra","number":"220","city":"São  Paulo","state":"SP","zip_code":"01311000"}'::jsonb,  '{"recipient_name":"Ana  Martins","street":"Rua  Bela  Cintra","number":"220","city":"São  Paulo","state":"SP","zip_code":"01311000"}'::jsonb,  '[{"sku":"AURA-CMS-OFF-M","product_name":"Camisa  Capsule  Aura","quantity":1,"unit_price":329}]'::jsonb,  'entrega',  '2026-04-17T14:30:00-03:00',  'PIX-STORE-203',  '2026-04-17T14:35:00-03:00',  null,  'Aguardando  postagem.'),
    (204,  '60000000-0000-4000-8000-000000000204',  '10000000-0000-4000-8000-000000000001',  'enviado',  'cartao',  'approved',  459.00,  22.90,  481.90,  'Correios  Expresso  Mock',  'TRKSTORE204',  'https://mock.shipping.local/rastreio/TRKSTORE204',  '2026-04-20T11:05:00-03:00',  null,  '2026-04-16T13:10:00-03:00',  '2026-04-20T11:05:00-03:00',  '30000000-0000-4000-8000-000000000001',  '{"recipient_name":"Ana  Martins","street":"Rua  Bela  Cintra","number":"220","city":"São  Paulo","state":"SP","zip_code":"01311000"}'::jsonb,  '{"recipient_name":"Ana  Martins","street":"Rua  Bela  Cintra","number":"220","city":"São  Paulo","state":"SP","zip_code":"01311000"}'::jsonb,  '[{"sku":"NOIR-BLZ-PRE-G","product_name":"Blazer  Noir  Signature","quantity":1,"unit_price":459}]'::jsonb,  'entrega',  '2026-04-16T13:25:00-03:00',  'CARD-STORE-204',  '2026-04-16T13:30:00-03:00',  '2026-04-20T11:05:00-03:00',  'Envio  realizado  pela  equipe  de  operações.'),
    (205,  '60000000-0000-4000-8000-000000000205',  '10000000-0000-4000-8000-000000000002',  'entregue',  'pix',  'approved',  329.00,  18.90,  347.90,  'Transportadora  Mock',  'TRKSTORE205',  'https://mock.shipping.local/rastreio/TRKSTORE205',  '2026-04-12T08:20:00-03:00',  '2026-04-15T10:10:00-03:00',  '2026-04-10T17:00:00-03:00',  '2026-04-15T10:10:00-03:00',  '30000000-0000-4000-8000-000000000002',  '{"recipient_name":"Mariana  Falcão","street":"Rua  Cubatao","number":"150","city":"São  Paulo","state":"SP","zip_code":"04002001"}'::jsonb,  '{"recipient_name":"Mariana  Falcão","street":"Rua  Cubatao","number":"150","city":"São  Paulo","state":"SP","zip_code":"04002001"}'::jsonb,  '[{"sku":"AURA-CMS-PRE-G","product_name":"Camisa  Capsule  Aura","quantity":1,"unit_price":329}]'::jsonb,  'entrega',  '2026-04-10T17:20:00-03:00',  'PIX-STORE-205',  '2026-04-10T17:25:00-03:00',  '2026-04-12T08:20:00-03:00',  'Pedido  concluído  e  entregue.')
on  conflict  (id)  do  update
set  status  =  excluded.status,
        payment_status  =  excluded.payment_status,
        shipping_carrier  =  excluded.shipping_carrier,
        tracking_code  =  excluded.tracking_code,
        tracking_link  =  excluded.tracking_link,
        updated_at  =  excluded.updated_at;

insert  into  public.store_order_items  (
    id,  order_id,  product_id,  variant_id,  sku,  product_name,  variant_description,  quantity,  unit_price,  size_label,  color_label,  collection_name,  image_url,  was_reserved,  reserved_at,  deducted_at,  metadata,  created_at
)
values
    ('61000000-0000-4000-8000-000000000001',  201,  '42000000-0000-4000-8000-000000000001',  '43000000-0000-4000-8000-000000000001',  'NOIR-BLZ-PRE-M',  'Blazer  Noir  Signature',  'Preto  fosco  /  M',  1,  459.00,  'M',  'Preto  fosco',  'Noir  Signature',  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',  false,  null,  null,  '{}'::jsonb,  '2026-04-19T15:10:00-03:00'),
    ('61000000-0000-4000-8000-000000000002',  202,  '42000000-0000-4000-8000-000000000002',  '43000000-0000-4000-8000-000000000003',  'AURA-VST-CHA-P',  'Vestido  Satin  Atelier',  'Champagne  /  P',  1,  689.00,  'P',  'Champagne',  'Aura  Studio',  'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80',  true,  '2026-04-18T10:45:00-03:00',  null,  '{}'::jsonb,  '2026-04-18T10:20:00-03:00'),
    ('61000000-0000-4000-8000-000000000003',  203,  '42000000-0000-4000-8000-000000000003',  '43000000-0000-4000-8000-000000000005',  'AURA-CMS-OFF-M',  'Camisa  Capsule  Aura',  'Off  white  /  M',  1,  329.00,  'M',  'Off  white',  'Aura  Studio',  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',  true,  '2026-04-17T14:35:00-03:00',  null,  '{}'::jsonb,  '2026-04-17T14:10:00-03:00'),
    ('61000000-0000-4000-8000-000000000004',  204,  '42000000-0000-4000-8000-000000000001',  '43000000-0000-4000-8000-000000000002',  'NOIR-BLZ-PRE-G',  'Blazer  Noir  Signature',  'Preto  fosco  /  G',  1,  459.00,  'G',  'Preto  fosco',  'Noir  Signature',  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',  true,  '2026-04-16T13:30:00-03:00',  '2026-04-20T11:05:00-03:00',  '{}'::jsonb,  '2026-04-16T13:10:00-03:00'),
    ('61000000-0000-4000-8000-000000000005',  205,  '42000000-0000-4000-8000-000000000003',  '43000000-0000-4000-8000-000000000006',  'AURA-CMS-PRE-G',  'Camisa  Capsule  Aura',  'Preto  /  G',  1,  329.00,  'G',  'Preto',  'Aura  Studio',  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',  true,  '2026-04-10T17:25:00-03:00',  '2026-04-12T08:20:00-03:00',  '{}'::jsonb,  '2026-04-10T17:00:00-03:00')
on  conflict  (id)  do  update
set  quantity  =  excluded.quantity,
        unit_price  =  excluded.unit_price,
        was_reserved  =  excluded.was_reserved,
        reserved_at  =  excluded.reserved_at,
        deducted_at  =  excluded.deducted_at;

insert  into  public.store_order_invoices  (
    id,  order_id,  total_amount,  currency_code,  invoice_payload,  invoice_url,  issued_at,  emailed_at,  created_at,  updated_at
)
values
    (301,  201,  487.90,  'BRL',  '{"payment_reference":"PIX-STORE-201","provider":"mock_gateway"}'::jsonb,  'https://mock.invoice.local/NF-MOCK-301',  '2026-04-19T15:15:00-03:00',  '2026-04-19T15:16:00-03:00',  '2026-04-19T15:15:00-03:00',  '2026-04-19T15:16:00-03:00'),
    (302,  202,  713.90,  'BRL',  '{"payment_reference":"CARD-STORE-202","provider":"mock_invoice"}'::jsonb,  'https://mock.invoice.local/NF-MOCK-302',  '2026-04-18T10:25:00-03:00',  '2026-04-18T10:27:00-03:00',  '2026-04-18T10:25:00-03:00',  '2026-04-18T10:27:00-03:00'),
    (303,  203,  348.90,  'BRL',  '{"payment_reference":"PIX-STORE-203","provider":"mock_invoice"}'::jsonb,  'https://mock.invoice.local/NF-MOCK-303',  '2026-04-17T14:15:00-03:00',  '2026-04-17T14:17:00-03:00',  '2026-04-17T14:15:00-03:00',  '2026-04-17T14:17:00-03:00'),
    (304,  204,  481.90,  'BRL',  '{"payment_reference":"CARD-STORE-204","provider":"mock_invoice"}'::jsonb,  'https://mock.invoice.local/NF-MOCK-304',  '2026-04-16T13:15:00-03:00',  '2026-04-16T13:18:00-03:00',  '2026-04-16T13:15:00-03:00',  '2026-04-16T13:18:00-03:00'),
    (305,  205,  347.90,  'BRL',  '{"payment_reference":"PIX-STORE-205","provider":"mock_invoice"}'::jsonb,  'https://mock.invoice.local/NF-MOCK-305',  '2026-04-10T17:05:00-03:00',  '2026-04-10T17:07:00-03:00',  '2026-04-10T17:05:00-03:00',  '2026-04-10T17:07:00-03:00')
on  conflict  (id)  do  update
set  total_amount  =  excluded.total_amount,
        invoice_payload  =  excluded.invoice_payload,
        invoice_url  =  excluded.invoice_url,
        updated_at  =  excluded.updated_at;

insert  into  public.store_stock_movements  (
    id,  variant_id,  product_id,  order_id,  order_item_id,  movement_type,  quantity,  previous_stock_quantity,  new_stock_quantity,  previous_reserved_quantity,  new_reserved_quantity,  note,  metadata,  created_by,  created_at
)
values
    (401,  '43000000-0000-4000-8000-000000000003',  '42000000-0000-4000-8000-000000000002',  202,  '61000000-0000-4000-8000-000000000002',  'reserved_on_payment',  1,  4,  4,  0,  1,  'Reserva  após  pagamento  aprovado.',  '{"payment_reference":"CARD-STORE-202"}'::jsonb,  '20000000-0000-4000-8000-000000000002',  '2026-04-18T10:45:00-03:00'),
    (402,  '43000000-0000-4000-8000-000000000005',  '42000000-0000-4000-8000-000000000003',  203,  '61000000-0000-4000-8000-000000000003',  'reserved_on_payment',  1,  7,  7,  0,  1,  'Reserva  após  pagamento  aprovado.',  '{"payment_reference":"PIX-STORE-203"}'::jsonb,  '20000000-0000-4000-8000-000000000002',  '2026-04-17T14:35:00-03:00'),
    (403,  '43000000-0000-4000-8000-000000000002',  '42000000-0000-4000-8000-000000000001',  204,  '61000000-0000-4000-8000-000000000004',  'reserved_on_payment',  1,  4,  4,  0,  1,  'Reserva  após  pagamento  aprovado.',  '{"payment_reference":"CARD-STORE-204"}'::jsonb,  '20000000-0000-4000-8000-000000000002',  '2026-04-16T13:30:00-03:00'),
    (404,  '43000000-0000-4000-8000-000000000002',  '42000000-0000-4000-8000-000000000001',  204,  '61000000-0000-4000-8000-000000000004',  'deducted_on_shipping',  1,  4,  3,  1,  0,  'Baixa  no  envio  do  pedido.',  '{"tracking_code":"TRKSTORE204"}'::jsonb,  '20000000-0000-4000-8000-000000000003',  '2026-04-20T11:05:00-03:00'),
    (405,  '43000000-0000-4000-8000-000000000006',  '42000000-0000-4000-8000-000000000003',  205,  '61000000-0000-4000-8000-000000000005',  'reserved_on_payment',  1,  4,  4,  0,  1,  'Reserva  após  pagamento  aprovado.',  '{"payment_reference":"PIX-STORE-205"}'::jsonb,  '20000000-0000-4000-8000-000000000002',  '2026-04-10T17:25:00-03:00'),
    (406,  '43000000-0000-4000-8000-000000000006',  '42000000-0000-4000-8000-000000000003',  205,  '61000000-0000-4000-8000-000000000005',  'deducted_on_shipping',  1,  4,  3,  1,  0,  'Baixa  no  envio  do  pedido.',  '{"tracking_code":"TRKSTORE205"}'::jsonb,  '20000000-0000-4000-8000-000000000003',  '2026-04-12T08:20:00-03:00')
on  conflict  (id)  do  update
set  movement_type  =  excluded.movement_type,
        quantity  =  excluded.quantity,
        note  =  excluded.note,
        metadata  =  excluded.metadata,
        created_at  =  excluded.created_at;

insert  into  public.client_reviews  (
    id,  user_id,  target_type,  custom_order_id,  store_order_id,  rating,  headline,  comment,  is_public,  created_at,  updated_at
)
values
    ('62000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000002',  'custom_order',  105,  null,  5,  'Vestido  impecável',  'O  acompanhamento  foi  muito  claro  e  a  entrega  aconteceu  exatamente  no  que  foi  combinado.',  true,  '2026-04-16T18:40:00-03:00',  '2026-04-16T18:40:00-03:00'),
    ('62000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000002',  'store_order',  null,  205,  5,  'Loja  super  organizada',  'Recebi  atualizações,  nota  fiscal  e  rastreio  sem  precisar  pedir  nada.  Excelente  experiência.',  true,  '2026-04-16T19:10:00-03:00',  '2026-04-16T19:10:00-03:00')
on  conflict  (id)  do  update
set  rating  =  excluded.rating,
        headline  =  excluded.headline,
        comment  =  excluded.comment,
        updated_at  =  excluded.updated_at;

insert  into  public.account_deletion_requests  (
    id,  user_id,  reason,  status,  requested_at,  resolved_at,  resolved_by,  resolution_note,  created_at,  updated_at
)
values
    ('63000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000003',  'Solicitação  antiga  usada  apenas  para  teste  de  fluxo  LGPD.',  'rejected',  '2026-04-06T09:00:00-03:00',  '2026-04-07T14:30:00-03:00',  '20000000-0000-4000-8000-000000000001',  'Solicitação  encerrada  após  confirmação  da  permanencia  da  conta.',  '2026-04-06T09:00:00-03:00',  '2026-04-07T14:30:00-03:00')
on  conflict  (id)  do  update
set  status  =  excluded.status,
        resolved_at  =  excluded.resolved_at,
        resolution_note  =  excluded.resolution_note,
        updated_at  =  excluded.updated_at;

insert  into  public.internal_calendar_events  (
    id,  title,  description,  starts_at,  ends_at,  responsible_role,  is_all_day,  created_by,  created_at,  updated_at
)
values
    ('64000000-0000-4000-8000-000000000001',  'Revisão  de  banners  da  homepage',  'Ajustes  visuais  e  validacao  final  antes  da  publicação.',  '2026-04-21T10:00:00-03:00',  '2026-04-21T11:00:00-03:00',  'admin',  false,  '20000000-0000-4000-8000-000000000001',  '2026-04-20T08:25:00-03:00',  '2026-04-20T08:25:00-03:00'),
    ('64000000-0000-4000-8000-000000000002',  'Fechamento  financeiro  semanal',  'Conferencia  de  aprovações,  fretes  e  notas  emitidas.',  '2026-04-22T17:30:00-03:00',  '2026-04-22T18:30:00-03:00',  'finance',  false,  '20000000-0000-4000-8000-000000000001',  '2026-04-20T08:25:00-03:00',  '2026-04-20T08:25:00-03:00'),
    ('64000000-0000-4000-8000-000000000003',  'Despacho  de  pedidos  da  loja',  'Janela  operacional  para  expedição  de  pedidos  prontos.',  '2026-04-20T14:00:00-03:00',  '2026-04-20T17:00:00-03:00',  'sales_stock',  false,  '20000000-0000-4000-8000-000000000001',  '2026-04-20T08:25:00-03:00',  '2026-04-20T08:25:00-03:00')
on  conflict  (id)  do  update
set  title  =  excluded.title,
        description  =  excluded.description,
        starts_at  =  excluded.starts_at,
        ends_at  =  excluded.ends_at,
        updated_at  =  excluded.updated_at;

insert  into  public.internal_notifications  (
    id,  recipient_user_id,  recipient_role,  is_global,  channel,  title,  body,  payload,  status,  created_by,  created_at,  updated_at
)
values
    ('65000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000001',  'client',  false,  'in_app',  'Prova  presencial  confirmada',  'Sua  prova  presencial  do  protocolo  PED-000101  foi  confirmada  para  o  dia  22/04.',  '{"protocol_code":"PED-000101"}'::jsonb,  'pending',  '20000000-0000-4000-8000-000000000001',  '2026-04-20T08:40:00-03:00',  '2026-04-20T08:40:00-03:00'),
    ('65000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000002',  'client',  false,  'email',  'Orçamento  final  disponível',  'O  pedido  PED-000102  já  possui  orçamento  final  aguardando  sua  aprovação.',  '{"protocol_code":"PED-000102"}'::jsonb,  'pending',  '20000000-0000-4000-8000-000000000002',  '2026-04-18T17:15:00-03:00',  '2026-04-18T17:15:00-03:00'),
    ('65000000-0000-4000-8000-000000000003',  '10000000-0000-4000-8000-000000000001',  'client',  false,  'whatsapp',  'Pedido  enviado',  'Seu  pedido  LOJ-000204  foi  enviado  e  já  possui  rastreio.',  '{"order_number":"LOJ-000204","tracking_code":"TRKSTORE204"}'::jsonb,  'pending',  '20000000-0000-4000-8000-000000000003',  '2026-04-20T11:05:00-03:00',  '2026-04-20T11:05:00-03:00'),
    ('65000000-0000-4000-8000-000000000004',  null,  'sales_stock',  true,  'in_app',  'Reposição  monitorada',  'Variações  com  estoque  baixo  foram  priorizadas  no  painel  de  operações.',  '{"products":["Vestido  Satin  Atelier","Camisa  Capsule  Aura"]}'::jsonb,  'pending',  '20000000-0000-4000-8000-000000000001',  '2026-04-20T10:30:00-03:00',  '2026-04-20T10:30:00-03:00')
on  conflict  (id)  do  update
set  title  =  excluded.title,
        body  =  excluded.body,
        payload  =  excluded.payload,
        status  =  excluded.status,
        updated_at  =  excluded.updated_at;

insert  into  public.internal_audit_logs  (
    id,  actor_user_id,  actor_role,  event_name,  entity_table,  entity_id,  metadata,  created_at
)
values
    (501,  '20000000-0000-4000-8000-000000000001',  'admin',  'admin.update_brand_settings',  'brand_settings',  'singleton',  '{"updated_fields":["brand_name","support_email","support_whatsapp","address_text"]}'::jsonb,  '2026-04-18T20:10:00-03:00'),
    (502,  '20000000-0000-4000-8000-000000000002',  'finance',  'finance.update_order_after_unlock',  'custom_orders',  '50000000-0000-4000-8000-000000000103',  '{"protocol":"PED-000103","changed_fields":[{"field":"payment_status","previous":"awaiting_payment","next":"approved"}]}'::jsonb,  '2026-04-13T09:35:00-03:00'),
    (503,  '20000000-0000-4000-8000-000000000003',  'sales_stock',  'sales_stock.update_variant_stock',  'store_product_variants',  '43000000-0000-4000-8000-000000000004',  '{"sku":"AURA-VST-CHA-M","previous_stock":3,"next_stock":2}'::jsonb,  '2026-04-19T18:10:00-03:00'),
    (504,  '20000000-0000-4000-8000-000000000003',  'sales_stock',  'sales_stock.mark_store_order_shipped',  'store_orders',  '60000000-0000-4000-8000-000000000204',  '{"order_number":"LOJ-000204","tracking_code":"TRKSTORE204"}'::jsonb,  '2026-04-20T11:05:00-03:00'),
    (505,  '20000000-0000-4000-8000-000000000001',  'admin',  'admin.manage_internal_access',  'user_roles',  '20000000-0000-4000-8000-000000000003',  '{"access_email":"operacoes@projeto-ecommerce.demo","access_role":"sales_stock","is_primary":true}'::jsonb,  '2026-04-01T08:25:00-03:00')
on  conflict  (id)  do  update
set  metadata  =  excluded.metadata,
        created_at  =  excluded.created_at;

insert  into  public.system_backups  (
    id,  context_area,  entity_table,  entity_id,  backup_reason,  snapshot,  created_by,  created_at
)
values
    ('66000000-0000-4000-8000-000000000001',  'admin',  'brand_settings',  'singleton',  'before_technical_mode_publish',  '{"technical_published_payload":{"theme":"classic-black","homepageVersion":"demo-2026-03"}}'::jsonb,  '20000000-0000-4000-8000-000000000001',  '2026-04-18T20:00:00-03:00'),
    ('66000000-0000-4000-8000-000000000002',  'finance',  'store_orders',  '60000000-0000-4000-8000-000000000202',  'before_finance_unlock_update',  '{"payment_status":"awaiting_payment","invoice_url":null}'::jsonb,  '20000000-0000-4000-8000-000000000002',  '2026-04-18T10:35:00-03:00')
on  conflict  (id)  do  update
set  snapshot  =  excluded.snapshot,
        created_at  =  excluded.created_at;

insert  into  public.consent_records  (
    id,  user_id,  email,  consent_slug,  consent_version,  accepted,  accepted_at,  context_table,  context_id,  metadata,  created_at
)
values
    ('67000000-0000-4000-8000-000000000001',  '10000000-0000-4000-8000-000000000002',  'mariana@projeto-ecommerce.demo',  'tailored_order_terms',  '2026-04',  true,  '2026-04-14T11:20:00-03:00',  'custom_orders',  '50000000-0000-4000-8000-000000000102',  '{"protocol_code":"PED-000102"}'::jsonb,  '2026-04-14T11:20:00-03:00'),
    ('67000000-0000-4000-8000-000000000002',  '10000000-0000-4000-8000-000000000003',  'renata@projeto-ecommerce.demo',  'account_deletion_request',  '2026-04',  true,  '2026-04-06T09:00:00-03:00',  'account_deletion_requests',  '63000000-0000-4000-8000-000000000001',  '{"reason":"Solicitação  antiga  usada  apenas  para  teste  de  fluxo  LGPD."}'::jsonb,  '2026-04-06T09:00:00-03:00')
on  conflict  (id)  do  update
set  accepted_at  =  excluded.accepted_at,
        metadata  =  excluded.metadata;

select  setval('public.custom_orders_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.custom_orders),  1),  true);
select  setval('public.custom_order_status_history_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.custom_order_status_history),  1),  true);
select  setval('public.store_orders_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.store_orders),  1),  true);
select  setval('public.store_order_invoices_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.store_order_invoices),  1),  true);
select  setval('public.store_stock_movements_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.store_stock_movements),  1),  true);
select  setval('public.internal_audit_logs_id_seq',  greatest((select  coalesce(max(id),  1)  from  public.internal_audit_logs),  1),  true);
