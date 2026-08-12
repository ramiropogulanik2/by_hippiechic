import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ name, price, imageUrl, slug }) {
  return (
    <Link
      href={`/producto/${slug}`}
      className="group block overflow-hidden rounded-sm bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-caramel/20">
            <span className="font-accent text-lg text-caramel">Sin foto</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="font-body text-sm font-medium text-ink">{name}</h3>
        <p className="font-body text-base font-bold text-ink">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
