"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductImagesManager from "@/components/admin/ProductImagesManager";
import VariantMatrixBuilder from "@/components/admin/VariantMatrixBuilder";

const inputClass =
  "w-full rounded-sm border border-ink/20 bg-card px-3 py-2 font-body text-sm text-ink placeholder:text-ink/60 focus:border-caramel focus:outline-none";

export default function ProductForm({
  product = null,
  categories = [],
  action,
}) {
  const router = useRouter();

  const isEditing = Boolean(product);

  const [variants, setVariants] = useState(product?.variants ?? []);
  const [images, setImages] = useState({
    keptImageIds: (product?.images ?? []).map((image) => image.id),
    deletedImageIds: [],
    newFiles: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    formData.set("variants_json", JSON.stringify(variants));

    if (isEditing) {
      formData.set(
        "existing_image_ids_json",
        JSON.stringify(images.keptImageIds)
      );
      formData.set(
        "images_to_delete_json",
        JSON.stringify(images.deletedImageIds)
      );
    }

    // El input file del manager no tiene name, así que los archivos se
    // agregan acá desde el estado: son exactamente los que quedaron visibles.
    for (const file of images.newFiles) {
      formData.append("images", file);
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await action(formData);

    if (!result?.success) {
      setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name ?? ""}
          placeholder="Ej: Blazer camel"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          placeholder="Detalles de la prenda, talles, materiales..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium">
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price ?? ""}
            placeholder="45000"
            className={inputClass}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="category_id" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Elegí una categoría
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={product?.is_published ?? true}
          className="h-4 w-4 accent-caramel"
        />
        Publicado
      </label>

      <ProductImagesManager
        existingImages={product?.images ?? []}
        onChange={setImages}
      />

      <VariantMatrixBuilder variants={variants} onChange={setVariants} />

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
            : "Crear producto"}
      </button>
    </form>
  );
}
