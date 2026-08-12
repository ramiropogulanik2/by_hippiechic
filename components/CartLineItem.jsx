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
    <li className="flex gap-4 border-b border-ink/10 py-5">
      <Link
        href={`/producto/${item.productSlug}`}
        className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-sm bg-sand"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
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
            <p className="text-xs text-ink/60">
              {[
                item.size ? `Talle: ${item.size}` : null,
                item.color ? `Color: ${item.color}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <p className="text-xs text-ink/60">
            {formatPrice(item.unitPrice)} c/u
          </p>
        </div>

        <div className="flex items-center gap-4">
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
            className="text-ink/50 transition-colors hover:text-rose"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p className="shrink-0 self-start font-body text-sm font-bold">
        {formatPrice(item.unitPrice * item.quantity)}
      </p>
    </li>
  );
}
