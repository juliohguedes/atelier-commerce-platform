import  Link  from  "next/link";
import  {  Container  }  from  "@/components/ui/container";
import  {  BRAND_CONFIG  }  from  "@/lib/constants/brand";
import  {  ROUTES  }  from  "@/lib/constants/routes";

export  function  PublicFooter()  {
    const  year  =  new  Date().getFullYear();

    return  (
        <footer  className="border-t  border-border/70  bg-card/70">
            <Container  className="flex  flex-col  gap-5  py-10  text-sm  text-muted-foreground  md:flex-row  md:items-center  md:justify-between">
                <div  className="space-y-1">
                    <p  className="font-medium  text-foreground">{BRAND_CONFIG.companyName}</p>
                    <p>{BRAND_CONFIG.tagline}</p>
                </div>

                <div  className="flex  flex-wrap  items-center  gap-5">
                    <Link  className="transition-colors  hover:text-gold-400"  href={ROUTES.public.contact}>
                        Contato
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href={ROUTES.public.shop}>
                        Loja
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href={ROUTES.public.tailored}>
                        Sob  medida
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href="/#galeria-pecas">
                        Galeria
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href="/#faq">
                        FAQ
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href="/#termos-condicoes">
                        Termos
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href="/#politica-privacidade">
                        Privacidade
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href={ROUTES.public.signIn}>
                        Entrar
                    </Link>
                    <Link  className="transition-colors  hover:text-gold-400"  href={ROUTES.public.signUp}>
                        Criar  conta
                    </Link>
                </div>

                <p>&copy;  {year}  {BRAND_CONFIG.companyName}.  Todos  os  direitos  reservados.</p>
            </Container>
        </footer>
    );
}
