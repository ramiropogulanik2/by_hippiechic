import Image from "next/image";

// Puramente decorativo (separador entre secciones): el logo real y
// accesible ya está en el Header, así que toda la banda se saca del árbol
// de accesibilidad y cada imagen lleva alt vacío.
const REPEAT_COUNT = 8;
const repeats = Array.from({ length: REPEAT_COUNT });

function LogoRow() {
  return (
    <div className="flex shrink-0 items-center">
      {repeats.map((_, index) => (
        <Image
          key={index}
          src="/hippiechic-logo-v2.png"
          alt=""
          width={582}
          height={190}
          // El espaciado va como margin-right de cada logo, NO como gap del
          // flex: con gap, el hueco entre el último logo de una tanda y el
          // primero de la tanda duplicada termina siendo distinto al resto
          // (gap no deja espacio después del último hijo), y el track ya no
          // mide exactamente el doble de una tanda — el -50% del keyframe
          // queda corrido medio espaciado y se nota un salto en el loop.
          // Con margin en cada uno (incluido el último) todos los huecos
          // miden igual y el track sí es exactamente 2x una tanda.
          className="h-9 w-auto mr-16 [filter:brightness(0)_invert(1)]"
        />
      ))}
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <div aria-hidden="true" className="group overflow-hidden bg-ink">
      <div className="flex h-16 w-max items-center animate-[marquee-logo_25s_linear_infinite] group-hover:[animation-play-state:paused]">
        <LogoRow />
        <LogoRow />
      </div>
    </div>
  );
}
