import  Link  from  "next/link";
import  {  Menu  }  from  "lucide-react";
import  {  Button,  buttonVariants  }  from  "@/components/ui/button";
import  {  PublicCartShortcut  }  from  "@/components/layout/public-cart-shortcut";
import  {  Container  }  from  "@/components/ui/container";
import  {  BRAND_CONFIG  }  from  "@/lib/constants/brand";
import  {  publicNavigation  }  from  "@/lib/constants/navigation";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {  cn  }  from  "@/lib/utils";

export  function  PublicHeader()  {
    return  (
        <header  className="sticky  top-0  z-40  border-b  border-border/70  bg-background/90  backdrop-blur">
            <Container  className="flex  h-16  items-center  justify-between  gap-4">
                <Link  className="group  inline-flex  items-center  gap-2"  href={ROUTES.public.home}>
                    <span  className="h-5  w-5  rounded-full  border  border-gold-500/60  bg-gold-500/20"  />
                    <span  className="font-serif  text-xl  tracking-wide  text-gold-400  transition-colors  group-hover:text-gold-500">
                        {BRAND_CONFIG.companyName}
                    </span>
                </Link>

                <nav  className="hidden  items-center  gap-7  md:flex">
                    {publicNavigation.map((item)  =>  (
                        <Link
                            className="text-sm  font-medium  text-foreground/90  transition-colors  hover:text-gold-400"
                            href={item.href}
                            key={item.href}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div  className="hidden  items-center  gap-2  md:flex">
                    <Link
                        className={cn(buttonVariants({  variant:  "ghost",  size:  "sm"  }))}
                        href={ROUTES.public.signUp}
                    >
                        Criar  conta
                    </Link>
                    <Link
                        className={cn(buttonVariants({  variant:  "outline",  size:  "sm"  }))}
                        href={ROUTES.public.signIn}
                    >
                        Entrar
                    </Link>
                    <PublicCartShortcut  />
                </div>

                <div  className="flex  items-center  gap-2  md:hidden">
                    <PublicCartShortcut  mobile  />
                    <Button  aria-label="Abrir  menu"  size="icon"  variant="outline">
                        <Menu  className="h-4  w-4"  />
                    </Button>
                </div>
            </Container>
        </header>
    );
}
