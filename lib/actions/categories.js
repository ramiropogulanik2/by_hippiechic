"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "catalog-images";
const GENERIC_ERROR = "Algo salió mal. Probá de nuevo.";

// Busca un slug libre agregando -2, -3, etc. excludeId sirve para que al
// editar una categoría no choque consigo misma.
async function buildUniqueSlug(supabase, baseSlug, excludeId = null) {
  const base = baseSlug || "categoria";
  let candidate = base;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("categories").select("id").eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    if (!data) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function uploadImage(supabase, file, slug) {
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `categories/${slug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("Error subiendo imagen:", error.message);
    return { error: "No pudimos subir la imagen." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl };
}

function readImageFile(formData) {
  const file = formData.get("image");

  // Un input file vacío llega igual como File, pero con size 0.
  if (!file || typeof file === "string" || file.size === 0) return null;

  return file;
}

export async function createCategory(formData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  const supabase = createAdminClient();
  const slug = await buildUniqueSlug(supabase, slugify(name));

  let imageUrl = null;
  const file = readImageFile(formData);

  if (file) {
    const result = await uploadImage(supabase, file, slug);
    if (result.error) return { success: false, error: result.error };
    imageUrl = result.publicUrl;
  }

  const { data: last } = await supabase
    .from("categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    image_url: imageUrl,
    is_visible: formData.get("is_visible") === "on",
    display_order: (last?.display_order ?? 0) + 1,
  });

  if (error) {
    console.error("Error creando categoría:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");

  return { success: true };
}

export async function updateCategory(id, formData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { success: false, error: "El nombre es obligatorio." };
  }

  const supabase = createAdminClient();
  const slug = await buildUniqueSlug(supabase, slugify(name), id);

  const updates = {
    name,
    slug,
    is_visible: formData.get("is_visible") === "on",
  };

  const file = readImageFile(formData);

  if (file) {
    const result = await uploadImage(supabase, file, slug);
    if (result.error) return { success: false, error: result.error };
    updates.image_url = result.publicUrl;
  }

  const { error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error actualizando categoría:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");

  return { success: true };
}

export async function deleteCategory(id) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    // 23503 = foreign_key_violation: hay products apuntando a esta categoría
    // (el schema la declara con on delete restrict).
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "No se puede eliminar: hay productos en esta categoría. Podés ocultarla en su lugar.",
      };
    }

    console.error("Error eliminando categoría:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");

  return { success: true };
}

export async function toggleCategoryVisibility(id, currentValue) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("categories")
    .update({ is_visible: !currentValue })
    .eq("id", id);

  if (error) {
    console.error("Error cambiando visibilidad:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");

  return { success: true };
}

export async function moveCategory(id, direction) {
  const supabase = createAdminClient();
  const isUp = direction === "up";

  const { data: current } = await supabase
    .from("categories")
    .select("id, display_order")
    .eq("id", id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No encontramos la categoría." };
  }

  let query = supabase.from("categories").select("id, display_order");

  query = isUp
    ? query
        .lt("display_order", current.display_order)
        .order("display_order", { ascending: false })
    : query
        .gt("display_order", current.display_order)
        .order("display_order", { ascending: true });

  const { data: neighbor } = await query.limit(1).maybeSingle();

  if (!neighbor) {
    // Ya está en el extremo: no es un error, simplemente no hay nada que mover.
    return { success: true };
  }

  const [first, second] = await Promise.all([
    supabase
      .from("categories")
      .update({ display_order: neighbor.display_order })
      .eq("id", current.id),
    supabase
      .from("categories")
      .update({ display_order: current.display_order })
      .eq("id", neighbor.id),
  ]);

  if (first.error || second.error) {
    console.error(
      "Error reordenando categorías:",
      first.error?.message ?? second.error?.message
    );
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");

  return { success: true };
}
