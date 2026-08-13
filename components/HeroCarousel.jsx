import Image from "next/image";

export default function HeroCarousel({ images = [] }) {
  // El array se duplica una sola vez para que el loop no salte: al mover el
  // track exactamente -50% de SU PROPIO ancho total, el final del segundo
  // bloque coincide en pixel con el arranque del primero. Como -50% es un
  // porcentaje relativo al ancho del propio track (no un valor absoluto),
  // el cálculo queda exacto sin importar el ancho real de cada foto, siempre
  // que las dos mitades sean idénticas — que lo son, por construcción.
  const doubled = [...images, ...images];

  return (
    <div className="group relative w-full overflow-hidden">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
        {doubled.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative aspect-[3/4] w-[85vw] shrink-0 md:w-[33.3334vw]"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 34vw, 85vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
