import Image from "next/image";
// Esta versión de lucide-react ya no trae íconos de marca (no existe
// Instagram), así que para seguidoras se usa Users.
import { Calendar, Truck, Users } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const HIGHLIGHTS = [
  { Icon: Users, label: "+41.000 seguidoras" },
  { Icon: Truck, label: "Envíos a todo el país" },
  { Icon: Calendar, label: "Atención con cita previa" },
];

export default function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* Texto primero en el markup: así queda arriba en mobile (apilado)
            y a la izquierda en desktop (grid-cols-2), sin necesitar clases
            order-* para desacoplar el orden visual del DOM. */}
        <div className="flex flex-col">
          <Eyebrow>Conocé la tienda</Eyebrow>

          <h2 className="mb-4 font-display text-3xl font-semibold sm:text-4xl">
            Detrás de Hippie &amp; Chic
          </h2>

          {/* TODO: copy placeholder, falta confirmarlo con la dueña. */}
          <p className="font-body text-base leading-relaxed text-ink/80">
            Hace años armamos Hippie &amp; Chic pensando en mujeres que buscan
            piezas con personalidad: cueros, denim y esa mezcla boho-rockera que
            nos representa. Atendemos con cita previa en nuestro showroom en
            Córdoba, y enviamos a todo el país.
          </p>

          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
            {HIGHLIGHTS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                <Icon
                  className="h-4 w-4 shrink-0 text-caramel"
                  strokeWidth={1.5}
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm bg-caramel">
          <Image
            src="/about.jpg"
            alt="Showroom de Hippie & Chic"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
