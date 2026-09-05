"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { endProductOffer, saveProductOffer } from "@/lib/actions/offers";
import { formatPrice } from "@/lib/format";
import { BADGE_OPTIONS, discountPercent } from "@/lib/productBadge";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

export default function OfferRow({ product }) {
  const router = useRouter();

  const savedPrice = String(product.price);
  const savedCompare =
    product.compare_at_price != null ? String(product.compare_at_price) : "";

  const [price, setPrice] = useState(savedPrice);
  const [compareAtPrice, setCompareAtPrice] = useState(savedCompare);
  const [badge, setBadge] = useState(product.badge ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Se compara contra lo guardado para no ofrecer "Guardar" cuando no hay
  // nada que guardar (y para no pisar la fila con un update inútil).
  const isDirty =
    price !== savedPrice ||
    compareAtPrice !== savedCompare ||
    badge !== (product.badge ?? "");

  const discount = discountPercent(price, compareAtPrice);
  const savedDiscount = discountPercent(product.price, product.compare_at_price);

  function run(actionPromise) {
    setErrorMessage("");

    startTransition(async () => {
      const result = await actionPromise;

      if (!result?.success) {
        setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      // revalidatePath invalida el cache del server, pero esta fila ya está
      // montada con las props viejas: sin refresh seguiría marcada como
      // "sin guardar" después de guardar.
      router.refresh();
    });
  }

  function handleEnd() {
    // Terminar la oferta devuelve el precio al que estaba: es un cambio de
    // precio sobre el catálogo publicado, así que se dice cuál va a quedar.
    const message =
      product.compare_at_price != null
        ? `¿Terminar la oferta de "${product.name}"? El precio vuelve a ${formatPrice(
            product.compare_at_price
          )}.`
        : `¿Sacarle la etiqueta a "${product.name}"? El precio no cambia.`;

    if (!window.confirm(message)) return;

    run(endProductOffer(product.id));
  }

  return (
    <li className="flex flex-col gap-4 rounded-sm border border-ink/10 bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-sand">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-ink/30" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/admin/productos/${product.id}`}
            className="font-body text-sm font-medium underline-offset-4 transition-colors hover:text-caramel hover:underline"
          >
            {product.name}
          </Link>

          {/* Lo guardado, no lo que hay tipeado en los inputs: es la línea
              contra la que se compara mientras se edita. */}
          <span className="flex flex-wrap items-baseline gap-2 text-xs text-ink/70">
            <span>Hoy se vende a {formatPrice(product.price)}</span>

            {product.compare_at_price != null && (
              <>
                <span className="line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="text-caramel-deep">−{savedDiscount}%</span>
              </>
            )}

            {product.is_published ? null : <span>· sin publicar</span>}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Precio de venta</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">Precio anterior</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={compareAtPrice}
            onChange={(event) => setCompareAtPrice(event.target.value)}
            placeholder="Sin tachado"
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending || !isDirty}
            onClick={() =>
              run(saveProductOffer(product.id, { price, compareAtPrice, badge }))
            }
            className="rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-sand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleEnd}
            className="rounded-full border border-ink/20 px-5 py-2.5 font-body text-sm text-ink/70 transition-colors hover:border-rose hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
          >
            Terminar
          </button>
        </div>
      </div>

      {isDirty && discount != null && (
        <p className="font-body text-sm text-ink/70">
          Va a quedar en {formatPrice(price)} con {formatPrice(compareAtPrice)}{" "}
          tachado — {discount}% off.
        </p>
      )}

      {errorMessage && <p className="text-sm text-rose">{errorMessage}</p>}
    </li>
  );
}
