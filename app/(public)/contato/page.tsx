import  Link  from  "next/link";
import  {  Clock3,  Mail,  MapPin,  MessageCircle  }  from  "lucide-react";
import  {  Container  }  from  "@/components/ui/container";
import  {  Card,  CardContent  }  from  "@/components/ui/card";
import  {  getPublicBrandSettings  }  from  "@/services/brand/get-public-brand-settings";
import  {  getSiteAuxiliaryContent  }  from  "@/services/content/get-site-auxiliary-content";

export  default  async  function  ContactPage()  {
    const  [brandSettings,  auxiliaryContent]  =  await  Promise.all([
        getPublicBrandSettings(),
        getSiteAuxiliaryContent()
    ]);

    return  (
        <section  className="border-b  border-border/50  py-16  sm:py-20">
            <Container  className="space-y-10">
                <header  className="space-y-3">
                    <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Contato</p>
                    <h1  className="max-w-3xl  text-4xl">
                        Atendimento  presencial  e  digital  com  mapa  integrado
                    </h1>
                    <p  className="max-w-3xl  text-sm  text-muted-foreground">
                        Esta  página  compartilha  o  mesmo  mapa  institucional  usado  na  homepage  e  no  agendamento  presencial,  mantendo  a  operação  alinhada  do  primeiro  contato  até  a  visita  ao  showroom.
                    </p>
                </header>

                <div  className="grid  gap-5  lg:grid-cols-[0.9fr_1.1fr]">
                    <div  className="space-y-4">
                        <Card  className="border-gold-600/35  bg-card/75">
                            <CardContent  className="space-y-4  p-6">
                                <div>
                                    <p  className="text-xs  uppercase  tracking-[0.18em]  text-gold-400">
                                        Showroom
                                    </p>
                                    <h2  className="mt-2  text-2xl">{auxiliaryContent.locationInfo.showroomName}</h2>
                                </div>

                                <div  className="space-y-3  text-sm  text-muted-foreground">
                                    <p  className="inline-flex  items-start  gap-2">
                                        <MapPin  className="mt-0.5  h-4  w-4  text-gold-400"  />
                                        {brandSettings.addressText}
                                    </p>
                                    <p  className="inline-flex  items-start  gap-2">
                                        <Clock3  className="mt-0.5  h-4  w-4  text-gold-400"  />
                                        {brandSettings.businessHours}
                                    </p>
                                    <p  className="inline-flex  items-start  gap-2">
                                        <MessageCircle  className="mt-0.5  h-4  w-4  text-gold-400"  />
                                        {brandSettings.supportWhatsapp}
                                    </p>
                                </div>

                                <Link
                                    className="inline-flex  items-center  gap-2  text-sm  font-medium  text-gold-400  transition-colors  hover:text-gold-500"
                                    href={`mailto:${brandSettings.supportEmail}`}
                                >
                                    <Mail  className="h-4  w-4"  />
                                    {brandSettings.supportEmail}
                                </Link>
                            </CardContent>
                        </Card>

                        <Card  className="border-border/70  bg-card/60">
                            <CardContent  className="space-y-3  p-6  text-sm  text-muted-foreground">
                                <p  className="font-medium  text-foreground">Fluxo  de  atendimento</p>
                                <p>
                                    O  mesmo  endereço  e  o  mesmo  mapa  aparecem  na  homepage,  nesta  página  de  contato  e  na  área  da  cliente  para  evitar  inconsistencias  operacionais.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div  className="overflow-hidden  rounded-2xl  border  border-gold-600/35  bg-card/60  p-2  shadow-soft">
                        <iframe
                            className="h-[420px]  w-full  rounded-xl"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={auxiliaryContent.locationInfo.mapEmbedUrl}
                            title="Mapa  de  contato  da  marca"
                        />
                    </div>
                </div>
            </Container>
        </section>
    );
}
