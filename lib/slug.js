// NFD separa cada letra acentuada en letra + marca diacrítica, y \p{Diacritic}
// borra esas marcas: "ñ" -> "n", "á" -> "a", sin depender de librerías.
// Hay que sacarlas ANTES del filtro [^a-z0-9], porque si no cada acento se
// convertiría en un guión ("cámara" -> "ca-mara").
export function slugify(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
