import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price, is_published, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();

  if (!product || !product.is_published) {
    notFound();
  }

  // El embed de Supabase puede venir como objeto o como array de un elemento
  // según cómo resuelva la relación; normalizamos.
  const category = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", product.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id, size, color, stock")
      .eq("product_id", product.id),
  ]);

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    ...(category
      ? [{ label: category.name, href: `/categoria/${category.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={images ?? []} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              {product.name}
            </h1>
            <p className="font-body text-2xl font-bold">
              {formatPrice(product.price)}
            </p>
          </div>

          {product.description && (
            <p className="font-body text-base leading-relaxed text-ink/80">
              {product.description}
            </p>
          )}

          <ProductVariantSelector variants={variants ?? []} />
        </div>
      </div>

      {category && (
        <div className="mt-14">
          <Link
            href={`/categoria/${category.slug}`}
            className="text-sm transition-colors hover:text-caramel"
          >
            ← Volver a {category.name}
          </Link>
        </div>
      )}
    </div>
  );
}
