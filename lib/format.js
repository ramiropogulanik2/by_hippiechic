const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(number) {
  return priceFormatter.format(number);
}

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatFullDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return fullDateFormatter.format(date);
}

// Fecha relativa a mano: para "hace 3 días" no vale la pena sumar una
// dependencia al bundle.
export function formatRelativeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;

  return fullDateFormatter.format(date).split(",")[0];
}
