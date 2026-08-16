"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";
import { requireAdminSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "catalog-images";
const GENERIC_ERROR = "Algo salió mal. Probá de nuevo.";
const FK_VIOLATION = "23503";

async function buildUniqueSlug(supabase, baseSlug, excludeId = null) {
  const base = baseSlug || "producto";
  let candidate = base;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("products").select("id").eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    if (!data) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

// Las imágenes seed apuntan a placehold.co, que no vive en nuestro bucket.
// Para esas devolvemos null y salteamos el borrado en Storage.
function storagePathFromPublicUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = String(url ?? "").indexOf(marker);

  if (index === -1) return null;

  return url.slice(index + marker.length);
}

async function uploadImage(supabase, file, slug, index) {
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `products/${slug}-${index}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("Error subiendo imagen de producto:", error.message);
    return { error: "No pudimos subir una de las imágenes." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl };
}

async function removeFromStorage(supabase, urls) {
  const paths = urls.map(storagePathFromPublicUrl).filter(Boolean);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);

  if (error) {
    // No es fatal: quedan archivos huérfanos, pero la operación de datos ya salió bien.
    console.error("Error borrando imágenes de Storage:", error.message);
  }
}

function parseJsonArray(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeVariant(variant) {
  const size = String(variant.size ?? "").trim();
  const color = String(variant.color ?? "").trim();

  return {
    size: size || null,
    color: color || null,
    stock: Number.isFinite(Number(variant.stock)) ? Number(variant.stock) : 0,
  };
}

function readBasicFields(formData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const price = Number(formData.get("price"));

  if (!name) return { error: "El nombre es obligatorio." };
  if (!categoryId) return { error: "Elegí una categoría." };
  if (!Number.isFinite(price) || price < 0) {
    return { error: "El precio tiene que ser un número válido." };
  }

  return {
    fields: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      price,
      category_id: categoryId,
      is_published: formData.get("is_published") === "on",
    },
  };
}

function readNewImages(formData) {
  return formData
    .getAll("images")
    .filter((file) => file && typeof file !== "string" && file.size > 0);
}

function revalidateProductPaths() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function createProduct(formData) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const { fields, error: fieldsError } = readBasicFields(formData);

  if (fieldsError) return { success: false, error: fieldsError };

  const supabase = createAdminClient();
  const slug = await buildUniqueSlug(supabase, slugify(fields.name));

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({ ...fields, slug })
    .select("id")
    .single();

  if (insertError || !product) {
    console.error("Error creando producto:", insertError?.message);
    return { success: false, error: GENERIC_ERROR };
  }

  // A partir de acá el producto ya existe: si algo falla, lo borramos para no
  // dejar un producto a medio crear (mismo criterio que el rollback de orders).
  async function rollback(message) {
    await supabase.from("products").delete().eq("id", product.id);
    return { success: false, error: message };
  }

  const files = readNewImages(formData);
  const imageRows = [];

  for (const [index, file] of files.entries()) {
    const result = await uploadImage(supabase, file, slug, index);

    if (result.error) {
      await removeFromStorage(
        supabase,
        imageRows.map((row) => row.image_url)
      );
      return rollback(result.error);
    }

    imageRows.push({
      product_id: product.id,
      image_url: result.publicUrl,
      display_order: index,
    });
  }

  if (imageRows.length > 0) {
    const { error } = await supabase.from("product_images").insert(imageRows);

    if (error) {
      console.error("Error guardando imágenes:", error.message);
      await removeFromStorage(
        supabase,
        imageRows.map((row) => row.image_url)
      );
      return rollback(GENERIC_ERROR);
    }
  }

  const incoming = parseJsonArray(formData.get("variants_json"));

  // Sin variantes declaradas el producto igual necesita una fila: el carrito
  // referencia siempre un product_variant_id.
  const variantRows =
    incoming.length === 0
      ? [{ size: null, color: null, stock: 0 }]
      : incoming.map(normalizeVariant);

  const { error: variantsError } = await supabase
    .from("product_variants")
    .insert(variantRows.map((row) => ({ ...row, product_id: product.id })));

  if (variantsError) {
    console.error("Error guardando variantes:", variantsError.message);
    await removeFromStorage(
      supabase,
      imageRows.map((row) => row.image_url)
    );
    return rollback(GENERIC_ERROR);
  }

  revalidateProductPaths();

  return { success: true };
}

export async function updateProduct(id, formData) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const { fields, error: fieldsError } = readBasicFields(formData);

  if (fieldsError) return { success: false, error: fieldsError };

  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No encontramos el producto." };
  }

  // Solo se regenera el slug si cambió el nombre: así no se rompen los links
  // que ya estén circulando por WhatsApp.
  const slug =
    current.name === fields.name
      ? current.slug
      : await buildUniqueSlug(supabase, slugify(fields.name), id);

  const { error: updateError } = await supabase
    .from("products")
    .update({ ...fields, slug, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("Error actualizando producto:", updateError.message);
    return { success: false, error: GENERIC_ERROR };
  }

  // ---------- Imágenes ----------
  const deletedIds = parseJsonArray(formData.get("images_to_delete_json"));

  if (deletedIds.length > 0) {
    const { data: toDelete } = await supabase
      .from("product_images")
      .select("image_url")
      .in("id", deletedIds);

    const { error } = await supabase
      .from("product_images")
      .delete()
      .in("id", deletedIds);

    if (error) {
      console.error("Error borrando imágenes:", error.message);
      return { success: false, error: GENERIC_ERROR };
    }

    // Recién después de que la fila se fue, se limpia el archivo.
    await removeFromStorage(
      supabase,
      (toDelete ?? []).map((row) => row.image_url)
    );
  }

  const keptIds = parseJsonArray(formData.get("existing_image_ids_json"));

  for (const [index, imageId] of keptIds.entries()) {
    await supabase
      .from("product_images")
      .update({ display_order: index })
      .eq("id", imageId);
  }

  const files = readNewImages(formData);

  if (files.length > 0) {
    const newRows = [];

    for (const [index, file] of files.entries()) {
      const position = keptIds.length + index;
      const result = await uploadImage(supabase, file, slug, position);

      if (result.error) {
        await removeFromStorage(
          supabase,
          newRows.map((row) => row.image_url)
        );
        return { success: false, error: result.error };
      }

      newRows.push({
        product_id: id,
        image_url: result.publicUrl,
        display_order: position,
      });
    }

    const { error } = await supabase.from("product_images").insert(newRows);

    if (error) {
      console.error("Error guardando imágenes nuevas:", error.message);
      await removeFromStorage(
        supabase,
        newRows.map((row) => row.image_url)
      );
      return { success: false, error: GENERIC_ERROR };
    }
  }

  // ---------- Variantes ----------
  const incoming = parseJsonArray(formData.get("variants_json"));

  const { data: existingVariants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", id);

  const existingIds = (existingVariants ?? []).map((variant) => variant.id);
  const incomingIds = incoming
    .map((variant) => variant.id)
    .filter((variantId) => Boolean(variantId));

  for (const variant of incoming) {
    const row = normalizeVariant(variant);

    if (variant.id) {
      const { error } = await supabase
        .from("product_variants")
        .update(row)
        .eq("id", variant.id);

      if (error) {
        console.error("Error actualizando variante:", error.message);
        return { success: false, error: GENERIC_ERROR };
      }
    } else {
      const { error } = await supabase
        .from("product_variants")
        .insert({ ...row, product_id: id });

      if (error) {
        console.error("Error creando variante:", error.message);
        return { success: false, error: GENERIC_ERROR };
      }
    }
  }

  const removedIds = existingIds.filter(
    (variantId) => !incomingIds.includes(variantId)
  );

  // Una por una a propósito: un DELETE en lote falla entero si UNA sola
  // variante está referenciada por un pedido, y perderíamos el resto.
  for (const variantId of removedIds) {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (!error) continue;

    if (error.code === FK_VIOLATION) {
      // La variante ya vive dentro de un pedido histórico: borrarla rompería
      // ese order_item. La dejamos en stock 0 para que deje de ofrecerse.
      const { error: softDeleteError } = await supabase
        .from("product_variants")
        .update({ stock: 0 })
        .eq("id", variantId);

      if (softDeleteError) {
        console.error(
          "Error dejando la variante en stock 0:",
          softDeleteError.message
        );
        return { success: false, error: GENERIC_ERROR };
      }

      continue;
    }

    console.error("Error borrando variante:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateProductPaths();
  revalidatePath(`/producto/${slug}`);

  return { success: true };
}

export async function deleteProduct(id) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  // Se leen antes porque product_images cae por cascade junto con el producto.
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === FK_VIOLATION) {
      return {
        success: false,
        error:
          "No se puede eliminar: este producto tiene pedidos asociados. Podés despublicarlo en su lugar.",
      };
    }

    console.error("Error eliminando producto:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  // Solo si el borrado salió bien: si falla por FK, las fotos tienen que seguir ahí.
  await removeFromStorage(
    supabase,
    (images ?? []).map((row) => row.image_url)
  );

  revalidateProductPaths();

  return { success: true };
}

export async function toggleProductPublished(id, currentValue) {
  const user = await requireAdminSession();
  if (!user) return { success: false, error: "No autorizado" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_published: !currentValue })
    .eq("id", id);

  if (error) {
    console.error("Error cambiando publicación:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidateProductPaths();

  return { success: true };
}
