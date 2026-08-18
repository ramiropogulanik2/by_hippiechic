import Image from "next/image";
import Link from "next/link";
import CartLink from "@/components/CartLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:h-20 sm:px-6">
        {/* Columna izquierda vacía: mantiene el logo ópticamente centrado. */}
        <div aria-hidden="true" />

        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/hippiechic-logo-v2.png"
            alt="Hippie & Chic"
            width={582}
            height={190}
            priority
            className="h-10 w-auto sm:h-12"
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
