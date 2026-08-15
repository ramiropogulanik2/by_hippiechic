"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

// Cuánto queda visible la pista antes de desvanecerse sola.
const HINT_VISIBLE_MS = 4500;

export default function HeroCarousel({ images = [] }) {
  // loop: false porque solo tenemos 3 fotos — con loop true y tan pocos
  // slides, Embla necesita clonarlos para el wrap y se nota el salto. align
  // 'start' deja la primera foto pegada al borde izquierdo del contenedor.
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Pista de swipe, solo mobile: en desktop se ven 3 fotos y ya se
          entiende que hay más. z-20 para quedar por encima del velo del
          hero, que es hermano posterior en el DOM y si no lo taparía.
          pointer-events-none en todo: nunca debe robarle el gesto a Embla. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 right-3 z-20 -translate-y-1/2 transition-opacity duration-700 md:hidden ${
          showHint ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* La animación va en el hijo y la transición de opacidad en el
            padre: si compartieran elemento, el transform del keyframe y el
            -translate-y-1/2 del posicionamiento se pisarían. */}
        <span className="flex h-9 w-9 animate-[swipe-hint_1.4s_ease-in-out_infinite] items-center justify-center rounded-full bg-ink/50 text-sand backdrop-blur-sm">
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
