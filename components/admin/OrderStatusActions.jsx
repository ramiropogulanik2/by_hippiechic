"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/orders";

export default function OrderStatusActions({ orderId, status }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(newStatus, confirmMessage) {
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);

      if (!result?.success) {
        alert(result?.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      router.refresh();
    });
  }

  const buttonBase =
    "rounded-full px-6 py-3 font-body text-sm font-medium text-sand transition-opacity disabled:cursor-not-allowed disabled:opacity-60";

  if (status === "pendiente") {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              "confirmado",
              "¿Confirmar el pedido? Se va a descontar el stock de cada producto."
            )
          }
          className={`${buttonBase} bg-ink hover:opacity-90`}
        >
          Confirmar pedido
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("rechazado", "¿Rechazar el pedido? El stock no se modifica.")
          }
          className={`${buttonBase} bg-rose hover:opacity-90`}
        >
          Rechazar pedido
        </button>
      </div>
    );
  }

  if (status === "confirmado") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              "pendiente",
              "¿Revertir a pendiente? El stock descontado se devuelve al catálogo."
            )
          }
          className={`${buttonBase} self-start bg-ink hover:opacity-90`}
        >
          Revertir a pendiente
        </button>

        <p className="text-xs text-ink/70">
          Revertir devuelve al stock las unidades que se habían descontado al
          confirmar.
        </p>
      </div>
    );
  }

  // Rechazado: se ofrece reconsiderar. Como nunca descontó stock, volver a
  // pendiente no mueve inventario.
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          run("pendiente", "¿Volver a poner el pedido en pendiente?")
        }
        className="self-start rounded-full border border-ink/20 px-6 py-3 font-body text-sm transition-colors hover:border-ink/40 disabled:opacity-60"
      >
        Volver a pendiente
      </button>

      <p className="text-xs text-ink/70">
        Este pedido no descontó stock, así que volver a pendiente no modifica el
        inventario.
      </p>
    </div>
  );
}
