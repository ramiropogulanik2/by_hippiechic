import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import CategoryRowActions from "@/components/admin/CategoryRowActions";
import { createAdminClient } from "@/lib/supabase/admin";

// El cliente admin no toca cookies, así que sin esto Next prerenderiza la
// página en build time y el listado quedaría congelado.
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();

  // Cliente admin a propósito: bypassea la RLS de "is_visible = true", que si
  // no escondería del panel justo las categorías ocultas que hay que gestionar.
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, is_visible, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error cargando categorías:", error.message);
  }

  const categoryList = categories ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Categorías</h1>

        <Link
          href="/admin/categorias/nueva"
          className="rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
        >
          + Nueva categoría
        </Link>
      </div>

      {categoryList.length === 0 ? (
        <p className="py-16 text-center font-accent text-2xl text-ink/60">
          Todavía no hay categorías. Creá la primera.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categoryList.map((category, index) => (
            <li
              key={category.id}
              // Mismo criterio que en /admin/productos: columna en mobile,
              // fila en sm+ (sm:contents disuelve los wrappers y reproduce la
              // fila plana original). Evita que el nombre se comprima cuando
              // no entra junto al badge + "Editar" + las acciones.
              className="flex flex-col gap-3 rounded-sm border border-ink/10 bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-4 sm:contents">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-sand">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon
                      className="h-5 w-5 text-ink/30"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-body text-sm font-medium">
                    {category.name}
                  </span>
                  <span className="font-mono text-xs text-ink/70">
                    /{category.slug}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:contents">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    category.is_visible
                      ? "bg-caramel/20 text-caramel"
                      : "bg-ink/10 text-ink/70"
                  }`}
                >
                  {category.is_visible ? "Visible" : "Oculta"}
                </span>

                <Link
                  href={`/admin/categorias/${category.id}`}
                  className="text-sm underline-offset-4 transition-colors hover:text-caramel hover:underline"
                >
                  Editar
                </Link>

                <CategoryRowActions
                  category={category}
                  isFirst={index === 0}
                  isLast={index === categoryList.length - 1}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
