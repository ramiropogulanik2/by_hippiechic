import AboutSection from "@/components/AboutSection";
import CategoryCard from "@/components/CategoryCard";
import HeroCarousel from "@/components/HeroCarousel";
import { createClient } from "@/lib/supabase/server";

// Agregar más rutas acá cuando la dueña confirme más fotos: el carrusel
// no necesita ningún cambio de código para soportarlas.
const HERO_IMAGES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error cargando categorías:", error.message);
  }

  const categoryList = categories ?? [];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative h-[52vh] sm:h-[65vh]">
        <HeroCarousel images={HERO_IMAGES} />

        {/* El contenido superpuesto es fijo, independiente de qué imagen
            del carrusel esté activa. pointer-events-none deja pasar los
            clicks a los puntitos del carrusel, salvo en el botón. */}
        <div className="pointer-events-none absolute inset-0 bg-ink/30" />

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

      {/* ---------- Quiénes somos ---------- */}
      {/* Solo padding-top: AboutSection ya trae su propio py-16/py-24 en las
          dos direcciones, así que agregar py acá duplicaría el espacio hacia
          la sección de categorías, que también tiene su padding propio. */}
      <div className="pt-12 sm:pt-16">
        <AboutSection />
      </div>

      {/* ---------- Categorías ---------- */}
      <section
        id="categorias"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
      >
        <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
          Categorías
        </h2>

        {categoryList.length === 0 ? (
          <p className="py-12 text-center font-accent text-2xl text-ink/60">
            Todavía no hay categorías cargadas
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
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
      </section>
    </>
  );
}
