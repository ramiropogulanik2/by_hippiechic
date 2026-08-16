import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { createAdminClient } from "@/lib/supabase/admin";

// Este layout vive dentro del route group (protected), así que envuelve /admin
// y todo lo que cuelgue de él, pero NO /admin/login — que está fuera del grupo
// y por eso se renderiza sin este shell.
const NAV_LINKS = [
  { label: "Hero", href: "/admin/hero" },
  { label: "Categorías", href: "/admin/categorias" },
  { label: "Productos", href: "/admin/productos" },
  { label: "Pedidos", href: "/admin/pedidos" },
];

// El contador de pendientes tiene que reflejar la base en cada visita; sin
// esto Next prerenderiza el layout y el badge queda congelado.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const supabase = createAdminClient();

  // head: true + count exact devuelve solo el número, sin traer las filas.
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendiente");

  const pendingCount = count ?? 0;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-sand">
      <header className="bg-ink text-sand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-accent text-xl tracking-wide">
            Hippie &amp; Chic — Admin
          </Link>

          <nav className="flex items-center gap-5">
            {NAV_LINKS.map((link) => {
              const showBadge =
                link.href === "/admin/pedidos" && pendingCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 font-body text-sm text-sand/80 transition-colors hover:text-sand"
                >
                  {link.label}

                  {showBadge && (
                    <span
                      aria-label={`${pendingCount} pedidos pendientes`}
                      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1.5 text-xs font-medium text-sand"
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
