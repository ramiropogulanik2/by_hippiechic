import Image from "next/image";
import { Calendar, Truck, Users } from "lucide-react";
import BotanicalAccent from "@/components/ui/BotanicalAccent";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const HIGHLIGHTS = [
  { Icon: Users, label: "+41.000 seguidoras" },
  { Icon: Truck, label: "Envíos a todo el país" },
  { Icon: Calendar, label: "Atención con cita previa" },
];

export default function AboutSection() {
  return (
    // Bloque tonal a sangre completa: el cambio de tono contra las secciones
    // vecinas es lo que las separa, sin necesitar bordes ni divisores.
    <section className="relative overflow-hidden bg-dune">
      <BotanicalAccent className="pointer-events-none absolute bottom-0 left-0 hidden h-80 w-auto -translate-x-1/3 text-olive opacity-[0.15] lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Texto primero en el markup: queda arriba en mobile (apilado) y a
              la izquierda en desktop, sin necesitar clases order-*. */}
          <Reveal className="flex flex-col">
            <Eyebrow>Conocé la tienda</Eyebrow>

            <h2 className="mb-5 font-classic text-3xl font-semibold leading-tight sm:text-5xl">
              Detrás de <em className="italic">Hippie &amp; Chic</em>
            </h2>

            {/* TODO: copy placeholder, falta confirmarlo con la dueña. */}
            <p className="max-w-prose font-body text-base leading-relaxed text-ink/80">
              Hace años armamos Hippie &amp; Chic pensando en mujeres que buscan
              piezas con personalidad: cueros, denim y esa mezcla boho-rockera
              que nos representa. Atendemos con cita previa en nuestro showroom
              en Córdoba, y enviamos a todo el país.
            </p>

            <ul className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-7">
              {HIGHLIGHTS.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 font-body text-sm"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-caramel"
                    strokeWidth={1.5}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm bg-caramel">
              <Image
                src="/about.jpg"
                alt="Showroom de Hippie & Chic"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
