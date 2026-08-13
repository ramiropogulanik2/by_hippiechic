import Image from "next/image";
import Link from "next/link";
import CartLink from "@/components/CartLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-24 sm:px-6">
        {/* Columna izquierda vacía: mantiene el logo ópticamente centrado. */}
        <div aria-hidden="true" />

        <Link href="/" className="flex items-center justify-center">
          {/* width/height son las dimensiones reales del archivo (431x499),
              necesarias para que Next calcule el aspect ratio. El tamaño que
              se ve lo fijan las clases: alto fijo, ancho automático. */}
          <Image
            src="/hippiechic-logo.png"
            alt="Hippie & Chic"
            width={431}
            height={499}
            priority
            className="h-13 w-auto sm:h-16"
          />
        </Link>

        <nav className="flex items-center justify-end gap-4 sm:gap-6">
          <Link
            href="/#categorias"
            className="hidden text-sm font-medium transition-colors hover:text-caramel sm:inline"
          >
            Categorías
          </Link>

          <CartLink />
        </nav>
      </div>
    </header>
  );
}
