import  type  {  InvoiceAdapter  }  from  "@/adapters/invoice/invoice-adapter";
import  {  MockInvoiceAdapter  }  from  "@/adapters/invoice/invoice-mock";
import  {  env  }  from  "@/lib/env";

export  function  createInvoiceAdapter():  InvoiceAdapter  {
    switch  (env.INVOICE_PROVIDER)  {
        case  "mock":
        default:
            return  new  MockInvoiceAdapter();
    }
}
