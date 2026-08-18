import AboutSection from "@/components/AboutSection";
import CategoryCard from "@/components/CategoryCard";
import HeroCarousel from "@/components/HeroCarousel";
import LogoMarquee from "@/components/LogoMarquee";
import BotanicalAccent from "@/components/ui/BotanicalAccent";
import Eyebrow from "@/components/ui/Eyebrow";
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
      {/* ---------- Hero ---------- */}
      {/* Full-bleed: <main> no tiene max-width propio (solo lo tienen las
          secciones que lo piden explícitamente), así que esto ya llega
          borde a borde sin necesitar el truco de "romper" un contenedor
          centrado. */}
      {/* Con fotos: sin altura fija a propósito, los slides de HeroCarousel
          la definen vía aspect-[3/4] y el overlay (absolute inset-0) toma esa
          misma altura del contenedor relative. Sin fotos: sí lleva altura
          fija (ver más abajo), porque ahí no hay ningún slide que la dé. */}
      <section className="relative">
        {heroImageUrls.length > 0 ? (
          <>
            <HeroCarousel images={heroImageUrls} />

            {/* pointer-events-none en todo el velo/texto para no bloquear el
                drag de Embla debajo; el botón recupera los eventos con
                pointer-events-auto para seguir siendo clickeable. */}
            <div className="pointer-events-none absolute inset-0 bg-ink/30" />
          </>
        ) : (
          // Sin fotos cargadas (la dueña borró todas desde /admin/hero):
          // fondo sólido en vez de un carrusel roto, con altura fija propia
          // ya que no hay slides que la definan.
          <div className="h-[60vh] bg-caramel sm:h-[70vh]" />
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-accent text-3xl text-sand drop-shadow-sm sm:text-5xl">
            Boho-chic · Envíos a todo el país
          </p>
          <a
            href="#categorias"
            className="pointer-events-auto rounded-full bg-sand px-6 py-3 font-body text-sm font-medium text-ink transition-colors hover:bg-card"
          >
            Ver catálogo
          </a>
        </div>
      </section>

      {/* ---------- Banda de logo (separador) ---------- */}
      <LogoMarquee />

      {/* ---------- Quiénes somos (fondo "card") ---------- */}
      {/* Ya no lleva wrapper con padding: el cambio de tono a "card" es lo
          que separa esta sección del hero, y AboutSection trae su propio
          py-16/py-24. */}
      <AboutSection />

      {/* ---------- Categorías (vuelve a "sand") ---------- */}
      <section
        id="categorias"
        className="relative scroll-mt-20 overflow-hidden bg-sand"
      >
        {/* Espejado con -scale-x-100 para que la rama se incline hacia
            afuera del contenido, no hacia el título. */}
        <BotanicalAccent className="pointer-events-none absolute top-0 right-0 hidden h-64 w-auto translate-x-1/4 -scale-x-100 text-caramel opacity-10 sm:block" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Eyebrow>Nuestro catálogo</Eyebrow>

          <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
            Categorías
          </h2>

          {categoryList.length === 0 ? (
            <p className="py-12 text-center font-accent text-2xl text-ink/60">
              Todavía no hay categorías cargadas
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {categoryList.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  imageUrl={category.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
