import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/products";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Cliente admin para poder editar también los productos despublicados.
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price, category_id, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const [{ data: images }, { data: variants }, { data: categories }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id, image_url")
        .eq("product_id", id)
        .order("display_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("id, size, color, stock")
        .eq("product_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("categories")
        .select("id, name")
        .order("display_order", { ascending: true }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/productos"
          className="text-sm transition-colors hover:text-caramel"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl font-semibold">
          Editar {product.name}
        </h1>
      </div>

      {/* bind fija el id del lado servidor: ProductForm siempre llama
          action(formData), sin saber si crea o edita. */}
      <ProductForm
        product={{
          ...product,
          images: images ?? [],
          variants: variants ?? [],
        }}
        categories={categories ?? []}
        action={updateProduct.bind(null, product.id)}
      />
    </div>
  );
}
