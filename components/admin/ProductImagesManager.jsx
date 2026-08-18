"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Trash2 } from "lucide-react";

const iconButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 bg-card transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-30";

let previewKey = 0;

export default function ProductImagesManager({
  existingImages = [],
  onChange,
}) {
  const [kept, setKept] = useState(existingImages);
  const [deletedIds, setDeletedIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Los object URLs viven hasta que se revocan a mano.
  useEffect(() => {
    return () => {
      newImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onChange se llama explícitamente en cada handler (no vía useEffect) para
  // no depender de que el padre memoice la función.
  function emit(nextKept, nextDeleted, nextNew) {
    onChange({
      keptImageIds: nextKept.map((image) => image.id),
      deletedImageIds: nextDeleted,
      newFiles: nextNew.map((image) => image.file),
    });
  }

  function removeExisting(imageId) {
    const nextKept = kept.filter((image) => image.id !== imageId);
    const nextDeleted = [...deletedIds, imageId];

    setKept(nextKept);
    setDeletedIds(nextDeleted);
    emit(nextKept, nextDeleted, newImages);
  }

  function moveExisting(index, direction) {
    const target = direction === "up" ? index - 1 : index + 1;

    if (target < 0 || target >= kept.length) return;

    const nextKept = [...kept];
    [nextKept[index], nextKept[target]] = [nextKept[target], nextKept[index]];

    setKept(nextKept);
    emit(nextKept, deletedIds, newImages);
  }

  function handleFilesSelected(event) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const added = files.map((file) => {
      previewKey += 1;
      return {
        key: previewKey,
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });

    const nextNew = [...newImages, ...added];

    setNewImages(nextNew);
    emit(kept, deletedIds, nextNew);

    // Permite volver a elegir el mismo archivo después de sacarlo.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNew(key) {
    const target = newImages.find((image) => image.key === key);

    if (target) URL.revokeObjectURL(target.previewUrl);

    const nextNew = newImages.filter((image) => image.key !== key);

    setNewImages(nextNew);
    emit(kept, deletedIds, nextNew);
  }

  const isEmpty = kept.length === 0 && newImages.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="product-images-input" className="text-sm font-medium">
        Imágenes
      </label>

      {isEmpty ? (
        <div className="flex aspect-square w-24 flex-col items-center justify-center gap-1 rounded-sm border border-ink/10 bg-sand text-ink/40">
          <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-[10px] text-ink/70">Sin imagen</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {kept.map((image, index) => (
            <div key={image.id} className="flex flex-col gap-1">
              <div className="relative aspect-square w-24 overflow-hidden rounded-sm border border-ink/10 bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveExisting(index, "up")}
                  disabled={index === 0}
                  aria-label="Mover antes"
                  className={iconButtonClass}
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => moveExisting(index, "down")}
                  disabled={index === kept.length - 1}
                  aria-label="Mover después"
                  className={iconButtonClass}
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => removeExisting(image.id)}
                  aria-label="Eliminar imagen"
                  className={`${iconButtonClass} text-ink/60 hover:border-rose hover:text-rose`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}

          {newImages.map((image) => (
            <div key={image.key} className="flex flex-col gap-1">
              <div className="relative aspect-square w-24 overflow-hidden rounded-sm border border-caramel bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="flex-1 text-[10px] text-caramel">Nueva</span>

                <button
                  type="button"
                  onClick={() => removeNew(image.key)}
                  aria-label="Quitar imagen nueva"
                  className={`${iconButtonClass} text-ink/60 hover:border-rose hover:text-rose`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin atributo name: los archivos se appendean a mano desde el estado,
          si no el form mandaría también los que el usuario ya sacó. */}
      <input
        ref={fileInputRef}
        id="product-images-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="block w-full font-body text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-body file:text-sm file:text-sand hover:file:opacity-90"
      />
    </div>
  );
}
