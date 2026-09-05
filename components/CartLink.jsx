"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartLink() {
  const items = useCartStore((state) => state.items);

  // El servidor no tiene localStorage, así que siempre renderiza "sin datos".
  // Hasta que montemos en el cliente mostramos el contador en 0; recién ahí
  // aparece el número real. Sin este guard, el HTML del server y el del
  // cliente difieren y React tira mismatch de hidratación.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalQuantity = mounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <Link
      href="/carrito"
      aria-label={
        totalQuantity === 0
          ? "Carrito vacío"
          : `Carrito, ${totalQuantity} ${
              totalQuantity === 1 ? "artículo" : "artículos"
            }`
      }
      // Botón sólido (cambio #6): el carrito es la acción principal del
      // header y antes era un ícono suelto que se perdía al lado del logo.
      className="flex items-center gap-2 bg-ink px-3 py-2.5 font-body text-xs uppercase tracking-[0.1em] text-sand transition-colors hover:bg-caramel sm:px-4"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
      {/* El texto se esconde en mobile pero el contador no: es el dato que
          hace falta ver de un vistazo. */}
      <span className="hidden sm:inline">Carrito</span>
      <span>({totalQuantity})</span>
    </Link>
  );
}
