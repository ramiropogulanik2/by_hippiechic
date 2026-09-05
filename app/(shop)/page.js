import AboutSection from "@/components/AboutSection";
import CategoryCard from "@/components/CategoryCard";
import HeroEditorial from "@/components/HeroEditorial";
import InfoMarquee from "@/components/InfoMarquee";
import BotanicalAccent from "@/components/ui/BotanicalAccent";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories, error }, { data: heroImages, error: heroError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("hero_images")
        .select("image_url")
        .order("display_order", { ascending: true }),
    ]);

  if (error) {
    console.error("Error cargando categorías:", error.message);
  }

  if (heroError) {
    console.error("Error cargando fotos de hero:", heroError.message);
  }

  const categoryList = categories ?? [];
  const heroImageUrls = (heroImages ?? []).map((image) => image.image_url);

  return (
    <>
      {/* El hero ya no se mete por debajo del header: dejó de ser una foto a
          pantalla completa con el header transparente encima, ahora es un
          bloque partido (texto izquierda / carrusel derecha) que arranca
          debajo de la barra. */}
      <HeroEditorial images={heroImageUrls} />

      <InfoMarquee />

      {/* ---------- Categorías ---------- */}
      <section
        id="categorias"
        className="relative scroll-mt-24 overflow-hidden bg-sand"
      >
        {/* Espejado con -scale-x-100 para que la rama se incline hacia
            afuera del contenido, no hacia el título. */}
        <BotanicalAccent className="pointer-events-none absolute top-0 right-0 hidden h-72 w-auto translate-x-1/4 -scale-x-100 text-olive opacity-[0.13] sm:block" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal className="mb-12 max-w-2xl">
            <Eyebrow>Nuestro catálogo</Eyebrow>

            <h2 className="font-display text-3xl leading-tight sm:text-5xl">
              Elegí por <span className="font-accent">categoría</span>
            </h2>
          </Reveal>

          {categoryList.length === 0 ? (
            <p className="py-12 text-center font-accent text-2xl text-ink/70">
              Todavía no hay categorías cargadas
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {categoryList.map((category, index) => (
                <Reveal
                  key={category.id}
                  // El escalonado se reinicia por fila (4 columnas en xl) en
                  // vez de acumularse: con 8+ categorías, un delay lineal
                  // dejaba la última entrando casi un segundo tarde.
                  delay={(index % 4) * 0.08}
                >
                  <CategoryCard
                    name={category.name}
                    slug={category.slug}
                    imageUrl={category.image_url}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cambio #8: "Detrás de" pasa a ser el cierre de la home, después del
          catálogo, en vez de interponerse entre el hero y las categorías. */}
      <AboutSection />
    </>
  );
}
