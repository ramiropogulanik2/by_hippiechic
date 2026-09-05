// Cambio #2 del handoff: la cinta deja de repetir el logo y pasa a decir las
// promesas de la tienda.
//
// Las frases están alineadas con lib/policyContent.js (lo que ya se le
// promete a la clienta en los popups del footer). El mock traía además "3
// cuotas sin interés" y "Cambios sin cargo en Córdoba": no se incluyen
// porque hoy el único medio de pago es transferencia y la política de
// cambios no está confirmada. Si mañana son ciertas, se agregan acá.
const ITEMS = [
  "Envíos a todo el país",
  "Pago por transferencia",
  "Cambios dentro de los 7 días",
  "Showroom con cita previa",
  "Atención directa por WhatsApp",
];

// `hidden` marca la copia duplicada: visualmente son idénticas, pero el
// lector de pantalla tiene que escuchar las frases una sola vez.
function MarqueeRow({ hidden = false }) {
  return (
    <div
      aria-hidden={hidden ? "true" : undefined}
      className="flex shrink-0 items-center gap-8 whitespace-nowrap px-4 font-body text-[10px] uppercase tracking-[0.2em] text-ink/75 sm:gap-13 sm:px-6 sm:text-xs sm:tracking-[0.24em]"
    >
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-8 sm:gap-13">
          {item}
          <span aria-hidden="true" className="text-caramel">
            ✳
          </span>
        </span>
      ))}
    </div>
  );
}

export default function InfoMarquee() {
  return (
    <div className="group mt-16 overflow-hidden border-y border-ink/15 bg-dune sm:mt-20">
      {/* El track mide exactamente el doble de una tanda, por eso el -50% del
          keyframe cae justo en el arranque de la copia y el loop no salta.
          El espaciado va como gap dentro de cada item (no del track) para que
          también quede aire entre la última frase y la primera de la copia. */}
      <div className="flex w-max animate-[marquee_34s_linear_infinite] group-hover:[animation-play-state:paused]">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
