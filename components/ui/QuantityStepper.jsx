export default function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
}) {
  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-base leading-none transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="Restar uno"
        className={buttonClass}
      >
        −
      </button>

      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        aria-label="Sumar uno"
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
