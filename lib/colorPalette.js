// Compartida entre el admin (grilla de selección) y el catálogo público
// (swatch al lado del nombre en las pills de color).
export const COLOR_PALETTE = [
  { name: "Negro", hex: "#1A1815" },
  { name: "Blanco", hex: "#FDFBF7" },
  { name: "Beige", hex: "#E8DCC8" },
  { name: "Camel", hex: "#B08D57" },
  { name: "Terracota", hex: "#C56A48" },
  { name: "Mostaza", hex: "#C4952B" },
  { name: "Rosa viejo", hex: "#C98F82" },
  { name: "Bordo", hex: "#7A2E2E" },
  { name: "Verde oliva", hex: "#6B7353" },
  { name: "Denim", hex: "#4A5D7E" },
  { name: "Gris", hex: "#8C877E" },
];

// Los colores en la base son texto libre, así que el match es case-insensitive
// y tolera espacios de más. Devuelve null si no está en la paleta.
export function findPaletteColor(name) {
  const needle = String(name ?? "")
    .trim()
    .toLowerCase();

  if (!needle) return null;

  return (
    COLOR_PALETTE.find((color) => color.name.toLowerCase() === needle) ?? null
  );
}
