"use client";

import { Check } from "lucide-react";
import { COLOR_PALETTE } from "@/lib/colorPalette";

export default function ColorGridPicker({ selectedColors = [], onChange }) {
  function toggleColor(name) {
    const isSelected = selectedColors.includes(name);

    const next = isSelected
      ? selectedColors.filter((color) => color !== name)
      : [...selectedColors, name];

    // Orden estable según la paleta, no según el orden de clicks.
    onChange(
      COLOR_PALETTE.filter((color) => next.includes(color.name)).map(
        (color) => color.name
      )
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Colores</span>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {COLOR_PALETTE.map((color) => {
          const isSelected = selectedColors.includes(color.name);

          return (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color.name)}
              aria-pressed={isSelected}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                style={{ backgroundColor: color.hex }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-ink ring-2 ring-caramel ring-offset-2 ring-offset-sand"
                    : "border-ink/20"
                }`}
              >
                {isSelected && (
                  <Check
                    className="h-4 w-4 text-sand mix-blend-difference"
                    strokeWidth={3}
                  />
                )}
              </span>

              <span
                className={`text-center text-[11px] leading-tight ${
                  isSelected ? "font-medium text-ink" : "text-ink/70"
                }`}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
