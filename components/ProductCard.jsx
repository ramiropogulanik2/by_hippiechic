import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ name, price, imageUrl, slug }) {
  return (
    <Link href={`/producto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-dune">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-accent text-lg text-caramel">Sin foto</span>
          </div>
        )}

        {/* "Ver prenda" sube desde abajo en hover. Es solo un refuerzo visual
            de que la card entera es clickeable — no es un botón aparte, toda
            la card ya es el link. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink/85 py-2.5 text-center font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-sand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
        >
          Ver prenda
        </div>
      </div>

      {/* Fuera de la foto y sin fondo de card: la grilla se lee como una
          serie de fotos con su ficha debajo, no como una cuadrícula de
          recuadros. Deja que respire el catálogo. */}
      <div className="flex flex-col gap-0.5 pt-3">
        <h3 className="font-body text-sm text-ink transition-colors group-hover:text-caramel">
          {name}
        </h3>
        <p className="font-display text-base font-semibold text-ink">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
