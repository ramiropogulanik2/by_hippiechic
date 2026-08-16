"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_STATUSES = ["pendiente", "confirmado", "rechazado"];

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

// Devuelve cuánto hay que mover el stock según la transición:
//   -1 -> descontar (la orden pasa a estar confirmada)
//   +1 -> devolver  (se revierte una confirmación que ya había descontado)
//    0 -> no tocar  (la orden nunca descontó nada, ej: pendiente -> rechazado)
function stockDirection(currentStatus, newStatus) {
  if (currentStatus === "pendiente" && newStatus === "confirmado") return -1;

  if (
    currentStatus === "confirmado" &&
    (newStatus === "rechazado" || newStatus === "pendiente")
  ) {
    return 1;
  }

  return 0;
}

export async function updateOrderStatus(orderId, newStatus) {
  // createOrder (arriba) queda sin este chequeo a propósito: es el checkout
  // público de la clienta, no hay auth de clientas en este proyecto. Esta sí
  // es admin-only (cambia estado y mueve stock), por eso lleva la verificación.
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  if (!ORDER_STATUSES.includes(newStatus)) {
    return { success: false, error: "Estado inválido." };
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, order_items(product_variant_id, quantity)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { success: false, error: "Pedido no encontrado" };
  }

  if (order.status === newStatus) {
    return { success: true };
  }

  const direction = stockDirection(order.status, newStatus);

  if (direction !== 0) {
    // Se agrupa por variante antes de tocar la base: si un mismo
    // product_variant_id apareciera en dos líneas, hay que mover el total
    // de una sola vez y no pisar un update con el otro.
    const quantityByVariant = new Map();

    for (const item of order.order_items ?? []) {
      const previous = quantityByVariant.get(item.product_variant_id) ?? 0;
      quantityByVariant.set(item.product_variant_id, previous + item.quantity);
    }

    const variantIds = [...quantityByVariant.keys()];

    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, stock")
        .in("id", variantIds);

      if (variantsError) {
        console.error(
          "Error leyendo el stock de las variantes:",
          variantsError.message
        );
      }

      for (const variant of variants ?? []) {
        const quantity = quantityByVariant.get(variant.id) ?? 0;

        // Al descontar nunca se baja de 0: si se vendió más de lo que había
        // cargado, el pedido igual se confirma y el stock queda en 0. Es una
        // decisión de la dueña, no un error que deba frenar la operación.
        const nextStock =
          direction < 0
            ? Math.max(variant.stock - quantity, 0)
            : variant.stock + quantity;

        const { error } = await supabase
          .from("product_variants")
          .update({ stock: nextStock })
          .eq("id", variant.id);

        // Best-effort: un fallo puntual se loguea pero no aborta el resto,
        // así el estado del pedido igual queda consistente con lo decidido.
        if (error) {
          console.error(
            `No se pudo ajustar el stock de la variante ${variant.id}:`,
            error.message
          );
        }
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Error actualizando el estado del pedido:", error.message);
    return { success: false, error: "No pudimos actualizar el pedido." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  // El badge del nav y el stock del catálogo público dependen de esto.
  revalidatePath("/admin", "layout");
  revalidatePath("/");

  return { success: true };
}
