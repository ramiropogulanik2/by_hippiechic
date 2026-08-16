"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

export default function HeroCarousel({ images = [] }) {
  // loop: false porque el número de fotos varía (se administran desde
  // /admin/hero) — con loop true y pocos slides, Embla necesita clonarlos
  // para el wrap y se nota el salto. align 'start' deja la primera foto
  // pegada al borde izquierdo del contenedor.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);

    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div key={src} className="w-[85vw] flex-none md:w-[33.333vw]">
              <div className="relative aspect-[3/4]">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 34vw, 85vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Puntitos tipo Instagram Stories, uno por foto. z-20 para quedar por
          encima del velo del hero, que es hermano posterior en el DOM y si
          no lo taparía. Se ocultan con una sola foto: no hay nada que
          indicar. */}
      {images.length > 1 && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a la foto ${index + 1}`}
              className={`rounded-full transition-all ${
                index === selectedIndex
                  ? "h-2 w-6 bg-caramel"
                  : "h-2 w-2 bg-sand/70 hover:bg-sand"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
