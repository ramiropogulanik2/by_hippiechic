"use client";

import { useState } from "react";
import ColorGridPicker from "@/components/admin/ColorGridPicker";
import SizeTypeSelector from "@/components/admin/SizeTypeSelector";
import VariantManager from "@/components/admin/VariantManager";
import { detectMatrixMode, generateVariantMatrix } from "@/lib/variantMatrix";

export default function VariantMatrixBuilder({ variants = [], onChange }) {
  // La detección corre una sola vez, al montar: decide si las variantes que
  // ya existen se pueden representar con la grilla guiada.
  const [initial] = useState(() => detectMatrixMode(variants));

  const [mode, setMode] = useState(initial.compatible ? "guiado" : "manual");
  const [sizeType, setSizeType] = useState(initial.sizeType ?? "unico");
  const [selectedSizes, setSelectedSizes] = useState(
    initial.selectedSizes ?? []
  );
  const [selectedColors, setSelectedColors] = useState(
    initial.selectedColors ?? []
  );
  const [warning, setWarning] = useState("");

  // Cuando todavía no hay variantes, se muestra la fila que generaría la
  // selección actual. Es solo visual hasta que se toque algo.
  const rows =
    variants.length > 0
      ? variants
      : generateVariantMatrix(selectedSizes, selectedColors, variants);

  function emitMatrix(sizes, colors) {
    onChange(generateVariantMatrix(sizes, colors, variants));
  }

  function handleSizeTypeChange(nextType) {
    // Los talles del preset anterior no aplican al nuevo.
    setSizeType(nextType);
    setSelectedSizes([]);
    emitMatrix([], selectedColors);
  }

  function handleSizesChange(sizes) {
    setSelectedSizes(sizes);
    emitMatrix(sizes, selectedColors);
  }

  function handleColorsChange(colors) {
    setSelectedColors(colors);
    emitMatrix(selectedSizes, colors);
  }

  function handleStockChange(index, value) {
    const stock = Number(value);

    onChange(
      rows.map((row, i) =>
        i === index
          ? { ...row, stock: Number.isFinite(stock) ? stock : 0 }
          : row
      )
    );
  }

  function switchToGuided() {
    const detected = detectMatrixMode(variants);

    if (detected.compatible) {
      setSizeType(detected.sizeType);
      setSelectedSizes(detected.selectedSizes);
      setSelectedColors(detected.selectedColors);
      setWarning("");
    } else {
      // No se emite nada todavía: las variantes actuales quedan intactas
      // hasta que se elija un talle o color desde la grilla.
      setSizeType("unico");
      setSelectedSizes([]);
      setSelectedColors([]);
      setWarning(
        "Los talles o colores cargados no están en las listas predefinidas. Si elegís algo acá, se reemplazan por la grilla."
      );
    }

    setMode("guiado");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Variantes</span>

          <div className="flex overflow-hidden rounded-full border border-ink/20">
            <button
              type="button"
              onClick={switchToGuided}
              className={`px-3 py-1 text-xs transition-colors ${
                mode === "guiado"
                  ? "bg-caramel text-sand"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              Editor guiado
            </button>
            <button
              type="button"
              onClick={() => {
                setWarning("");
                setMode("manual");
              }}
              className={`px-3 py-1 text-xs transition-colors ${
                mode === "manual"
                  ? "bg-caramel text-sand"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              Editor manual
            </button>
          </div>
        </div>

        <p className="text-xs text-ink/60">
          Usá el modo manual para talles o medidas que no están en las listas
          predefinidas.
        </p>
      </div>

      {warning && <p className="text-xs text-rose">{warning}</p>}

      {mode === "manual" ? (
        <VariantManager variants={variants} onChange={onChange} />
      ) : (
        <div className="flex flex-col gap-6">
          <SizeTypeSelector
            sizeType={sizeType}
            selectedSizes={selectedSizes}
            onSizeTypeChange={handleSizeTypeChange}
            onSelectedSizesChange={handleSizesChange}
          />

          <ColorGridPicker
            selectedColors={selectedColors}
            onChange={handleColorsChange}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Combinaciones ({rows.length})
            </span>

            <div className="overflow-x-auto rounded-sm border border-ink/10">
              <table className="w-full min-w-96 text-sm">
                <thead className="bg-sand/60 text-left text-xs text-ink/60">
                  <tr>
                    <th className="px-3 py-2 font-medium">Talle</th>
                    <th className="px-3 py-2 font-medium">Color</th>
                    <th className="w-32 px-3 py-2 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.size ?? "-"}|${row.color ?? "-"}`}
                      className="border-t border-ink/10"
                    >
                      <td className="px-3 py-2">{row.size ?? "—"}</td>
                      <td className="px-3 py-2">{row.color ?? "—"}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={row.stock ?? 0}
                          onChange={(event) =>
                            handleStockChange(index, event.target.value)
                          }
                          aria-label={`Stock de ${row.size ?? "único"} ${
                            row.color ?? ""
                          }`}
                          className="w-24 rounded-sm border border-ink/20 bg-card px-2 py-1 font-body text-sm focus:border-caramel focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
