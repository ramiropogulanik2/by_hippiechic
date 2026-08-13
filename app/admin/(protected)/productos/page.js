import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { formatPrice } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  // Cliente admin: la RLS pública filtra is_published = true y acá hacen falta
  // también los borradores.
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, is_published, categories(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando productos:", error.message);
  }

  const productList = products ?? [];

  // Una sola consulta para las portadas de todos los productos.
  const coverByProduct = new Map();

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
      if (!coverByProduct.has(image.product_id)) {
        coverByProduct.set(image.product_id, image.image_url);
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Productos</h1>

        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
        >
          + Nuevo producto
        </Link>
      </div>

      {productList.length === 0 ? (
        <p className="py-16 text-center font-accent text-2xl text-ink/60">
          Todavía no hay productos. Creá el primero.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {productList.map((product) => {
            const category = Array.isArray(product.categories)
              ? product.categories[0]
              : product.categories;
            const coverUrl = coverByProduct.get(product.id);

            return (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-4 rounded-sm border border-ink/10 bg-card p-4"
              >
                <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-sand">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      sizes="48px"
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
                    {product.name}
                  </span>
                  <span className="text-xs text-ink/50">
                    {category?.name ?? "Sin categoría"}
                  </span>
                </div>

                <span className="font-body text-sm font-bold">
                  {formatPrice(product.price)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    product.is_published
                      ? "bg-caramel/20 text-caramel"
                      : "bg-ink/10 text-ink/50"
                  }`}
                >
                  {product.is_published ? "Publicado" : "Borrador"}
                </span>

                <Link
                  href={`/admin/productos/${product.id}`}
                  className="text-sm underline-offset-4 transition-colors hover:text-caramel hover:underline"
                >
                  Editar
                </Link>

                <ProductRowActions product={product} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
