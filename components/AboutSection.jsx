import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Cambio #8 del handoff: el bloque baja al final de la home (antes iba
// segundo, arriba del catálogo) y se acorta. Los tres datos que estaban acá
// sueltos (seguidoras / envíos / cita previa) se fueron al hero como prueba
// social (cambio #7), así que este bloque queda solo con el relato + un CTA.
export default function AboutSection() {
  // Devuelve null si falta NEXT_PUBLIC_WHATSAPP_NUMBER: en ese caso se omite
  // el link en vez de armar un wa.me/undefined roto.
  const whatsappUrl = buildWhatsAppUrl(
    "Hola! Quería pedir una cita para el showroom."
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      <Reveal>
        {/* Un solo bloque tonal partido en dos, sin gap: la foto llega hasta
            el borde del panel de texto, como en el mock. */}
        <div className="grid grid-cols-1 items-stretch bg-dune md:grid-cols-2">
          <div className="relative min-h-[280px] sm:min-h-[380px] md:min-h-[460px]">
            <Image
              src="/about.jpg"
              alt="Showroom de Hippie & Chic"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center gap-5 px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
            <Eyebrow>Conocé la tienda</Eyebrow>

            <h2 className="font-display text-[clamp(2.1rem,3.2vw,3rem)] leading-[1.03]">
              {/* El "&" itálico desentona al lado de las letras: se lo deja
                  recto aunque el resto del nombre vaya en itálica. */}
              Detrás de{" "}
              <span className="font-accent">
                Hippie <span className="not-italic">&amp;</span> Chic
              </span>
            </h2>

            <p className="max-w-[52ch] font-body text-base leading-relaxed text-ink/80 sm:text-[17px]">
              Armamos la tienda pensando en mujeres que buscan piezas con
              personalidad: cueros, denim y esa mezcla boho-rockera que nos
              representa. Atendemos con cita previa en el showroom de Córdoba y
              enviamos a todo el país.
            </p>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 self-start border-b border-ink pb-1.5 font-body text-[13px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-caramel hover:text-caramel"
              >
                Pedir una cita →
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
