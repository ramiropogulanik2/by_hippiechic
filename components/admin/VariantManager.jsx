"use client";

import { Trash2 } from "lucide-react";

const EMPTY_VARIANT = { size: "", color: "", stock: 0 };

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

export default function VariantManager({ variants = [], onChange }) {
  // Componente controlado: no guarda estado propio. La fila vacía por defecto
  // es solo visual — en cuanto se toca, se emite como array de verdad.
  const rows = variants.length > 0 ? variants : [EMPTY_VARIANT];

  function updateRow(index, patch) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { ...EMPTY_VARIANT }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Variantes</span>
        <p className="text-xs text-ink/70">
          Dejá Talle y Color vacíos si el producto no tiene variantes (ej: una
          cartera única).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div
            key={row.id ?? `nueva-${index}`}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="flex min-w-24 flex-1 flex-col gap-1">
              <label
                htmlFor={`variant-size-${index}`}
                className="text-xs text-ink/70"
              >
                Talle
              </label>
              <input
                id={`variant-size-${index}`}
                type="text"
                value={row.size ?? ""}
                onChange={(event) =>
                  updateRow(index, { size: event.target.value })
                }
                placeholder="S, M, L..."
                className={inputClass}
              />
            </div>

            <div className="flex min-w-24 flex-1 flex-col gap-1">
              <label
                htmlFor={`variant-color-${index}`}
                className="text-xs text-ink/70"
              >
                Color
              </label>
              <input
                id={`variant-color-${index}`}
                type="text"
                value={row.color ?? ""}
                onChange={(event) =>
                  updateRow(index, { color: event.target.value })
                }
                placeholder="Negro, Camel..."
                className={inputClass}
              />
            </div>

            <div className="flex w-24 flex-col gap-1">
              <label
                htmlFor={`variant-stock-${index}`}
                className="text-xs text-ink/70"
              >
                Stock
              </label>
              <input
                id={`variant-stock-${index}`}
                type="number"
                min="0"
                value={row.stock ?? 0}
                onChange={(event) =>
                  updateRow(index, { stock: event.target.value })
                }
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label="Eliminar variante"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink/60 transition-colors hover:border-rose hover:text-rose"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="self-start rounded-full border border-ink/20 px-4 py-2 font-body text-sm transition-colors hover:border-ink/40"
      >
        + Agregar variante
      </button>
    </div>
  );
}
