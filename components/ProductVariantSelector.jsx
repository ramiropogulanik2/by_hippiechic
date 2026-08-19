"use client";

import { useEffect, useMemo, useState } from "react";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { findPaletteColor } from "@/lib/colorPalette";
import { useCartStore } from "@/lib/store/cartStore";

function uniqueValues(variants, key) {
  const values = [];

  for (const variant of variants) {
    const value = variant[key];
    if (value && !values.includes(value)) {
      values.push(value);
    }
  }

  return values;
}

function Pill({ label, isSelected, onClick, swatchHex = null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      // min-w/py generosos: son el control que más se toca en mobile y una
      // pastilla chica de talle es difícil de acertar con el pulgar.
      className={`flex min-w-11 items-center justify-center gap-2 rounded-full border px-4 py-2 font-body text-sm transition-all duration-300 ${
        isSelected
          ? "border-ink bg-ink text-sand"
          : "border-ink/20 text-ink hover:border-ink hover:bg-ink/5"
      }`}
    >
      {/* Solo si el color existe en la paleta; los cargados a mano que no
          coinciden siguen mostrándose como texto pelado. */}
      {swatchHex && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: swatchHex }}
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink/20"
        />
      )}
      {label}
    </button>
  );
}

export default function ProductVariantSelector({
  variants = [],
  onVariantChange,
  productId,
  productSlug,
  productName,
  price,
  imageUrl = null,
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const sizes = useMemo(() => uniqueValues(variants, "size"), [variants]);
  const colors = useMemo(() => uniqueValues(variants, "color"), [variants]);

  const [selectedSize, setSelectedSize] = useState(() => sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState(() => colors[0] ?? null);

  const selectedVariant = useMemo(() => {
    return variants.find((variant) => {
      const sizeMatches = sizes.length === 0 || variant.size === selectedSize;
      const colorMatches =
        colors.length === 0 || variant.color === selectedColor;
      return sizeMatches && colorMatches;
    });
  }, [variants, sizes, colors, selectedSize, selectedColor]);

  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant ?? null);
    }
  }, [selectedVariant, onVariantChange]);

  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const hasSelectors = sizes.length > 0 || colors.length > 0;

  // Feedback breve tras agregar; el cleanup evita que quede colgado el timer
  // si el componente se desmonta antes de que expire.
  useEffect(() => {
    if (!justAdded) return;

    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function handleAddToCart() {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productSlug,
      productName,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: price,
      quantity,
      imageUrl,
    });

    setJustAdded(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
            Talle
          </span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Pill
                key={size}
                label={size}
                isSelected={size === selectedSize}
                onClick={() => setSelectedSize(size)}
              />
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
            Color
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Pill
                key={color}
                label={color}
                isSelected={color === selectedColor}
                onClick={() => setSelectedColor(color)}
                swatchHex={findPaletteColor(color)?.hex ?? null}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {isOutOfStock ? (
          <p className="flex items-center gap-2 font-body text-sm text-rose">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose"
            />
            {hasSelectors
              ? "Sin stock en esta combinación"
              : "Sin stock disponible"}
          </p>
        ) : (
          <p className="flex items-center gap-2 font-body text-sm text-ink/70">
            {/* Punto oliva para "hay stock", arcilla para "no hay": el estado
                se lee de un vistazo sin tener que procesar el texto. */}
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-olive"
            />
            {stock === 1 ? "Última unidad disponible" : `Stock: ${stock}`}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          <QuantityStepper
            quantity={quantity}
            min={1}
            onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
            onIncrease={() => setQuantity((current) => current + 1)}
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full rounded-full px-8 py-4 font-body text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 sm:w-auto sm:flex-1 ${
              isOutOfStock
                ? "cursor-not-allowed bg-ink/25 text-sand"
                : justAdded
                  ? "bg-olive text-sand"
                  : "bg-ink text-sand hover:bg-caramel"
            }`}
          >
            {justAdded ? "✓ Agregado" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
