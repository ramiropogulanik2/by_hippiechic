"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BADGE_OPTIONS } from "@/lib/productBadge";

// Gestión de las ofertas y etiquetas del cambio #12, aparte del form de
// producto. El form completo sirve para cargar una prenda; esta pantalla
// sirve para lo otro: bajar precios, repasar de un saque qué está rebajado
// hoy y levantar la liquidación cuando termina, sin abrir producto por
// producto.
//
// El modelo mental es el de la dueña: "esto cuesta 96.000 y lo bajo a
// 90.000". Ella carga el precio NUEVO; el que estaba pasa solo a
// compare_at_price y es el que se dibuja tachado en la tarjeta.
//
// products.price sigue siendo el precio que paga la clienta y el que va al
// carrito. Los pedidos viejos no se ven afectados: order_items.unit_price
// guarda el precio del momento de la compra, no el actual.
const GENERIC_ERROR = "Algo salió mal. Probá de nuevo.";
const BADGE_VALUES = BADGE_OPTIONS.map((option) => option.value);

function revalidateOfferPaths(slug) {
  revalidatePath("/admin/oportunidades");
  revalidatePath("/admin/productos");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/producto/${slug}`);
  }
}

function readBadge(value) {
  const badge = String(value ?? "").trim() || null;

  if (badge && !BADGE_VALUES.includes(badge)) {
    return { error: "Esa etiqueta no existe." };
  }

  return { badge };
}

function readPrice(value, label) {
  const raw = String(value ?? "").trim();

  if (!raw) return { error: `Cargá el ${label}.` };

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { error: `El ${label} tiene que ser un número válido.` };
  }

  return { price: parsed };
}

// Poner un producto en oferta: se carga el precio NUEVO y el que tenía queda
// guardado solo como precio anterior.
export async function startProductOffer(productId, values) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  // El precio de partida sale de la base, no del formulario: es lo que la
  // prenda cuesta de verdad ahora mismo y no tiene por qué viajar por el
  // cliente, donde podría venir desactualizado.
  const { data: product } = await supabase
    .from("products")
    .select("id, price, compare_at_price, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "No encontramos el producto." };
  }

  const { price: salePrice, error: priceError } = readPrice(
    values?.salePrice,
    "precio de oferta"
  );

  if (priceError) return { success: false, error: priceError };

  const currentPrice = Number(product.price);

  if (salePrice >= currentPrice) {
    return {
      success: false,
      error: `El precio de oferta tiene que ser menor que el actual (${currentPrice}).`,
    };
  }

  const { badge, error: badgeError } = readBadge(values?.badge);

  if (badgeError) return { success: false, error: badgeError };

  // Si el producto ya venía con un precio anterior cargado se respeta ese: es
  // el precio de lista real, y pisarlo con el de la rebaja anterior iría
  // encogiendo el descuento en cada baja sucesiva.
  const previousPrice =
    product.compare_at_price != null &&
    Number(product.compare_at_price) > currentPrice
      ? Number(product.compare_at_price)
      : currentPrice;

  const { error } = await supabase
    .from("products")
    .update({
      price: salePrice,
      compare_at_price: previousPrice,
      badge,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    console.error("Error poniendo el producto en oferta:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateOfferPaths(product.slug);

  return { success: true };
}

// Editar una oferta ya activa: se pueden tocar los dos precios y la etiqueta.
export async function saveProductOffer(productId, values) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "No encontramos el producto." };
  }

  const { price, error: priceError } = readPrice(values?.price, "precio");

  if (priceError) return { success: false, error: priceError };

  // El precio anterior sí puede quedar vacío: es sacar el tachado y dejar el
  // precio nuevo como precio normal.
  const rawCompare = String(values?.compareAtPrice ?? "").trim();
  let compareAtPrice = null;

  if (rawCompare) {
    const parsed = Number(rawCompare);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return {
        success: false,
        error: "El precio anterior tiene que ser un número válido.",
      };
    }

    if (parsed <= price) {
      return {
        success: false,
        error:
          "El precio anterior tiene que ser mayor que el nuevo, si no no es una oferta.",
      };
    }

    compareAtPrice = parsed;
  }

  const { badge, error: badgeError } = readBadge(values?.badge);

  if (badgeError) return { success: false, error: badgeError };

  if (badge === "oportunidad" && compareAtPrice === null) {
    return {
      success: false,
      error: "Para la etiqueta Oportunidad cargá también el precio anterior.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      price,
      compare_at_price: compareAtPrice,
      badge,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    console.error("Error guardando la oferta:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateOfferPaths(product.slug);

  return { success: true };
}

// Terminar la oferta: el precio vuelve al que estaba antes de la rebaja y se
// van el tachado y la etiqueta. Si el producto solo tenía etiqueta (un
// "Nuevo" sin rebaja), el precio no se toca.
export async function endProductOffer(productId) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, price, compare_at_price, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "No encontramos el producto." };
  }

  const restoredPrice =
    product.compare_at_price != null
      ? Number(product.compare_at_price)
      : Number(product.price);

  const { error } = await supabase
    .from("products")
    .update({
      price: restoredPrice,
      compare_at_price: null,
      badge: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    console.error("Error terminando la oferta:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateOfferPaths(product.slug);

  return { success: true };
}
