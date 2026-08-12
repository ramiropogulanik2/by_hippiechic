import Link from "next/link";
import { notFound } from "next/navigation";
import Arrow from "@/components/ui/Arrow";
import ProductCard from "@/components/ProductCard";
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
    .select("id, name, price")
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav
        aria-label="Migas de pan"
        className="mb-8 flex items-center gap-3 text-sm"
      >
        <Link href="/" className="transition-colors hover:text-caramel">
          Inicio
        </Link>
        <Arrow className="h-2 w-8 text-caramel" />
        <span className="font-medium">{category.name}</span>
      </nav>

      <h1 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
        {category.name}
      </h1>

      {productList.length === 0 ? (
        <p className="py-16 text-center font-accent text-2xl text-ink/60">
          Todavía no hay productos en esta categoría
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {productList.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={firstImageByProduct.get(product.id) ?? null}
              // `products` no tiene columna slug todavía: usamos el id.
              slug={product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
