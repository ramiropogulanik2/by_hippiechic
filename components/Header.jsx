"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartLink from "@/components/CartLink";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Solo en la home hay un hero a pantalla completa debajo del header. En el
  // resto de las páginas el contenido arranca sobre fondo claro, así que el
  // header va sólido desde el principio.
  const isHome = pathname === "/";
  const isOverHero = isHome && !isScrolled;

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        isOverHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-ink/10 bg-sand/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-20 sm:px-6 lg:px-8">
        {/* Columna izquierda vacía: mantiene el logo ópticamente centrado. */}
        <div aria-hidden="true" />

        <Link href="/" className="flex items-center justify-center">
          {/* El PNG del logo es tinta oscura sobre transparente: sobre las
              fotos del hero se pierde. Mismo filtro que usa LogoMarquee para
              blanquearlo, aplicado solo mientras el header está encima. */}
          <Image
            src="/hippiechic-logo-v2.png"
            alt="Hippie & Chic"
            width={582}
            height={190}
            priority
            className={`h-12 w-auto transition-[filter,transform] duration-500 hover:scale-[1.03] sm:h-16 ${
              isOverHero
                ? "[filter:brightness(0)_invert(1)_drop-shadow(0_1px_6px_rgba(0,0,0,0.45))]"
                : ""
            }`}
          />
        </Link>

        <nav
          className={`flex items-center justify-end gap-5 transition-colors duration-500 sm:gap-7 ${
            isOverHero ? "text-sand" : "text-ink"
          }`}
        >
          <Link
            href="/#categorias"
            className="link-underline hidden font-body text-xs font-medium uppercase tracking-[0.16em] transition-colors hover:text-ember sm:inline"
          >
            Catálogo
          </Link>

          <CartLink />
        </nav>
      </div>
    </header>
  );
}
