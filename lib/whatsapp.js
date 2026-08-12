import { formatPrice } from "@/lib/format";

export function buildOrderMessage(items, total, customerName) {
  const lines = items.map((item) => {
    const parts = [`${item.quantity}x ${item.productName}`];

    if (item.size) parts.push(`Talle: ${item.size}`);
    if (item.color) parts.push(`Color: ${item.color}`);

    return `${parts.join(" - ")} — ${formatPrice(item.unitPrice)} c/u`;
  });

  return [
    `¡Hola! Soy ${customerName} y quiero hacer este pedido:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
  ].join("\n");
}

export function buildWhatsAppUrl(message) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  // Sin número configurado devolvemos null en vez de armar una URL rota
  // tipo wa.me/undefined, que abriría una página de error de WhatsApp.
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
