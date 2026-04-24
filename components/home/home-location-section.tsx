import  Link  from  "next/link";
import  {  MapPin,  MessageCircle,  Phone  }  from  "lucide-react";
import  {  HomeSectionHeading  }  from  "@/components/home/home-section-heading";
import  {  Card,  CardContent  }  from  "@/components/ui/card";
import  {  Container  }  from  "@/components/ui/container";
import  type  {  HomeLocationInfo  }  from  "@/lib/constants/homepage";

interface  HomeLocationSectionProps  {
    locationInfo:  HomeLocationInfo;
    contactEmail:  string;
    contactPhone:  string;
    addressText:  string;
    businessHours:  string;
}

export  function  HomeLocationSection({
    locationInfo,
    contactEmail,
    contactPhone,
    addressText,
    businessHours
}:  HomeLocationSectionProps)  {
    return  (
        <section  className="border-b  border-border/50  py-16  sm:py-20"  id="localizacao">
            <Container  className="space-y-8">
                <HomeSectionHeading
                    eyebrow="Localização"
                    title="Visite  nosso  showroom  ou  fale  com  a  equipe  por  WhatsApp."
                    description="Atendimento  presencial  com  hora  marcada  e  atendimento  digital  para  todo  o  Brasil."
                />

                <div  className="grid  gap-5  lg:grid-cols-[1fr_1.1fr]">
                    <Card  className="h-full  border-gold-600/35  bg-card/75">
                        <CardContent  className="space-y-5  p-6">
                            <div  className="space-y-2">
                                <h3  className="text-2xl">{locationInfo.showroomName}</h3>
                                <p  className="text-sm  text-muted-foreground">{addressText}</p>
                            </div>

                            <div  className="space-y-3  text-sm">
                                <p  className="inline-flex  items-center  gap-2  text-muted-foreground">
                                    <MapPin  className="h-4  w-4  text-gold-400"  />
                                    Atendimento  com  agendamento  para  provas  e  consultoria
                                </p>
                                <p  className="inline-flex  items-center  gap-2  text-muted-foreground">
                                    <Phone  className="h-4  w-4  text-gold-400"  />
                                    {contactPhone}
                                </p>
                                <p  className="inline-flex  items-center  gap-2  text-muted-foreground">
                                    <MessageCircle  className="h-4  w-4  text-gold-400"  />
                                    {businessHours}
                                </p>
                            </div>

                            <Link
                                className="inline-flex  items-center  gap-2  text-sm  font-medium  text-gold-400  transition-colors  hover:text-gold-500"
                                href={`mailto:${contactEmail}`}
                            >
                                {contactEmail}
                            </Link>
                        </CardContent>
                    </Card>

                    <div  className="overflow-hidden  rounded-2xl  border  border-gold-600/35  bg-card/60  p-2  shadow-soft">
                        <iframe
                            className="h-[360px]  w-full  rounded-xl"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={locationInfo.mapEmbedUrl}
                            title="Mapa  da  loja  Maison  Aurea"
                        />
                    </div>
                </div>
            </Container>
        </section>
    );
}
