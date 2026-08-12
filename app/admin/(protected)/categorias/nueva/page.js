import Link from "next/link";
import CategoryForm from "@/components/admin/CategoryForm";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/categorias"
          className="text-sm transition-colors hover:text-caramel"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl font-semibold">Nueva categoría</h1>
      </div>

      <CategoryForm category={null} action={createCategory} />
    </div>
  );
}
