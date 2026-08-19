import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryPage({ params }) {
  // En Next 16 `params` es una promesa: hay que await-earla.
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, slug")
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando productos:", error.message);
  }

  const productList = products ?? [];

  // Una sola consulta para las imágenes de todos los productos.
  // Vienen ordenadas por display_order, así que la primera que aparece
  // para cada product_id es la que corresponde mostrar.
  const firstImageByProduct = new Map();

  if (productList.length > 0) {
    const { data: images } = await supabase
      .from("product_images")
      .select("product_id, image_url")
      .in(
        "product_id",
        productList.map((product) => product.id)
      )
      .order("display_order", { ascending: true });

    for (const image of images ?? []) {
      if (!firstImageByProduct.has(image.product_id)) {
        firstImageByProduct.set(image.product_id, image.image_url);
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <Breadcrumb
          items={[{ label: "Inicio", href: "/" }, { label: category.name }]}
        />
      </div>

      {/* El contador de piezas al lado del título da contexto de inmediato
          (una categoría con 2 prendas se lee distinto que una con 20) y de
          paso equilibra el peso del título en pantallas anchas. */}
      <div className="mb-12 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/10 pb-6">
        <h1 className="font-display text-4xl leading-none sm:text-6xl">
          {category.name}
        </h1>
        <span className="font-body text-xs uppercase tracking-[0.18em] text-ink/70">
          {productList.length}{" "}
          {productList.length === 1 ? "pieza" : "piezas"}
        </span>
      </div>

      {productList.length === 0 ? (
        <p className="py-20 text-center font-accent text-3xl text-ink/70">
          Todavía no hay productos en esta categoría
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productList.map((product, index) => (
            <Reveal key={product.id} delay={(index % 5) * 0.06}>
              <ProductCard
                name={product.name}
                price={product.price}
                imageUrl={firstImageByProduct.get(product.id) ?? null}
                slug={product.slug}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
