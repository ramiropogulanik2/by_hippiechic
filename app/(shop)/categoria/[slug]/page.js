import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryFilters from "@/components/CategoryFilters";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { SIZE_PRESETS } from "@/lib/sizePresets";
import { createClient } from "@/lib/supabase/server";

// Orden de referencia para mostrar los talles disponibles de forma prolija
// (S antes que M, 38 antes que 40) en vez del orden en que Postgres los
// devuelva. Los que no están en ninguna de las dos listas (talles cargados
// a mano) van al final, alfabéticos entre sí.
const SIZE_ORDER = [...SIZE_PRESETS.letra, ...SIZE_PRESETS.numerico];

function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a);
    const indexB = SIZE_ORDER.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export default async function CategoryPage({ params, searchParams }) {
  // En Next 16 `params` y `searchParams` son promesas: hay que await-earlas.
  const { slug } = await params;
  const { talle, orden, buscar } = await searchParams;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  const selectedSizes = talle ? talle.split(",").filter(Boolean) : [];
  const searchTerm = (buscar ?? "").trim();
  const sortOrder = orden ?? "recientes";

  const hasActiveFilters =
    selectedSizes.length > 0 || searchTerm.length > 0 || sortOrder !== "recientes";

  // Talles disponibles para las opciones del filtro: se calculan siempre
  // sobre el universo completo de la categoría, no sobre el resultado ya
  // filtrado — si no, elegir un talle haría desaparecer las opciones de
  // los demás en vez de solo cambiar los productos listados.
  const { data: sizeRows } = await supabase
    .from("product_variants")
    .select("size, products!inner(category_id, is_published)")
    .not("size", "is", null)
    .eq("products.category_id", category.id)
    .eq("products.is_published", true);

  const availableSizes = sortSizes([
    ...new Set((sizeRows ?? []).map((row) => row.size)),
  ]);

  // Si se filtra por talle, primero hay que averiguar qué productos tienen
  // alguna variante con esos talles: Supabase no deja filtrar la tabla
  // principal por "alguno de mis hijos cumple X" en una sola consulta.
  let matchingProductIds = null;

  if (selectedSizes.length > 0) {
    const { data: matchingVariants } = await supabase
      .from("product_variants")
      .select("product_id, products!inner(category_id)")
      .in("size", selectedSizes)
      .eq("products.category_id", category.id);

    matchingProductIds = [
      ...new Set((matchingVariants ?? []).map((row) => row.product_id)),
    ];
  }

  let productList = [];

  // matchingProductIds === []: se pidió un talle y ninguna variante matchea.
  // Ya se sabe que el resultado es vacío, ni hace falta consultar products.
  if (!matchingProductIds || matchingProductIds.length > 0) {
    let query = supabase
      .from("products")
      .select("id, name, price, slug")
      .eq("category_id", category.id)
      .eq("is_published", true);

    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    if (matchingProductIds) {
      query = query.in("id", matchingProductIds);
    }

    if (sortOrder === "precio-asc") {
      query = query.order("price", { ascending: true });
    } else if (sortOrder === "precio-desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error cargando productos:", error.message);
    }

    productList = products ?? [];
  }

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
          paso equilibra el peso del título en pantallas anchas. Refleja el
          resultado ya filtrado, no el total de la categoría. */}
      <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/10 pb-6">
        <h1 className="font-display text-4xl leading-none sm:text-6xl">
          {category.name}
        </h1>
        <span className="font-body text-xs uppercase tracking-[0.18em] text-ink/70">
          {productList.length}{" "}
          {productList.length === 1 ? "pieza" : "piezas"}
        </span>
      </div>

      <CategoryFilters availableSizes={availableSizes} currentSlug={slug} />

      {productList.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="font-accent text-3xl text-ink/70">
              No se encontraron productos con estos filtros
            </p>
            <Link
              href={`/categoria/${slug}`}
              className="link-underline font-body text-xs font-semibold uppercase tracking-[0.16em] text-caramel"
            >
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <p className="py-20 text-center font-accent text-3xl text-ink/70">
            Todavía no hay productos en esta categoría
          </p>
        )
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
