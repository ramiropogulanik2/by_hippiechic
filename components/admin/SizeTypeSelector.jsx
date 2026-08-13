"use client";

import { SIZE_PRESETS, SIZE_TYPE_LABELS } from "@/lib/sizePresets";

const selectClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink focus:border-caramel focus:outline-none sm:w-64";

export default function SizeTypeSelector({
  sizeType = "unico",
  selectedSizes = [],
  onSizeTypeChange,
  onSelectedSizesChange,
}) {
  const presetSizes = SIZE_PRESETS[sizeType] ?? [];

  function toggleSize(size) {
    const isSelected = selectedSizes.includes(size);

    const next = isSelected
      ? selectedSizes.filter((current) => current !== size)
      : [...selectedSizes, size];

    // Se ordenan según el preset para que la matriz salga siempre en el mismo
    // orden, sin importar en qué secuencia se clickeó.
    onSelectedSizesChange(presetSizes.filter((size) => next.includes(size)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="size-type" className="text-sm font-medium">
          Tipo de talle
        </label>
        <select
          id="size-type"
          value={sizeType}
          onChange={(event) => onSizeTypeChange(event.target.value)}
          className={selectClass}
        >
          {Object.entries(SIZE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {sizeType !== "unico" && (
        <div className="flex flex-wrap gap-2">
          {presetSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                aria-pressed={isSelected}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-caramel bg-caramel text-sand"
                    : "border-ink/20 text-ink hover:border-ink/40"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
