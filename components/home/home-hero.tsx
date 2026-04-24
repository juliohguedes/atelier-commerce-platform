import  Link  from  "next/link";
import  {  ArrowUpRight,  Sparkles  }  from  "lucide-react";
import  {  Container  }  from  "@/components/ui/container";
import  {  buttonVariants  }  from  "@/components/ui/button";
import  {  homeHeroContent  }  from  "@/lib/constants/homepage";
import  {  ROUTES  }  from  "@/lib/constants/routes";
import  {  cn  }  from  "@/lib/utils";

export  function  HomeHero()  {
    return  (
        <section  className="relative  overflow-hidden  border-b  border-border/60  bg-gradient-to-b  from-black/10  via-transparent  to-transparent">
            <div  className="pointer-events-none  absolute  inset-0">
                <div  className="absolute  -left-20  top-0  h-72  w-72  rounded-full  bg-gold-500/20  blur-3xl"  />
                <div  className="absolute  right-0  top-20  h-64  w-64  rounded-full  bg-gold-400/10  blur-3xl"  />
            </div>

            <Container  className="relative  grid  gap-10  py-20  lg:grid-cols-[1.2fr_0.8fr]  lg:items-end  lg:py-28">
                <div  className="space-y-8">
                    <div  className="inline-flex  items-center  gap-2  rounded-full  border  border-gold-500/40  bg-gold-500/10  px-3  py-1  text-xs  font-medium  tracking-wide  text-gold-400">
                        <Sparkles  className="h-3.5  w-3.5"  />
                        Alta  costura  com  atendimento  digital
                    </div>

                    <div  className="space-y-5">
                        <h1  className="max-w-4xl  text-4xl  leading-tight  sm:text-5xl  lg:text-6xl">
                            {homeHeroContent.title}
                        </h1>
                        <p  className="max-w-2xl  text-base  leading-relaxed  text-muted-foreground  sm:text-lg">
                            {homeHeroContent.subtitle}
                        </p>
                    </div>

                    <div  className="flex  flex-wrap  items-center  gap-3">
                        <Link  className={cn(buttonVariants({  size:  "lg"  }),  "shadow-luxe")}  href={ROUTES.public.shop}>
                            {homeHeroContent.primaryActionLabel}
                        </Link>
                        <Link
                            className={cn(buttonVariants({  size:  "lg",  variant:  "outline"  }))}
                            href={ROUTES.public.tailored}
                        >
                            {homeHeroContent.secondaryActionLabel}
                        </Link>
                    </div>
                </div>

                <div  className="relative  overflow-hidden  rounded-2xl  border  border-gold-500/35  bg-card/70  p-6  shadow-luxe  backdrop-blur">
                    <p  className="text-xs  uppercase  tracking-[0.28em]  text-gold-400">Experiência  digital  premium</p>
                    <div  className="mt-6  space-y-4">
                        <div  className="rounded-xl  border  border-border/70  bg-background/40  p-4">
                            <p  className="text-xs  uppercase  tracking-wide  text-muted-foreground">Briefing  online  guiado</p>
                            <p  className="mt-1  text-lg">Escolha  de  modelagem  e  acabamentos  com  consultoria  em  tempo  real.</p>
                        </div>
                        <div  className="rounded-xl  border  border-border/70  bg-background/40  p-4">
                            <p  className="text-xs  uppercase  tracking-wide  text-muted-foreground">Acompanhamento  do  pedido</p>
                            <p  className="mt-1  text-lg">Atualizações  de  produção  até  a  entrega  final  da  peça.</p>
                        </div>
                    </div>
                    <Link
                        className="mt-6  inline-flex  items-center  gap-2  text-sm  font-medium  text-gold-400  transition-colors  hover:text-gold-500"
                        href={ROUTES.public.tailored}
                    >
                        Iniciar  atendimento  personalizado
                        <ArrowUpRight  className="h-4  w-4"  />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
