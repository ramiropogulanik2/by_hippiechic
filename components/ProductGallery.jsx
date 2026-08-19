"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export default function ProductGallery({ images = [], productName = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-sm bg-dune">
        <span className="font-accent text-2xl text-caramel">Sin fotos</span>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-dune">
        {/* Cross-fade al cambiar de foto en vez de un corte seco. mode="wait"
            no: dejaría un frame con el fondo vacío entre una y otra. Las dos
            se superponen y la nueva entra encima. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={activeImage.image_url}
            className="absolute inset-0"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Image
              src={activeImage.image_url}
              alt={productName}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image.image_url + index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={isActive}
                className={`relative aspect-[3/4] w-16 overflow-hidden rounded-sm transition-all duration-300 sm:w-20 ${
                  isActive
                    ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-sand"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.image_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
