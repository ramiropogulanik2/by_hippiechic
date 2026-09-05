"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Cambio #1 del handoff, con la vuelta que pidió la clienta: en vez de una
// foto fija a la derecha, un carrusel tipo publicación de Instagram (una foto
// entera por vez, se arrastra con el dedo, puntitos abajo y flechas en
// desktop). Las fotos siguen saliendo de hero_images, así que se administran
// igual que antes desde /admin/hero.
//
// La foto chica superpuesta no es una imagen aparte que haya que elegir:
// muestra siempre la SIGUIENTE del carrusel. Funciona como adelanto, se
// mantiene sincronizada sola y la dueña no configura nada extra.

// Cambio #7: prueba social dentro del hero, en vez de suelta dentro del
// bloque "Detrás de".
// TODO: confirmar con la dueña "8 años" y "48 h" antes de publicar. El dato
// de seguidoras sí está verificado (es el de Instagram).
const SOCIAL_PROOF = [
  { value: "41k", label: "Seguidoras" },
  { value: "8", label: "Años de tienda" },
  { value: "48h", label: "Despacho" },
];

export default function HeroEditorial({ images = [] }) {
  // loop: true — de una publicación de Instagram se espera poder seguir
  // pasando indefinidamente. Acá sí conviene, a diferencia del carrusel
  // anterior, que mostraba 3 fotos a la vez y con pocas clonaba mal.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
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

  const hasImages = images.length > 0;
  const insetImage =
    images.length > 1 ? images[(selectedIndex + 1) % images.length] : null;

  const whatsappUrl = buildWhatsAppUrl("Hola! Quería consultar por un talle.");

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-0 lg:px-8 lg:pb-0">
      {/* En mobile la foto va primero: el objetivo del rediseño es que se vea
          prenda antes que texto. En desktop vuelve a la derecha. */}
      <div className="order-2 flex flex-col justify-center gap-6 py-2 lg:order-1 lg:gap-7 lg:py-24 lg:pr-16">
        <p className="font-body text-[11px] uppercase tracking-[0.28em] text-caramel sm:text-xs">
          Temporada 26 · Boho rockero
        </p>

        <h1 className="font-display text-[clamp(2.75rem,6.2vw,6rem)] leading-[0.98] tracking-[-0.015em] text-balance">
          Cueros, denim y{" "}
          <span className="font-accent text-caramel">piezas con carácter</span>
        </h1>

        <p className="max-w-[46ch] font-body text-base leading-relaxed text-ink/80 sm:text-lg">
          Selección chica y elegida a mano. Reservás por WhatsApp, te
          confirmamos talle y stock en el momento, y lo enviamos a todo el
          país.
        </p>

        <div className="flex flex-wrap gap-3.5 pt-1">
          <Link
            href="#categorias"
            className="bg-ink px-8 py-4 font-body text-[13px] uppercase tracking-[0.12em] text-sand transition-colors hover:bg-caramel sm:px-9"
          >
            Ver catálogo
          </Link>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink/35 px-8 py-4 font-body text-[13px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink sm:px-9"
            >
              Consultar un talle
            </a>
          )}
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-10 gap-y-5 border-t border-ink/15 pt-6">
          {SOCIAL_PROOF.map((item) => (
            <li key={item.label} className="flex flex-col gap-1">
              <span className="font-display text-3xl leading-none">
                {item.value}
              </span>
              <span className="font-body text-[10px] uppercase tracking-[0.18em] text-ink/60 sm:text-[11px]">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative order-1 min-h-[62vh] sm:min-h-[70vh] lg:order-2 lg:min-h-[640px]">
        {hasImages ? (
          <div className="group absolute inset-0">
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((src, index) => (
                  <div key={src} className="relative h-full w-full flex-none">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                {/* Flechas solo con mouse: en touch el arrastre ya resuelve
                    la navegación y encima taparían la foto. */}
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Foto anterior"
                  className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-sand/85 text-ink opacity-0 transition-opacity hover:bg-sand group-hover:opacity-100 focus-visible:opacity-100 lg:flex"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Foto siguiente"
                  className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-sand/85 text-ink opacity-0 transition-opacity hover:bg-sand group-hover:opacity-100 focus-visible:opacity-100 lg:flex"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>

                {/* Puntitos, como en una publicación de Instagram. */}
                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  {images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => emblaApi?.scrollTo(index)}
                      aria-label={`Ir a la foto ${index + 1}`}
                      aria-current={index === selectedIndex}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === selectedIndex
                          ? "w-6 bg-sand"
                          : "w-1.5 bg-sand/55 hover:bg-sand/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Sin fotos cargadas (la dueña las borró todas desde /admin/hero):
          // bloque tonal sólido en vez de un carrusel vacío.
          <div className="absolute inset-0 bg-dune" />
        )}

        {/* Foto chica superpuesta. En desktop desborda hacia la izquierda y
            pisa la columna de texto, a propósito. En mobile no hay columna que
            pisar y ese desborde se saldría de la pantalla (scroll horizontal),
            así que se apoya adentro de la foto, abajo a la izquierda, y más
            chica para no taparla. */}
        {insetImage && (
          <div className="absolute bottom-12 left-4 h-[145px] w-[110px] overflow-hidden border border-sand/50 shadow-[0_28px_60px_rgba(43,33,28,0.28)] sm:h-[180px] sm:w-[136px] lg:-left-14 lg:bottom-14 lg:h-[264px] lg:w-[200px]">
            <Image
              // key con la URL: al cambiar de foto React monta un <img> nuevo
              // y la transición de opacidad vuelve a correr desde 0.
              key={insetImage}
              src={insetImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 200px, 140px"
              className="animate-[hero-inset-fade_600ms_ease] object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
