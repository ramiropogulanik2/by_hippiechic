"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/40 focus:border-caramel focus:outline-none";

export default function CategoryForm({ category = null, action }) {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(category);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    // La action ya viene con el id bindeado cuando es edición, así que acá
    // siempre se la llama igual: con el FormData y nada más.
    const result = await action(new FormData(event.currentTarget));

    if (!result?.success) {
      setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/categorias");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name ?? ""}
          placeholder="Ej: Carteras"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_visible"
          defaultChecked={category?.is_visible ?? true}
          className="h-4 w-4 accent-caramel"
        />
        Visible en el catálogo
      </label>

      <ImageUploadField
        name="image"
        currentImageUrl={category?.image_url ?? null}
        label="Imagen de portada"
      />

      {errorMessage && <p className="text-sm text-rose">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity sm:w-auto sm:self-start ${
          isSubmitting ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
        }`}
      >
        {isSubmitting
          ? "Guardando..."
          : isEditing
            ? "Guardar cambios"
            : "Crear categoría"}
      </button>
    </form>
  );
}
