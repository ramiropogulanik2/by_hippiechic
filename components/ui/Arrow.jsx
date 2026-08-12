export default function Arrow({ direction = "right", className = "" }) {
  return (
    <svg
      viewBox="0 0 48 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${direction === "left" ? "-scale-x-100" : ""} ${className}`}
    >
      <line x1="1" y1="6" x2="42" y2="6" />
      <polyline points="36,1.5 42,6 36,10.5" />
    </svg>
  );
}
