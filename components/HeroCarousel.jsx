"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const AUTOPLAY_MS = 4000;
// Tras un click en un puntito, cuánto se espera antes de retomar el
// autoplay, para no pelear con la elección manual del usuario.
const RESUME_AFTER_CLICK_MS = 6000;

export default function HeroCarousel({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Dos causas de pausa independientes, no un solo booleano compartido: si
  // el timer del click y el hover pisaran el mismo estado, cualquiera de los
  // dos podía "despausar" al otro por accidente (ej: el timer de 6s del
  // click vence mientras el mouse sigue encima, y reactiva el autoplay pese
  // a que seguís sobre el carrusel).
  const [isHovering, setIsHovering] = useState(false);
  const [isClickPaused, setIsClickPaused] = useState(false);
  const isPaused = isHovering || isClickPaused;
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  // El timer de "retomar tras click" es independiente del interval de arriba,
  // así que necesita su propio cleanup al desmontar.
  useEffect(() => {
    return () => clearTimeout(resumeTimerRef.current);
  }, []);

  function handleDotClick(index) {
    setActiveIndex(index);
    setIsClickPaused(true);

    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsClickPaused(false);
    }, RESUME_AFTER_CLICK_MS);
  }

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative h-full w-full overflow-hidden"
    >
      {images.map((src, index) => (
        <div
          key={src}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-caramel" : "bg-ink/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
