import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatusActions from "@/components/admin/OrderStatusActions";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatFullDate, formatPrice } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Los embeds de Supabase pueden llegar como objeto o como array de un elemento
// según cómo resuelva la relación.
function firstOf(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_name, customer_phone, status, total, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, quantity, unit_price, product_variants(size, color, products(name))"
    )
    .eq("order_id", id);

  const itemList = items ?? [];

  // wa.me no acepta espacios, guiones ni el signo +.
  const phoneDigits = String(order.customer_phone ?? "").replace(/\D/g, "");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/pedidos"
          className="text-sm transition-colors hover:text-caramel"
        >
          ← Volver a pedidos
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-semibold">
            {order.customer_name ?? "Sin nombre"}
          </h1>
          <OrderStatusBadge status={order.status} size="lg" />
        </div>

        <p className="text-sm text-ink/70">{formatFullDate(order.created_at)}</p>

        {phoneDigits && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink/70">{order.customer_phone}</span>
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/20 px-4 py-1.5 transition-colors hover:border-caramel hover:text-caramel"
            >
              Abrir WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="rounded-sm border border-ink/10 bg-card">
        <ul className="divide-y divide-ink/10">
          {itemList.map((item) => {
            const variant = firstOf(item.product_variants);
            const product = firstOf(variant?.products);

            const variantLabel = [
              variant?.size ? `Talle: ${variant.size}` : null,
              variant?.color ? `Color: ${variant.color}` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={item.id} className="flex flex-wrap gap-4 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-body text-sm font-medium">
                    {product?.name ?? "Producto eliminado"}
                  </span>

                  {variantLabel && (
                    <span className="text-xs text-ink/70">{variantLabel}</span>
                  )}

                  <span className="text-xs text-ink/70">
                    {item.quantity} × {formatPrice(item.unit_price)}
                  </span>
                </div>

                <span className="font-body text-sm font-bold">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-baseline justify-between border-t border-ink/10 p-4">
          <span className="font-body text-sm font-medium">Total</span>
          <span className="font-display text-2xl font-semibold">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <OrderStatusActions orderId={order.id} status={order.status} />
    </div>
  );
}
