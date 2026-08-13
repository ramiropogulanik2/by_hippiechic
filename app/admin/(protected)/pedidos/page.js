import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "rechazado", label: "Rechazados" },
];

const EMPTY_MESSAGES = {
  todos: "Todavía no hay pedidos.",
  pendiente: "No hay pedidos pendientes.",
  confirmado: "No hay pedidos confirmados.",
  rechazado: "No hay pedidos rechazados.",
};

export default async function AdminOrdersPage({ searchParams }) {
  // En Next 16 searchParams también es una promesa.
  const { estado } = await searchParams;

  const activeFilter = FILTERS.some((filter) => filter.value === estado)
    ? estado
    : "todos";

  const supabase = createAdminClient();

  // Cliente admin obligatorio: orders no tiene policy de SELECT para nadie.
  let query = supabase
    .from("orders")
    .select("id, customer_name, total, status, created_at")
    .order("created_at", { ascending: false });

  if (activeFilter !== "todos") {
    query = query.eq("status", activeFilter);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error cargando pedidos:", error.message);
  }

  const orderList = orders ?? [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === activeFilter;

          return (
            <Link
              key={filter.value}
              href={
                filter.value === "todos"
                  ? "/admin/pedidos"
                  : `/admin/pedidos?estado=${filter.value}`
              }
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-caramel bg-caramel text-sand"
                  : "border-ink/20 text-ink hover:border-ink/40"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {orderList.length === 0 ? (
        <p className="py-16 text-center font-accent text-2xl text-ink/60">
          {EMPTY_MESSAGES[activeFilter]}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orderList.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/pedidos/${order.id}`}
                className="flex flex-wrap items-center gap-4 rounded-sm border border-ink/10 bg-card p-4 transition-colors hover:border-ink/30"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-body text-sm font-medium">
                    {order.customer_name ?? "Sin nombre"}
                  </span>
                  <span className="text-xs text-ink/50">
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
    </div>
  );
}
