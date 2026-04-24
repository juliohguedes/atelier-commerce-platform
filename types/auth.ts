export  const  userRoles  =  ["client",  "admin",  "finance",  "sales_stock"]  as  const;
export  const  internalUserRoles  =  ["admin",  "finance",  "sales_stock"]  as  const;

export  type  UserRole  =  (typeof  userRoles)[number];
export  type  InternalUserRole  =  (typeof  internalUserRoles)[number];

export  const  userRoleLabels:  Record<UserRole,  string>  =  {
    client:  "Cliente",
    admin:  "Admin",
    finance:  "Financeiro",
    sales_stock:  "Vendas  e  Estoque"
};

const  userRoleSet  =  new  Set<UserRole>(userRoles);
const  internalRoleSet  =  new  Set<InternalUserRole>(internalUserRoles);

export  interface  AuthUser  {
    id:  string;
    email:  string  |  null;
    role:  UserRole;
}

export  interface  UserProfile  {
    id:  string;
    full_name:  string;
    email:  string  |  null;
    whatsapp:  string  |  null;
    cpf:  string  |  null;
    preferred_locale:  string;
}

export  interface  UserAddress  {
    id:  string;
    user_id:  string;
    label:  string;
    recipient_name:  string;
    zip_code:  string;
    street:  string;
    number:  string;
    complement:  string  |  null;
    neighborhood:  string;
    city:  string;
    state:  string;
    is_primary:  boolean;
}

export  function  parseUserRole(value:  unknown):  UserRole  {
    if  (typeof  value  ===  "string"  &&  userRoleSet.has(value  as  UserRole))  {
        return  value  as  UserRole;
    }

    return  "client";
}

export  function  isInternalUserRole(value:  unknown):  value  is  InternalUserRole  {
    return  typeof  value  ===  "string"  &&  internalRoleSet.has(value  as  InternalUserRole);
}
