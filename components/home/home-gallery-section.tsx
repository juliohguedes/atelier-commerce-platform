import { HomeSectionHeading } from "@/components/home/home-section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import type { HomeCollection, HomePiece } from "@/lib/constants/homepage";

interface HomeGallerySectionProps {
  pieces: HomePiece[];
  collections: HomeCollection[];
}

export function HomeGallerySection({ pieces, collections }: HomeGallerySectionProps) {
  return (
    <section className="border-b border-border/50 py-16 sm:py-20" id="galeria-pecas">
      <Container className="space-y-10">
        <HomeSectionHeading
          eyebrow="Galeria de pecas"
          title={`Pecas ja realizadas com assinatura ${BRAND_CONFIG.companyName}`}
          description="Portfolio com looks sob medida e criacoes autorais para inspirar novas encomendas."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {pieces.map((piece) => (
            <Card className="group overflow-hidden border-gold-600/35 bg-card/60" key={piece.id}>
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${piece.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <p className="absolute left-4 top-4 rounded-full border border-gold-500/40 bg-black/45 px-3 py-1 text-xs uppercase tracking-wide text-gold-400">
                  {piece.category}
                </p>
              </div>
              <CardContent className="space-y-2 p-5">
                <h3 className="text-2xl">{piece.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{piece.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <HomeSectionHeading
            eyebrow="Colecoes em destaque"
            title="Selecoes para diferentes estilos e ocasioes"
            className="max-w-3xl"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card className="h-full bg-card/70" key={collection.id}>
                <CardContent className="space-y-3 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold-400">{collection.badge}</p>
                  <h3 className="text-2xl">{collection.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{collection.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
