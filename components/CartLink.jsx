"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartLink() {
  const items = useCartStore((state) => state.items);

  // El servidor no tiene localStorage, así que siempre renderiza "sin datos".
  // Hasta que montemos en el cliente mostramos el ícono pelado; recién ahí
  // aparece el badge. Sin este guard, el HTML del server y el del cliente
  // difieren y React tira mismatch de hidratación.
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
      className="relative inline-flex text-ink transition-colors hover:text-caramel"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />

      {totalQuantity > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-medium leading-none text-sand">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
