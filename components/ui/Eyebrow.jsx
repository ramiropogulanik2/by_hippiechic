// Etiqueta chica que va arriba de los títulos de sección.
//
// Antes era manuscrita y grande; ahora es una etiqueta estructural
// (versalitas con tracking abierto + una línea corta), y la "voz" de marca
// quedó reservada para la itálica wonky de Fraunces (.font-accent). Separar
// los dos roles evita que todo lo secundario compita por atención.
//
// `tone="dark"` para fondos espresso: el óxido oscuro ahí queda en 3.2:1,
// el ember sube a 5.8:1.
export default function Eyebrow({ children, className = "", tone = "light" }) {
  const textColor = tone === "dark" ? "text-ember" : "text-caramel";
  const lineColor = tone === "dark" ? "bg-ember/60" : "bg-caramel/50";

  return (
    <p
      className={`mb-3 flex w-fit items-center gap-3 font-body text-[11px] font-semibold uppercase tracking-[0.22em] ${textColor} ${className}`}
    >
      <span aria-hidden="true" className={`h-px w-7 ${lineColor}`} />
      {children}
    </p>
  );
}
