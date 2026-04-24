import  {  Clock3,  Scissors,  ShieldCheck  }  from  "lucide-react";
import  {  Container  }  from  "@/components/ui/container";
import  {  Card,  CardContent  }  from  "@/components/ui/card";
import  {  HomeSectionHeading  }  from  "@/components/home/home-section-heading";

interface  HomeExperienceSectionProps  {
    yearsInBusiness:  number;
}

const  additionalExperienceItems  =  [
    {
        icon:  Scissors,
        title:  "Modelagem  personalizada",
        description:  "Projeção  de  corte  para  valorizar  cada  biotipo  com  caimento  preciso."
    },
    {
        icon:  Clock3,
        title:  "Fluxo  acompanhado",
        description:  "Linha  de  produção  com  checkpoints  para  validacao  de  cada  etapa."
    },
    {
        icon:  ShieldCheck,
        title:  "Padrao  premium",
        description:  "Acabamentos,  tecidos  e  ferragens  selecionados  para  alta  durabilidade."
    }
];

export  function  HomeExperienceSection({  yearsInBusiness  }:  HomeExperienceSectionProps)  {
    return  (
        <section  className="border-b  border-border/50  py-16  sm:py-20"  id="anos-experiencia">
            <Container  className="grid  gap-8  lg:grid-cols-[0.8fr_1.2fr]  lg:items-start">
                <Card  className="border-gold-500/40  bg-gradient-to-br  from-gold-500/20  to-card">
                    <CardContent  className="p-7">
                        <p  className="text-xs  uppercase  tracking-[0.28em]  text-gold-400">Anos  no  ramo</p>
                        <p  className="mt-2  text-6xl  font-semibold  leading-none  text-gold-400">{yearsInBusiness}+</p>
                        <p  className="mt-4  text-sm  leading-relaxed  text-muted-foreground">
                            Experiência  consolidada  em  criação  sob  medida,  curadoria  de  coleções  e  atendimento  de  alto  padrao.
                        </p>
                    </CardContent>
                </Card>

                <div  className="space-y-6">
                    <HomeSectionHeading
                        eyebrow="Experiência"
                        title="Tradicao  de  atelier  com  operação  moderna  para  encomendar  online  com  seguranca."
                    />
                    <div  className="grid  gap-4  sm:grid-cols-3">
                        {additionalExperienceItems.map((item)  =>  (
                            <Card  className="h-full  bg-card/70"  key={item.title}>
                                <CardContent  className="space-y-3  p-5">
                                    <item.icon  className="h-5  w-5  text-gold-400"  />
                                    <h3  className="text-xl">{item.title}</h3>
                                    <p  className="text-sm  leading-relaxed  text-muted-foreground">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

