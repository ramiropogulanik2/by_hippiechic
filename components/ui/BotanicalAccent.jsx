// Acento decorativo de línea fina, inspirado en las flores secas que
// aparecen en las fotos reales de la marca. Usa currentColor, así el color
// se controla desde afuera con un token (text-caramel, etc.).
//
// El viewBox arranca en y=-20 (no en 0) porque las tres puntas de arriba
// salen por encima del origen: con "0 0 120 160" quedaban recortadas.
export default function BotanicalAccent({ className = "" }) {
  return (
    <svg
      viewBox="0 -20 120 180"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M60 155 C55 120 65 90 58 60 C52 35 65 20 60 5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <ellipse
        cx="45"
        cy="100"
        rx="14"
        ry="6"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(-35 45 100)"
      />
      <ellipse
        cx="72"
        cy="80"
        rx="14"
        ry="6"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(35 72 80)"
      />
      <ellipse
        cx="42"
        cy="55"
        rx="12"
        ry="5"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(-40 42 55)"
      />
      <ellipse
        cx="70"
        cy="35"
        rx="12"
        ry="5"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(40 70 35)"
      />
      <path
        d="M60 5 L52 -15 M60 5 L60 -18 M60 5 L68 -15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
