import Link from "next/link";
import { notFound } from "next/navigation";
import { Landmark, RotateCcw, Truck } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// Resumen corto a propósito: la versión larga de cada tema ya vive en
// lib/policyContent.js (popups del footer). Acá no se repite el texto
// completo, solo el dato que empuja a completar la compra.
const TRUST_POINTS = [
  { Icon: Truck, label: "Envíos a todo el país por Andreani" },
  { Icon: Landmark, label: "Pago por transferencia, se coordina por WhatsApp" },
  { Icon: RotateCcw, label: "Cambios dentro de los 7 días" },
];

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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <ProductGallery images={images ?? []} productName={product.name} />

        {/* Sticky en desktop: con galerías de varias fotos, el panel de
            compra se iba de pantalla al scrollear y había que volver arriba
            para elegir el talle. */}
        <div className="flex flex-col gap-7 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 border-b border-ink/10 pb-7">
            {category && (
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-caramel">
                {category.name}
              </p>
            )}

            <h1 className="font-display text-3xl leading-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="font-display text-2xl font-semibold sm:text-3xl">
              {formatPrice(product.price)}
            </p>
          </div>

          {product.description && (
            <p className="max-w-prose font-body text-base leading-relaxed text-ink/80">
              {product.description}
            </p>
          )}

          <ProductVariantSelector
            variants={variants ?? []}
            productId={product.id}
            productSlug={slug}
            productName={product.name}
            price={product.price}
            imageUrl={images?.[0]?.image_url ?? null}
          />

          {/* Refuerza la decisión de compra justo después del CTA, que es
              donde más se necesita — el detalle completo de cada punto ya
              está a un click en el footer, esto es solo el resumen. */}
          <ul className="flex flex-col gap-3.5 border-t border-ink/10 pt-7">
            {TRUST_POINTS.map(({ Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 font-body text-sm text-ink/80"
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-caramel"
                  strokeWidth={1.5}
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {category && (
        <div className="mt-20 border-t border-ink/10 pt-8">
          <Link
            href={`/categoria/${category.slug}`}
            className="link-underline font-body text-xs font-semibold uppercase tracking-[0.16em] transition-colors hover:text-caramel"
          >
            ← Volver a {category.name}
          </Link>
        </div>
      )}
    </div>
  );
}
