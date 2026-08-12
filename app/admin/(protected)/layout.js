import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

// Este layout vive dentro del route group (protected), así que envuelve /admin
// y todo lo que cuelgue de él, pero NO /admin/login — que está fuera del grupo
// y por eso se renderiza sin este shell.
const NAV_LINKS = [
  { label: "Categorías", href: "/admin/categorias" },
  { label: "Productos", href: "/admin/productos" },
  { label: "Pedidos", href: "/admin/pedidos" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-sand">
      <header className="bg-ink text-sand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-accent text-xl tracking-wide">
            Hippie &amp; Chic — Admin
          </Link>

          <nav className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-sand/80 transition-colors hover:text-sand"
              >
                {link.label}
              </Link>
            ))}

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
