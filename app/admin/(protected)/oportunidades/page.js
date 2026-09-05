import OfferCreateForm from "@/components/admin/OfferCreateForm";
import OfferRow from "@/components/admin/OfferRow";
import { createAdminClient } from "@/lib/supabase/admin";

// Pantalla de gestión del cambio #12 del handoff. Se trabaja como piensa la
// dueña: "esto cuesta 96.000 y lo bajo a 90.000". Se carga el precio nuevo y
// el que estaba queda solo como precio anterior (el tachado de la tarjeta).
// Acá se ve el conjunto: qué está rebajado hoy, con cuánto de descuento, y se
// levanta la liquidación sin abrir 15 productos.
export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const supabase = createAdminClient();

  // Cliente admin: incluye también los borradores, que pueden tener la oferta
  // preparada antes de publicarse.
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, compare_at_price, badge, is_published")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error cargando productos:", error.message);
  }

  const productList = products ?? [];

  // Una sola consulta para las portadas de los que están en oferta.
  const active = productList.filter(
    (product) => product.compare_at_price != null || product.badge
  );
  const available = productList.filter(
    (product) => product.compare_at_price == null && !product.badge
  );

  const coverByProduct = new Map();

  if (active.length > 0) {
    const { data: images } = await supabase
      .from("product_images")
      .select("product_id, image_url")
      .in(
        "product_id",
        active.map((product) => product.id)
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
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl">Oportunidades</h1>
        <p className="font-body text-sm text-ink/70">
          Bajá el precio de una prenda y el que tenía queda tachado al lado en
          la tarjeta. Al terminar la oferta, el precio vuelve solo al de antes.
          Los pedidos ya hechos no cambian: guardan el precio del momento de la
          compra.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink/70">
          Bajar el precio de un producto
        </h2>

        <OfferCreateForm products={available} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink/70">
          En oferta ahora ({active.length})
        </h2>

        {active.length === 0 ? (
          <p className="py-12 text-center font-accent text-2xl text-ink/60">
            Todavía no hay ningún producto en oferta.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((product) => (
              <OfferRow
                key={product.id}
                product={{
                  ...product,
                  imageUrl: coverByProduct.get(product.id) ?? null,
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
