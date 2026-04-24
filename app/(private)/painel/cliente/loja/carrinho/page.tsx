import  {  StoreCartExperience  }  from  "@/components/store/store-cart-experience";
import  {  requireRole  }  from  "@/lib/auth/guards";
import  {  getStoreUserCommerceData  }  from  "@/services/store/get-store-user-commerce-data";

export  default  async  function  ClientStoreCartPage()  {
    const  {  userId  }  =  await  requireRole(["client",  "admin"]);
    const  commerceData  =  await  getStoreUserCommerceData(userId);

    return  (
        <div  className="space-y-6">
            <header  className="space-y-2">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Área  da  cliente</p>
                <h1  className="text-4xl">Carrinho  e  checkout</h1>
                <p  className="text-muted-foreground">
                    Finalize  compras  da  loja,  gerencie  favoritos  e  salve  itens  para  depois.
                </p>
            </header>

            <StoreCartExperience  data={commerceData}  />
        </div>
    );
}
