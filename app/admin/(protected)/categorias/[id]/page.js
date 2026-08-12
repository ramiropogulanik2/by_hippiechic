import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { updateCategory } from "@/lib/actions/categories";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Cliente admin para poder editar también las categorías ocultas.
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, is_visible")
    .eq("id", id)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/categorias"
          className="text-sm transition-colors hover:text-caramel"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl font-semibold">
          Editar {category.name}
        </h1>
      </div>

      {/* bind deja el id fijado del lado del servidor, así el form cliente
          siempre invoca la action igual: action(formData). */}
      <CategoryForm
        category={category}
        action={updateCategory.bind(null, category.id)}
      />
    </div>
  );
}
