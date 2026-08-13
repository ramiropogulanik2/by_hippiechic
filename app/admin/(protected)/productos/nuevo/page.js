import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/products";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createAdminClient();

  // Todas las categorías, incluidas las ocultas: una categoría oculta igual
  // puede ir recibiendo productos antes de publicarse.
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/productos"
          className="text-sm transition-colors hover:text-caramel"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl font-semibold">Nuevo producto</h1>
      </div>

      <ProductForm
        product={null}
        categories={categories ?? []}
        action={createProduct}
      />
    </div>
  );
}
