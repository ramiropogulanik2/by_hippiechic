"use client";

import Link from "next/link";
import CartLineItem from "@/components/CartLineItem";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  function handleSubmitOrder() {
    // TODO: Fase 6 - armar mensaje de WhatsApp y guardar order en Supabase
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="text-sm transition-colors hover:text-caramel"
      >
        ← Seguir comprando
      </Link>

      <h1 className="mb-8 mt-6 font-display text-3xl font-semibold sm:text-4xl">
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="font-accent text-2xl text-ink/60">
            Tu carrito está vacío
          </p>
          <Link
            href="/"
            className="rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
          <ul className="border-t border-ink/10">
            {items.map((item) => (
              <CartLineItem key={item.variantId} item={item} />
            ))}
          </ul>

          <div className="mt-8 flex items-baseline justify-between">
            <span className="font-body text-sm font-medium">Total</span>
            <span className="font-display text-3xl font-semibold sm:text-4xl">
              {formatPrice(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            className="mt-8 w-full rounded-full bg-ink px-6 py-4 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90"
          >
            Hacer pedido
          </button>

          <p className="mt-3 text-center text-xs text-ink/60">
            El pedido se confirma por WhatsApp
          </p>
        </>
      )}
    </div>
  );
}
