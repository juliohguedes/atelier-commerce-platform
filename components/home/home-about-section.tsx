import  {  Gem  }  from  "lucide-react";
import  {  Container  }  from  "@/components/ui/container";
import  {  Card,  CardContent  }  from  "@/components/ui/card";
import  {  homeAboutHighlights  }  from  "@/lib/constants/homepage";
import  {  HomeSectionHeading  }  from  "@/components/home/home-section-heading";

export  function  HomeAboutSection()  {
    return  (
        <section  className="border-b  border-border/50  py-16  sm:py-20"  id="sobre-a-marca">
            <Container  className="space-y-10">
                <HomeSectionHeading
                    eyebrow="Sobre  a  marca"
                    title="Elegância  autoral  para  clientes  que  buscam  identidade,  refinamento  e  praticidade."
                    description="Unimos  linguagem  de  atelier  com  conveniencia  digital  para  que  cada  cliente  tenha  uma  experiência  exclusiva,  do  primeiro  contato  ao  momento  de  vestir."
                />

                <div  className="grid  gap-4  md:grid-cols-3">
                    {homeAboutHighlights.map((highlight)  =>  (
                        <Card  className="h-full  border-gold-600/35  bg-card/70"  key={highlight.title}>
                            <CardContent  className="space-y-4  p-6">
                                <div  className="inline-flex  h-10  w-10  items-center  justify-center  rounded-full  border  border-gold-500/40  bg-gold-500/10">
                                    <Gem  className="h-4  w-4  text-gold-400"  />
                                </div>
                                <h3  className="text-2xl">{highlight.title}</h3>
                                <p  className="text-sm  leading-relaxed  text-muted-foreground">{highlight.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
}

