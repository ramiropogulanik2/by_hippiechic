const STATUS_STYLES = {
  pendiente: "bg-caramel text-sand",
  confirmado: "bg-ink text-sand",
  rechazado: "bg-rose text-sand",
};

const STATUS_LABELS = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
};

export default function OrderStatusBadge({ status, size = "sm" }) {
  const style = STATUS_STYLES[status] ?? "bg-ink/10 text-ink/70";
  const sizeClass =
    size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-block shrink-0 rounded-full font-medium ${style} ${sizeClass}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
