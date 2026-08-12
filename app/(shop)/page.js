import Image from "next/image";
import CategoryCard from "@/components/CategoryCard";
import { createClient } from "@/lib/supabase/server";

// El .png es necesario: placehold.co sirve SVG por defecto y next/image lo
// rechaza con 400 (dangerouslyAllowSVG viene en false).
const HERO_IMAGES = [
  "https://placehold.co/600x800/B08D57/FFFCF7.png?text=Foto",
  "https://placehold.co/600x800/B08D57/FFFCF7.png?text=Foto",
  "https://placehold.co/600x800/B08D57/FFFCF7.png?text=Foto",
];

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
      <section className="relative">
        <div className="grid grid-cols-3">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`relative aspect-[3/4] ${
                i === 2 ? "hidden sm:block" : ""
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-ink/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-accent text-3xl text-sand drop-shadow-sm sm:text-5xl">
            Boho-chic · Envíos a todo el país
          </p>
          <a
            href="#categorias"
            className="rounded-full bg-sand px-6 py-3 font-body text-sm font-medium text-ink transition-colors hover:bg-card"
          >
            Ver catálogo →
          </a>
        </div>
      </section>

      {/* ---------- Categorías ---------- */}
      <section
        id="categorias"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
      >
        <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
          → Categorías
        </h2>

        {categoryList.length === 0 ? (
          <p className="py-12 text-center font-accent text-2xl text-ink/60">
            Todavía no hay categorías cargadas
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
