import { COLOR_PALETTE, findPaletteColor } from "@/lib/colorPalette";
import { SIZE_PRESETS } from "@/lib/sizePresets";

// En la base size y color son texto libre y nullable: "" y null significan
// lo mismo (sin talle / sin color).
function normalize(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function sameValue(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.toLowerCase() === b.toLowerCase();
}

function canonicalSize(value, sizeType) {
  return (
    SIZE_PRESETS[sizeType]?.find(
      (preset) => preset.toLowerCase() === value.toLowerCase()
    ) ?? null
  );
}

export function detectMatrixMode(existingVariants = []) {
  const variants = Array.isArray(existingVariants) ? existingVariants : [];

  // Producto nuevo: modo guiado, sin nada preseleccionado.
  if (variants.length === 0) {
    return {
      compatible: true,
      sizeType: "unico",
      selectedSizes: [],
      selectedColors: [],
    };
  }

  const sizes = variants.map((variant) => normalize(variant.size));
  const colors = variants.map((variant) => normalize(variant.color));

  const sizesPresent = sizes.filter(Boolean);
  const colorsPresent = colors.filter(Boolean);

  // Mezclar filas con talle y filas sin talle no se puede representar como
  // matriz: la grilla es siempre un producto cartesiano completo.
  if (sizesPresent.length > 0 && sizesPresent.length !== sizes.length) {
    return { compatible: false };
  }

  if (colorsPresent.length > 0 && colorsPresent.length !== colors.length) {
    return { compatible: false };
  }

  let sizeType = "unico";
  let selectedSizes = [];

  if (sizesPresent.length > 0) {
    const unique = [...new Set(sizesPresent)];

    const matchedType = Object.keys(SIZE_PRESETS).find((type) =>
      unique.every((size) => canonicalSize(size, type) !== null)
    );

    if (!matchedType) return { compatible: false };

    sizeType = matchedType;

    // Se ordenan según el preset, no según cómo salieron de la base.
    const canonical = unique.map((size) => canonicalSize(size, matchedType));
    selectedSizes = SIZE_PRESETS[matchedType].filter((size) =>
      canonical.includes(size)
    );
  }

  let selectedColors = [];

  if (colorsPresent.length > 0) {
    const canonical = [];

    for (const color of new Set(colorsPresent)) {
      const match = findPaletteColor(color);

      if (!match) return { compatible: false };

      canonical.push(match.name);
    }

    selectedColors = COLOR_PALETTE.filter((color) =>
      canonical.includes(color.name)
    ).map((color) => color.name);
  }

  return { compatible: true, sizeType, selectedSizes, selectedColors };
}

export function generateVariantMatrix(
  selectedSizes = [],
  selectedColors = [],
  previousVariants = []
) {
  const previous = Array.isArray(previousVariants) ? previousVariants : [];

  function buildRow(size, color) {
    // Si esta combinación ya existía, se conserva su id y su stock: cambiar
    // la selección no puede hacer perder inventario ya cargado.
    const match = previous.find(
      (variant) =>
        sameValue(normalize(variant.size), size) &&
        sameValue(normalize(variant.color), color)
    );

    const row = {
      size,
      color,
      stock: match ? Number(match.stock) || 0 : 0,
    };

    if (match?.id) row.id = match.id;

    return row;
  }

  // Sin selección en un eje, ese eje aporta una sola fila con null. Así los
  // cuatro casos (nada / solo talles / solo colores / ambos) salen del mismo
  // doble bucle.
  const sizes = selectedSizes.length > 0 ? selectedSizes : [null];
  const colors = selectedColors.length > 0 ? selectedColors : [null];

  const rows = [];

  for (const size of sizes) {
    for (const color of colors) {
      rows.push(buildRow(size, color));
    }
  }

  return rows;
}
