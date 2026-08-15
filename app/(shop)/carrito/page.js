"use client";

import { useState } from "react";
import Link from "next/link";
import CartLineItem from "@/components/CartLineItem";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cartStore";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/40 focus:border-caramel focus:outline-none";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  async function handleSubmitOrder() {
    const name = customerName.trim();

    if (!name) {
      setErrorMessage("Ingresá tu nombre para continuar");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await createOrder({
      customerName: name,
      customerPhone: customerPhone,
      items,
    });

    if (!result.success) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    const message = buildOrderMessage(items, total, name);
    const whatsappUrl = buildWhatsAppUrl(message);

    // El pedido ya quedó guardado, así que el carrito se vacía igual.
    clearCart();

    if (!whatsappUrl) {
      setErrorMessage(
        "Tu pedido se guardó, pero falta configurar el número de WhatsApp del local."
      );
      setIsSubmitting(false);
      return;
    }

    window.location.href = whatsappUrl;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link href="/" className="text-sm transition-colors hover:text-caramel">
        ← Seguir comprando
      </Link>

      <h1 className="mb-8 mt-6 font-display text-3xl font-semibold sm:text-4xl">
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          {/* El pedido recién confirmado vacía el carrito, así que este es el
              único lugar donde puede verse un error posterior al guardado. */}
          {errorMessage && (
            <p className="text-sm text-rose">{errorMessage}</p>
          )}

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
        // Dos columnas en lg+: con el contenedor ya en max-w-7xl, una sola
        // columna dejaría las líneas del pedido estiradas de punta a punta.
        // El panel de la derecha queda sticky para que el total y el botón
        // sigan a la vista al scrollear una lista larga.
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
          <ul className="border-t border-ink/10">
            {items.map((item) => (
              <CartLineItem key={item.variantId} item={item} />
            ))}
          </ul>

          <aside className="flex flex-col rounded-sm border border-ink/10 bg-card p-6 lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-baseline justify-between">
              <span className="font-body text-sm font-medium">Total</span>
              <span className="font-display text-3xl font-semibold">
                {formatPrice(total)}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-name" className="text-sm font-medium">
                  Nombre
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Tu nombre"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-phone" className="text-sm font-medium">
                  Teléfono (opcional)
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 text-sm text-rose">{errorMessage}</p>
            )}

            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className={`mt-6 w-full rounded-full bg-ink px-6 py-4 font-body text-sm font-medium text-sand transition-opacity ${
                isSubmitting
                  ? "cursor-not-allowed opacity-60"
                  : "hover:opacity-90"
              }`}
            >
              {isSubmitting ? "Enviando pedido..." : "Hacer pedido"}
            </button>

            <p className="mt-3 text-center text-xs text-ink/60">
              El pedido se confirma por WhatsApp
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
