import  {  HomeSectionHeading  }  from  "@/components/home/home-section-heading";
import  {  Container  }  from  "@/components/ui/container";
import  type  {  HomeFaqItem  }  from  "@/lib/constants/homepage";

interface  HomeFaqSectionProps  {
    faqItems:  HomeFaqItem[];
}

export  function  HomeFaqSection({  faqItems  }:  HomeFaqSectionProps)  {
    return  (
        <section  className="border-b  border-border/50  py-16  sm:py-20"  id="faq">
            <Container  className="space-y-8">
                <HomeSectionHeading
                    eyebrow="FAQ"
                    title="Perguntas  frequentes"
                    description="Respostas  rápidas  sobre  encomendas,  prazos,  ajustes  e  entrega."
                />

                <div  className="grid  gap-3">
                    {faqItems.map((item)  =>  (
                        <details
                            className="group  rounded-xl  border  border-border/70  bg-card/70  p-5  open:border-gold-500/45  open:bg-card"
                            key={item.id}
                        >
                            <summary  className="cursor-pointer  list-none  pr-6  text-base  font-medium  text-foreground  group-open:text-gold-400">
                                {item.question}
                            </summary>
                            <p  className="mt-3  text-sm  leading-relaxed  text-muted-foreground">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </Container>
        </section>
    );
}
