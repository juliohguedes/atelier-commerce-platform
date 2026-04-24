import  {  HomeSectionHeading  }  from  "@/components/home/home-section-heading";
import  {  Card,  CardContent  }  from  "@/components/ui/card";
import  {  Container  }  from  "@/components/ui/container";
import  type  {  HomeLegalSection  as  HomeLegalSectionItem  }  from  "@/lib/constants/homepage";

interface  HomeLegalSectionProps  {
    legalSections:  HomeLegalSectionItem[];
}

export  function  HomeLegalSection({  legalSections  }:  HomeLegalSectionProps)  {
    return  (
        <section  className="py-16  sm:py-20"  id="termos-privacidade">
            <Container  className="space-y-8">
                <HomeSectionHeading
                    eyebrow="Transparência"
                    title="Termos  e  Condições  +  Política  de  Privacidade"
                    description="Informações  claras  para  compra  segura,  atendimento  etico  e  proteção  de  dados."
                />

                <div  className="grid  gap-4  lg:grid-cols-2">
                    {legalSections.map((section)  =>  (
                        <Card  className="h-full  border-gold-600/35  bg-card/75"  id={section.id}  key={section.id}>
                            <CardContent  className="space-y-4  p-6">
                                <h3  className="text-2xl">{section.title}</h3>
                                <p  className="text-sm  leading-relaxed  text-muted-foreground">{section.summary}</p>
                                <ul  className="space-y-2  text-sm  text-muted-foreground">
                                    {section.items.map((item)  =>  (
                                        <li  className="relative  pl-4"  key={item}>
                                            <span  className="absolute  left-0  top-2  h-1.5  w-1.5  rounded-full  bg-gold-400"  />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
}
