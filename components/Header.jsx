import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Arrow from "@/components/ui/Arrow";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-20 sm:px-6">
        {/* Columna izquierda vacía: mantiene el wordmark ópticamente centrado. */}
        <div aria-hidden="true" />

        <Link
          href="/"
          className="flex items-center justify-center gap-2 sm:gap-3"
        >
          <Arrow
            direction="left"
            className="h-2 w-6 text-caramel sm:h-3 sm:w-10"
          />
          <span className="whitespace-nowrap font-accent text-xl leading-none tracking-wide sm:text-3xl">
            HIPPIE &amp; CHIC
          </span>
          <Arrow
            direction="right"
            className="h-2 w-6 text-caramel sm:h-3 sm:w-10"
          />
        </Link>

        <nav className="flex items-center justify-end gap-4 sm:gap-6">
          <Link
            href="/#categorias"
            className="hidden text-sm font-medium transition-colors hover:text-caramel sm:inline"
          >
            Categorías
          </Link>
          {/* Sin lógica ni contador todavía: eso llega en la Fase 5. */}
          <span className="text-ink" aria-label="Carrito" title="Carrito">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </span>
        </nav>
      </div>
    </header>
  );
}
