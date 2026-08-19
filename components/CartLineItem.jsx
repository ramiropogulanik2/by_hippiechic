"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartLineItem({ item }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const hasVariantInfo = Boolean(item.size || item.color);

  return (
    <li className="flex gap-4 border-b border-ink/10 py-6 sm:gap-6">
      <Link
        href={`/producto/${item.productSlug}`}
        className="group relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-sm bg-dune sm:w-24"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Link
            href={`/producto/${item.productSlug}`}
            className="font-body text-sm font-medium transition-colors hover:text-caramel"
          >
            {item.productName}
          </Link>

          {hasVariantInfo && (
            <p className="font-body text-xs uppercase tracking-[0.12em] text-ink/70">
              {[
                item.size ? `Talle ${item.size}` : null,
                item.color,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <p className="font-body text-xs text-ink/70">
            {formatPrice(item.unitPrice)} c/u
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <QuantityStepper
            quantity={item.quantity}
            min={0}
            onDecrease={() =>
              updateQuantity(item.variantId, item.quantity - 1)
            }
            onIncrease={() =>
              updateQuantity(item.variantId, item.quantity + 1)
            }
          />

          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Eliminar ${item.productName}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-rose/10 hover:text-rose"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p className="shrink-0 self-start font-display text-base font-semibold tabular-nums">
        {formatPrice(item.unitPrice * item.quantity)}
      </p>
    </li>
  );
}
