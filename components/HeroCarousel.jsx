"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

export default function HeroCarousel({ images = [] }) {
  // loop: false porque solo tenemos 3 fotos — con loop true y tan pocos
  // slides, Embla necesita clonarlos para el wrap y se nota el salto. align
  // 'start' deja la primera foto pegada al borde izquierdo del contenedor.
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((src, index) => (
          <div key={src} className="flex-none w-[46vw] md:w-[33.333vw]">
            <div className="relative aspect-[3/4]">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 34vw, 46vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
