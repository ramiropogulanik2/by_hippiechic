// Cambio #12 del handoff: etiqueta sobre la foto de la tarjeta.
//
// Los dos valores posibles están además validados en la base
// (products_badge_check), así que esta lista y la constraint tienen que
// moverse juntas si algún día se agrega una etiqueta nueva.
export const BADGES = {
  nuevo: {
    label: "Nuevo",
    // Espresso sobre papel: es un dato, no una oferta.
    className: "bg-ink text-sand",
  },
  oportunidad: {
    label: "Oportunidad",
    // Terracota: es el único lugar del catálogo donde el acento se usa como
    // fondo pleno, justamente para que la oferta destaque entre las demás.
    className: "bg-caramel text-white",
  },
};

export const BADGE_OPTIONS = Object.entries(BADGES).map(([value, badge]) => ({
  value,
  label: badge.label,
}));

// Porcentaje de descuento redondeado, para mostrarlo en el admin. Devuelve
// null cuando no hay oferta cargada o los números no cierran.
export function discountPercent(price, compareAtPrice) {
  const current = Number(price);
  const previous = Number(compareAtPrice);

  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous <= current) return null;

  return Math.round(((previous - current) / previous) * 100);
}
