"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-sm bg-sand">
        <span className="font-accent text-2xl text-caramel">Sin fotos</span>
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-sand">
        <Image
          src={activeImage.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image.image_url + index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={isActive}
                className={`relative aspect-square w-20 overflow-hidden rounded-sm border-2 transition-colors ${
                  isActive
                    ? "border-caramel"
                    : "border-transparent hover:border-ink/20"
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
