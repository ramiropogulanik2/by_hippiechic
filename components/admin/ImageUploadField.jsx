"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

export default function ImageUploadField({
  name = "image",
  currentImageUrl = null,
  label = "Imagen",
}) {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Los object URLs quedan retenidos en memoria hasta que se revocan.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  // El archivo recién elegido gana sobre la imagen ya guardada.
  const shownUrl = previewUrl ?? currentImageUrl;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div className="relative flex aspect-square w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-ink/10 bg-sand">
          {shownUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={shownUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-ink/40">
              <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-[10px] text-ink/70">Sin imagen</span>
            </div>
          )}
        </div>

        <input
          id={name}
          type="file"
          name={name}
          accept="image/*"
          onChange={handleChange}
          className="block w-full font-body text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-body file:text-sm file:text-sand hover:file:opacity-90"
        />
      </div>
    </div>
  );
}
