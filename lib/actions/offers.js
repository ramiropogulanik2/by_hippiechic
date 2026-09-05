"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BADGE_OPTIONS } from "@/lib/productBadge";

// Gestión de las ofertas y etiquetas del cambio #12, aparte del form de
// producto. El form completo sirve para cargar una prenda; esta pantalla
// sirve para lo otro: repasar de un saque qué está en oferta, cambiar un
// precio anterior y sacar la oferta cuando se terminó la liquidación, sin
// abrir producto por producto.
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

export async function saveProductOffer(productId, values) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  // El precio actual sale de la base, no del formulario: es el número contra
  // el que hay que validar la oferta y no tiene por qué viajar por el cliente.
  const { data: product } = await supabase
    .from("products")
    .select("id, price, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "No encontramos el producto." };
  }

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

    if (parsed <= Number(product.price)) {
      return {
        success: false,
        error:
          "El precio anterior tiene que ser mayor que el precio actual, si no no es una oferta.",
      };
    }

    compareAtPrice = parsed;
  }

  const badge = String(values?.badge ?? "").trim() || null;

  if (badge && !BADGE_VALUES.includes(badge)) {
    return { success: false, error: "Esa etiqueta no existe." };
  }

  if (badge === "oportunidad" && compareAtPrice === null) {
    return {
      success: false,
      error: "Para la etiqueta Oportunidad cargá también el precio anterior.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
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

// Deja el producto como si nunca hubiera estado en oferta: sin precio
// anterior y sin etiqueta. El precio vigente NO se toca — subirlo de nuevo es
// una decisión aparte, y hacerlo automático acá sería un cambio de precio
// silencioso.
export async function clearProductOffer(productId) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update({
      compare_at_price: null,
      badge: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    console.error("Error quitando la oferta:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateOfferPaths(product?.slug);

  return { success: true };
}
