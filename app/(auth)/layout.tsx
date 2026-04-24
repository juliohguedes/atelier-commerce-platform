import  {  Container  }  from  "@/components/ui/container";

interface  AuthLayoutProps  {
    children:  React.ReactNode;
}

export  default  function  AuthLayout({  children  }:  AuthLayoutProps)  {
    return  (
        <Container  className="flex  min-h-screen  items-center  justify-center  py-10">
            <div  className="w-full">{children}</div>
        </Container>
    );
}
