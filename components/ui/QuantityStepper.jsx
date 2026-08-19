export default function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
}) {
  const buttonClass =
    "flex h-11 w-11 items-center justify-center text-lg leading-none text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-ink/25 disabled:hover:bg-transparent";

  return (
    // Un solo contenedor con borde en vez de tres círculos sueltos: se lee
    // como un control único y ocupa menos ancho al lado del botón de compra.
    <div className="flex w-fit shrink-0 items-center rounded-full border border-ink/20">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Restar uno"
        className={`${buttonClass} rounded-l-full`}
      >
        −
      </button>

      <span
        className="w-8 text-center font-body text-sm tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        aria-label="Sumar uno"
        className={`${buttonClass} rounded-r-full`}
      >
        +
      </button>
    </div>
  );
}
