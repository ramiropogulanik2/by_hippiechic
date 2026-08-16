"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { addHeroImage } from "@/lib/actions/heroImages";

export default function HeroUploadForm() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cambiar esta key fuerza el remount de ImageUploadField después de subir,
  // que es la única forma de limpiar su preview interna (el input file no
  // dispara onChange solo porque el form se resetea).
  const [fieldKey, setFieldKey] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const result = await addHeroImage(new FormData(form));

    if (!result?.success) {
      setErrorMessage(result?.error ?? "Algo salió mal. Probá de nuevo.");
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setFieldKey((key) => key + 1);
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-6 rounded-sm border border-ink/10 bg-card p-4"
    >
      <ImageUploadField key={fieldKey} name="image" label="Nueva foto" />

      {errorMessage && <p className="text-sm text-rose">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-sand transition-opacity sm:w-auto sm:self-start ${
          isSubmitting ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
        }`}
      >
        {isSubmitting ? "Subiendo..." : "+ Agregar foto"}
      </button>
    </form>
  );
}
