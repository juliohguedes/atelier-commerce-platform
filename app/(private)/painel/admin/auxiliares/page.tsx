import  {  AdminBrandYearsForm  }  from  "@/components/forms/admin-brand-years-form";
import  {  AdminAuxiliaryContentForm  }  from  "@/components/internal/admin-auxiliary-content-form";
import  {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
}  from  "@/components/ui/card";
import  {  requireRole  }  from  "@/lib/auth/guards";
import  {  getBrandYearsInBusiness  }  from  "@/services/brand/get-brand-years-in-business";
import  {  getSiteAuxiliaryContent  }  from  "@/services/content/get-site-auxiliary-content";

function  stringifyJson(value:  unknown):  string  {
    return  JSON.stringify(value,  null,  2);
}

export  default  async  function  AdminAuxiliaryAreasPage()  {
    await  requireRole(["admin"]);

    const  [content,  yearsInBusiness]  =  await  Promise.all([
        getSiteAuxiliaryContent(),
        getBrandYearsInBusiness()
    ]);

    return  (
        <div  className="space-y-6">
            <header  className="space-y-2">
                <p  className="text-sm  uppercase  tracking-[0.24em]  text-gold-400">Admin</p>
                <h1  className="text-4xl">Áreas  auxiliares  configuraveis</h1>
                <p  className="max-w-3xl  text-sm  text-muted-foreground">
                    Gestão  de  FAQ,  termos,  política,  depoimentos,  coleções  em  destaque,
                    galeria  de  peças,  mapa  e  anos  no  ramo  com  arquitetura  separada  do
                    painel  operacional.
                </p>
            </header>

            <div  className="grid  gap-3  md:grid-cols-2  xl:grid-cols-4">
                <Card  className="border-border/70  bg-card/60">
                    <CardContent  className="p-5">
                        <p  className="text-xs  uppercase  tracking-[0.14em]  text-muted-foreground">
                            FAQ  ativo
                        </p>
                        <p  className="mt-2  text-3xl  font-semibold  text-gold-400">
                            {content.faqItems.length}
                        </p>
                    </CardContent>
                </Card>
                <Card  className="border-border/70  bg-card/60">
                    <CardContent  className="p-5">
                        <p  className="text-xs  uppercase  tracking-[0.14em]  text-muted-foreground">
                            Depoimentos
                        </p>
                        <p  className="mt-2  text-3xl  font-semibold  text-gold-400">
                            {content.testimonials.length}
                        </p>
                    </CardContent>
                </Card>
                <Card  className="border-border/70  bg-card/60">
                    <CardContent  className="p-5">
                        <p  className="text-xs  uppercase  tracking-[0.14em]  text-muted-foreground">
                            Coleções
                        </p>
                        <p  className="mt-2  text-3xl  font-semibold  text-gold-400">
                            {content.featuredCollections.length}
                        </p>
                    </CardContent>
                </Card>
                <Card  className="border-border/70  bg-card/60">
                    <CardContent  className="p-5">
                        <p  className="text-xs  uppercase  tracking-[0.14em]  text-muted-foreground">
                            Galeria
                        </p>
                        <p  className="mt-2  text-3xl  font-semibold  text-gold-400">
                            {content.galleryPieces.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div  className="grid  gap-4  xl:grid-cols-[0.7fr_1.3fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Anos  no  ramo</CardTitle>
                        <CardDescription>
                            Indicador  institucional  exibido  na  homepage  e  em  materiais  da  marca.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminBrandYearsForm  initialYears={yearsInBusiness}  />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mapa  e  localização</CardTitle>
                        <CardDescription>
                            Estrutura  usada  na  homepage,  no  contato  e  na  área  de  agendamento  presencial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent  className="space-y-4">
                        <div  className="rounded-xl  border  border-border/70  bg-card/40  p-4">
                            <p  className="text-sm  font-medium">{content.locationInfo.showroomName}</p>
                            <p  className="mt-2  text-sm  text-muted-foreground">
                                {content.locationInfo.addressLine}
                                <br  />
                                {content.locationInfo.cityState}
                            </p>
                            <p  className="mt-2  text-xs  text-muted-foreground">
                                {content.locationInfo.openingHours}
                            </p>
                        </div>

                        <div  className="overflow-hidden  rounded-xl  border  border-border/70  bg-card/40  p-2">
                            <iframe
                                className="h-[280px]  w-full  rounded-lg"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={content.locationInfo.mapEmbedUrl}
                                title="Mapa  configurado  do  showroom"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>JSON  administravel</CardTitle>
                    <CardDescription>
                        Estrutura  pronta  para  evoluir  depois  para  um  editor  visual  sem  quebrar  os  contratos  atuais.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminAuxiliaryContentForm
                        initialValues={{
                            galleryJson:  stringifyJson(content.galleryPieces),
                            collectionsJson:  stringifyJson(content.featuredCollections),
                            testimonialsJson:  stringifyJson(content.testimonials),
                            faqJson:  stringifyJson(content.faqItems),
                            legalJson:  stringifyJson(content.legalSections),
                            locationJson:  stringifyJson(content.locationInfo)
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
