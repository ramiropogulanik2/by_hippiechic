"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductOffer } from "@/lib/actions/offers";
import { formatPrice } from "@/lib/format";
import { BADGE_OPTIONS, discountPercent } from "@/lib/productBadge";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

// Poner un producto en oferta sin pasar por el form completo del producto:
// elegís la prenda, ponés cuánto costaba y listo.
export default function OfferCreateForm({ products = [] }) {
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [badge, setBadge] = useState("oportunidad");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selected = products.find((product) => product.id === productId) ?? null;
  const discount = selected
    ? discountPercent(selected.price, compareAtPrice)
    : null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!productId) {
      setErrorMessage("Elegí un producto.");
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      const result = await saveProductOffer(productId, {
        compareAtPrice,
        badge,
      });

      if (!result?.success) {
        setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      // El producto pasa a la lista de arriba, así que el form vuelve a cero.
      setProductId("");
      setCompareAtPrice("");
      setBadge("oportunidad");
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-ink/20 p-4 font-body text-sm text-ink/60">
        Todos los productos ya tienen oferta o etiqueta.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-sm border border-ink/15 bg-card p-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex flex-[2] flex-col gap-1.5 text-sm">
          <span className="font-medium">Producto</span>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className={inputClass}
          >
            <option value="">Elegí un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatPrice(product.price)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Precio anterior</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={compareAtPrice}
            onChange={(event) => setCompareAtPrice(event.target.value)}
            placeholder="Cuánto costaba"
            className={inputClass}
          />
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Etiqueta</span>
          <select
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            className={inputClass}
          >
            <option value="">Sin etiqueta</option>
            {BADGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-ink px-6 py-2.5 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Guardando..." : "Poner en oferta"}
        </button>
      </div>

      {discount != null && (
        <p className="font-body text-sm text-ink/70">
          Queda con un {discount}% de descuento sobre{" "}
          {formatPrice(selected.price)}.
        </p>
      )}

      {errorMessage && <p className="text-sm text-rose">{errorMessage}</p>}
    </form>
  );
}
