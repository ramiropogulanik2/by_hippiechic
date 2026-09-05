"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import CartLink from "@/components/CartLink";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Cambio #6 del handoff: header sticky con navegación por familias, botón de
// WhatsApp y carrito con contador.
//
// Los destinos de "Cueros & Denim" y "Accesorios" son provisorios y el
// handoff lo dice: apuntan a la categoría más representativa de cada familia
// porque todavía no existe una página de familia que las agrupe (ese es el
// cambio #4, que no se implementó). "Novedades" lleva a la grilla de
// categorías del home por el mismo motivo: no hay sección de destacados
// (cambio #3, tampoco implementado).
const NAV_LINKS = [
  { label: "Novedades", href: "/#categorias" },
  { label: "Cueros & Denim", href: "/categoria/pantalones-jeans" },
  { label: "Accesorios", href: "/categoria/carteras-accesorios" },
  { label: "Oportunidades", href: "/categoria/oportunidades", accent: true },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Navegar no desmonta el header (vive en el layout), así que el panel
  // quedaría abierto encima de la página nueva si no se cierra a mano.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const whatsappUrl = buildWhatsAppUrl("Hola! Tengo una consulta.");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:gap-8 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/hippiechic-logo-v2.png"
            alt="Hippie & Chic"
            width={582}
            height={190}
            priority
            className="h-9 w-auto transition-transform duration-500 hover:scale-[1.03] sm:h-11"
          />
        </Link>

        {/* Nav completa solo en lg+: los 5 items miden ~520px y abajo de eso
            compiten con el logo y las acciones. Debajo va al panel. */}
        <nav className="hidden items-center justify-center gap-7 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`link-underline font-body text-[13px] uppercase tracking-[0.09em] transition-colors ${
                link.accent ? "text-caramel" : "text-ink hover:text-caramel"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border border-ink px-4 py-2.5 font-body text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-sand sm:inline-block"
            >
              WhatsApp
            </a>
          )}

          <CartLink />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Panel desplegable, no un overlay a pantalla completa: la lista es
          corta y así el contenido de atrás sigue a la vista. */}
      {menuOpen && (
        <nav
          id="menu-mobile"
          className="border-t border-ink/10 bg-sand lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`border-b border-ink/10 py-3.5 font-body text-sm uppercase tracking-[0.12em] last:border-b-0 ${
                  link.accent ? "text-caramel" : "text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-t border-ink/10 py-3.5 font-body text-sm uppercase tracking-[0.12em] text-ink sm:hidden"
              >
                WhatsApp
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
