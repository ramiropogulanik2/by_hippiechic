import Link from "next/link";
import { Package, ShoppingBag, Tags, Wallet } from "lucide-react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

// El cliente admin no toca cookies, así que sin esto Next prerenderiza el
// dashboard en build time y las métricas quedarían congeladas.
export const dynamic = "force-dynamic";

// Los embeds de Supabase pueden llegar como objeto o como array de un
// elemento según cómo resuelva la relación (mismo caso que en el detalle de
// pedido).
function firstOf(value) {
  return Array.isArray(value) ? value[0] : value;
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function AdminHomePage() {
  const supabase = createAdminClient();

  const [
    { count: pendingOrdersCount },
    { count: publishedProductsCount },
    { count: activeCategoriesCount },
    { data: monthlyOrders },
    { data: lowStockVariants },
    { data: recentOrders },
  ] = await Promise.all([
    // head: true + count exact devuelve solo el número, sin traer las filas.
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendiente"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_visible", true),
    supabase
      .from("orders")
      .select("total")
      .eq("status", "confirmado")
      .gte("created_at", startOfCurrentMonth()),
    supabase
      .from("product_variants")
      .select("id, size, color, stock, products(name)")
      .lte("stock", 2)
      .order("stock", { ascending: true })
      .limit(8),
    supabase
      .from("orders")
      .select("id, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // numeric(10,2) puede volver como string desde postgrest: Number() a
  // propósito antes de sumar, si no "0" + "15000" concatena en vez de sumar.
  const monthlyRevenue = (monthlyOrders ?? []).reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const lowStockList = lowStockVariants ?? [];
  const recentOrderList = recentOrders ?? [];

  const metrics = [
    {
      label: "Pedidos pendientes",
      value: pendingOrdersCount ?? 0,
      Icon: ShoppingBag,
    },
    {
      label: "Productos publicados",
      value: publishedProductsCount ?? 0,
      Icon: Package,
    },
    {
      label: "Categorías activas",
      value: activeCategoriesCount ?? 0,
      Icon: Tags,
    },
    { label: "Ingresos del mes", value: formatPrice(monthlyRevenue), Icon: Wallet },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Panel de administración
        </h1>
        <p className="font-body text-sm text-ink/70">Hippie &amp; Chic</p>
      </div>

      {/* ---------- Métricas ---------- */}
      {/* El ícono es solo apoyo para escanear más rápido cuál tarjeta es
          cuál — el número sigue siendo lo más grande y lo primero que se lee
          en cada una, no compite con él. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-sm border border-ink/10 bg-card p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caramel/15 text-caramel">
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-body text-xs text-ink/70">{label}</span>
              <span className="font-display text-2xl font-semibold sm:text-3xl">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Accesos rápidos ---------- */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/categorias/nueva"
          className="rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
        >
          + Nueva categoría
        </Link>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ---------- Stock bajo ---------- */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">Stock bajo</h2>

          {lowStockList.length === 0 ? (
            <p className="rounded-sm border border-ink/10 bg-card p-6 text-center font-body text-sm text-ink/70">
              Todo con buen stock
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lowStockList.map((variant) => {
                const product = firstOf(variant.products);

                const variantLabel = [
                  variant.size ? `Talle ${variant.size}` : null,
                  variant.color,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between gap-3 rounded-sm border border-ink/10 bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-body text-sm font-medium">
                        {product?.name ?? "Producto eliminado"}
                      </span>
                      {variantLabel && (
                        <span className="text-xs text-ink/70">
                          {variantLabel}
                        </span>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        variant.stock === 0
                          ? "bg-rose text-sand"
                          : "bg-caramel/20 text-caramel"
                      }`}
                    >
                      {variant.stock} en stock
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---------- Últimos pedidos ---------- */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              Últimos pedidos
            </h2>
            <Link
              href="/admin/pedidos"
              className="text-sm underline-offset-4 transition-colors hover:text-caramel hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {recentOrderList.length === 0 ? (
            <p className="rounded-sm border border-ink/10 bg-card p-6 text-center font-body text-sm text-ink/70">
              Todavía no hay pedidos.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentOrderList.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="flex flex-wrap items-center gap-3 rounded-sm border border-ink/10 bg-card px-4 py-3 transition-colors hover:border-ink/30"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-body text-sm font-medium">
                        {order.customer_name ?? "Sin nombre"}
                      </span>
                      <span className="text-xs text-ink/70">
                        {formatRelativeDate(order.created_at)}
                      </span>
                    </div>

                    <span className="font-body text-sm font-bold">
                      {formatPrice(order.total)}
                    </span>

                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
