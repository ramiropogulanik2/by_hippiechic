"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "catalog-images";
const GENERIC_ERROR = "Algo salió mal. Probá de nuevo.";

// Las fotos originales del hero viven en /public (URLs relativas tipo
// "/hero-1.jpg"), no en Storage: no hay nada que borrar ahí, así que se
// ignoran en silencio cuando no matchean el patrón de URL pública del bucket.
function extractStoragePath(imageUrl) {
  const marker = `/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return imageUrl.slice(index + marker.length);
}

function readImageFile(formData) {
  const file = formData.get("image");

  if (!file || typeof file === "string" || file.size === 0) return null;

  return file;
}

export async function addHeroImage(formData) {
  const file = readImageFile(formData);

  if (!file) {
    return { success: false, error: "Elegí una imagen." };
  }

  const supabase = createAdminClient();
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `hero/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("Error subiendo imagen de hero:", uploadError.message);
    return { success: false, error: "No pudimos subir la imagen." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: last } = await supabase
    .from("hero_images")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("hero_images").insert({
    image_url: publicUrl,
    display_order: (last?.display_order ?? 0) + 1,
  });

  if (error) {
    console.error("Error guardando foto de hero:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");

  return { success: true };
}

export async function removeHeroImage(id) {
  const supabase = createAdminClient();

  const { data: image } = await supabase
    .from("hero_images")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const storagePath = image ? extractStoragePath(image.image_url) : null;

  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase.from("hero_images").delete().eq("id", id);

  if (error) {
    console.error("Error eliminando foto de hero:", error.message);
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");

  return { success: true };
}

export async function moveHeroImage(id, direction) {
  const supabase = createAdminClient();
  const isUp = direction === "up";

  const { data: current } = await supabase
    .from("hero_images")
    .select("id, display_order")
    .eq("id", id)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "No encontramos la foto." };
  }

  let query = supabase.from("hero_images").select("id, display_order");

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
      .from("hero_images")
      .update({ display_order: neighbor.display_order })
      .eq("id", current.id),
    supabase
      .from("hero_images")
      .update({ display_order: current.display_order })
      .eq("id", neighbor.id),
  ]);

  if (first.error || second.error) {
    console.error(
      "Error reordenando fotos de hero:",
      first.error?.message ?? second.error?.message
    );
    return { success: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");

  return { success: true };
}
