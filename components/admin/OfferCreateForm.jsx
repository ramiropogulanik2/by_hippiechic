"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startProductOffer } from "@/lib/actions/offers";
import { formatPrice } from "@/lib/format";
import { BADGE_OPTIONS, discountPercent } from "@/lib/productBadge";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

// Bajar el precio de una prenda sin pasar por el form completo del producto:
// elegís la prenda, ponés cuánto va a costar ahora, y el precio que tenía
// queda guardado solo como precio anterior (el tachado de la tarjeta).
export default function OfferCreateForm({ products = [] }) {
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [badge, setBadge] = useState("oportunidad");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selected = products.find((product) => product.id === productId) ?? null;

  const parsedSale = salePrice.trim() ? Number(salePrice) : null;
  const currentPrice = selected ? Number(selected.price) : null;

  const isTooHigh =
    parsedSale != null &&
    currentPrice != null &&
    Number.isFinite(parsedSale) &&
    parsedSale >= currentPrice;

  const discount = selected ? discountPercent(salePrice, selected.price) : null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!productId) {
      setErrorMessage("Elegí un producto.");
      return;
    }

    if (isTooHigh) {
      setErrorMessage(
        `El precio de oferta tiene que ser menor que ${formatPrice(currentPrice)}.`
      );
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      const result = await startProductOffer(productId, { salePrice, badge });

      if (!result?.success) {
        setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      // El producto pasa a la lista de abajo, así que el form vuelve a cero.
      setProductId("");
      setSalePrice("");
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
          <span className="font-medium">Nuevo precio</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            placeholder={
              currentPrice != null ? `Menos de ${currentPrice}` : "Precio rebajado"
            }
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
          disabled={isPending || isTooHigh}
          className="rounded-full bg-ink px-6 py-2.5 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Bajando..." : "Bajar el precio"}
        </button>
      </div>

      {/* Se dice en palabras lo que va a pasar antes de que pase: es un
          cambio de precio real sobre el catálogo publicado. */}
      {selected && !isTooHigh && discount != null && (
        <p className="font-body text-sm text-ink/70">
          Pasa de {formatPrice(selected.price)} a{" "}
          <strong className="font-medium text-caramel">
            {formatPrice(parsedSale)}
          </strong>{" "}
          — {discount}% off. En la tarjeta va a verse{" "}
          {formatPrice(selected.price)} tachado al lado.
        </p>
      )}

      {selected && isTooHigh && (
        <p className="font-body text-sm text-rose">
          Tiene que ser menor que {formatPrice(selected.price)}, que es lo que
          cuesta ahora.
        </p>
      )}

      {errorMessage && <p className="text-sm text-rose">{errorMessage}</p>}
    </form>
  );
}
