import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ name, slug, imageUrl }) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className="group relative block aspect-square overflow-hidden rounded-sm"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-caramel" />
      )}

      {/* Overlay: sutil en reposo, un poco más oscuro en hover. */}
      <div className="absolute inset-0 bg-ink/25 transition-colors duration-300 group-hover:bg-ink/40" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <h3 className="text-center font-display text-2xl font-semibold text-sand sm:text-3xl">
          {name}
        </h3>
      </div>
    </Link>
  );
}
