"use client";

import { useEffect, useMemo, useState } from "react";

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

function Pill({ label, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        isSelected
          ? "border-caramel bg-caramel text-sand"
          : "border-ink/20 text-ink hover:border-ink/40"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProductVariantSelector({
  variants = [],
  onVariantChange,
}) {
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

  function handleAddToCart() {
    // TODO: Fase 5 - conectar con estado del carrito
  }

  return (
    <div className="flex flex-col gap-6">
      {sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Talle</span>
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
          <span className="text-sm font-medium">Color</span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Pill
                key={color}
                label={color}
                isSelected={color === selectedColor}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {isOutOfStock ? (
          <p className="text-sm text-rose">
            {hasSelectors
              ? "Sin stock en esta combinación"
              : "Sin stock disponible"}
          </p>
        ) : (
          <p className="text-sm text-ink/60">
            {stock === 1 ? "Última unidad disponible" : `Stock: ${stock}`}
          </p>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity sm:w-auto ${
            isOutOfStock
              ? "cursor-not-allowed opacity-40"
              : "hover:opacity-90"
          }`}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
