"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function createOrder(payload) {
  const { customerName, customerPhone, items } = payload ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "Tu carrito está vacío." };
  }

  const name = typeof customerName === "string" ? customerName.trim() : "";

  if (!name) {
    return { success: false, error: "Ingresá tu nombre para continuar." };
  }

  const phone =
    typeof customerPhone === "string" && customerPhone.trim()
      ? customerPhone.trim()
      : null;

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      customer_phone: phone,
      status: "pendiente",
      total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Error creando la orden:", orderError?.message);
    return {
      success: false,
      error: "No pudimos guardar tu pedido. Probá de nuevo en un momento.",
    };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
  );

  if (itemsError) {
    console.error("Error creando los items de la orden:", itemsError.message);

    // Rollback manual: sin esto queda una orden sin líneas, que después
    // aparece en el admin como un pedido vacío imposible de interpretar.
    const { error: rollbackError } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    if (rollbackError) {
      console.error(
        `Rollback fallido: quedó huérfana la orden ${order.id}:`,
        rollbackError.message
      );
    }

    return {
      success: false,
      error: "No pudimos guardar el detalle de tu pedido. Probá de nuevo.",
    };
  }

  return { success: true, orderId: order.id };
}
