"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";

// El hero completo: carrusel + degradado + texto. Antes el texto vivía en la
// página y el carrusel acá, lo que obligaba a mantener sincronizadas dos
// alturas en archivos distintos (ya causó un bug de layout en una fase
// anterior). Ahora es una sola pieza autocontenida.
export default function HeroCarousel({ images = [] }) {
  // loop: false porque el número de fotos varía (se administran desde
  // /admin/hero) — con loop true y pocos slides Embla tiene que clonarlos
  // para el wrap y se nota el salto. align 'start' deja la primera foto
  // pegada al borde izquierdo.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);

    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  const hasImages = images.length > 0;

  const textReveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section className="relative">
      {hasImages ? (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((src, index) => (
              <div
                key={src}
                // Alturas de viewport en vez de aspect-ratio: el hero ocupa
                // casi toda la pantalla y las fotos se recortan con
                // object-cover. Antes, con aspect-[3/4], en desktop ancho el
                // hero quedaba desproporcionadamente alto.
                className="relative h-[78vh] w-[86vw] flex-none sm:h-[85vh] md:w-[40vw] lg:w-[33.333vw]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 34vw, (min-width: 768px) 40vw, 86vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Sin fotos cargadas (la dueña las borró todas desde /admin/hero):
        // bloque tonal sólido en vez de un carrusel vacío.
        <div className="h-[78vh] bg-dune sm:h-[85vh]" />
      )}

      {/* Degradado en vez del velo plano anterior: deja las fotos limpias
          arriba y concentra la oscuridad abajo, que es donde va el texto.
          pointer-events-none para no bloquear el arrastre de Embla. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/5" />

      {/* Centrado, mismo texto y tipografía que antes de este experimento —
          se probó movido abajo-a-la-izquierda con copy nuevo y no convenció,
          así que se revirtió puntualmente esta parte. El resto del hero
          (fotos a altura de viewport, degradado, header transparente encima)
          sigue del rediseño. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <motion.p
          {...textReveal}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-handwritten text-3xl text-sand drop-shadow-sm sm:text-5xl"
        >
          Boho-chic · Envíos a todo el país
        </motion.p>

        <motion.a
          {...textReveal}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          href="#categorias"
          className="pointer-events-auto rounded-full bg-sand px-6 py-3 font-body text-sm font-medium text-ink transition-colors hover:bg-card"
        >
          Ver catálogo
        </motion.a>
      </div>

      {/* Puntitos: uno por foto, sobre el degradado. Se ocultan con una sola
          foto — no hay nada que indicar. */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-7">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a la foto ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === selectedIndex
                  ? "w-8 bg-ember"
                  : "w-1.5 bg-sand/50 hover:bg-sand/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
