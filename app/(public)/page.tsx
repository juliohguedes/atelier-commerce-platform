import  {
    HomeAboutSection,
    HomeExperienceSection,
    HomeFaqSection,
    HomeGallerySection,
    HomeHero,
    HomeLegalSection,
    HomeLocationSection,
    HomeTestimonialsSection,
    HomeWhatsAppButton
}  from  "@/components/home";
import  {  getBrandYearsInBusiness  }  from  "@/services/brand/get-brand-years-in-business";
import  {  getPublicBrandSettings  }  from  "@/services/brand/get-public-brand-settings";
import  {  getSiteAuxiliaryContent  }  from  "@/services/content/get-site-auxiliary-content";

export  default  async  function  HomePage()  {
    const  [yearsInBusiness,  brandSettings,  auxiliaryContent]  =  await  Promise.all([
        getBrandYearsInBusiness(),
        getPublicBrandSettings(),
        getSiteAuxiliaryContent()
    ]);

    return  (
        <>
            <HomeHero  />
            <HomeAboutSection  />
            <HomeExperienceSection  yearsInBusiness={yearsInBusiness}  />
            <HomeGallerySection
                collections={auxiliaryContent.featuredCollections}
                pieces={auxiliaryContent.galleryPieces}
            />
            <HomeTestimonialsSection  testimonials={auxiliaryContent.testimonials}  />
            <HomeLocationSection
                addressText={brandSettings.addressText}
                businessHours={brandSettings.businessHours}
                contactEmail={brandSettings.supportEmail}
                contactPhone={brandSettings.supportWhatsapp}
                locationInfo={auxiliaryContent.locationInfo}
            />
            <HomeFaqSection  faqItems={auxiliaryContent.faqItems}  />
            <HomeLegalSection  legalSections={auxiliaryContent.legalSections}  />
            <HomeWhatsAppButton  />
        </>
    );
}
