import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ name, slug, imageUrl }) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 bg-dune" />
      )}

      {/* Degradado desde abajo en vez de un velo parejo: la foto se ve limpia
          en la parte de arriba y el nombre queda legible sobre la zona
          oscurecida, sin apagar toda la imagen. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <h3 className="font-display text-lg leading-tight text-sand sm:text-2xl">
          {name}
        </h3>

        {/* La flecha aparece recién en hover: en reposo la card es solo foto
            + nombre, sin adornos que compitan con la prenda. */}
        <span
          aria-hidden="true"
          className="translate-x-2 pb-1 text-sand opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
        >
          →
        </span>
      </div>
    </Link>
  );
}
