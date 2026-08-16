"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { moveHeroImage, removeHeroImage } from "@/lib/actions/heroImages";

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-30";

export default function HeroRowActions({ image, isFirst = false, isLast = false }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(actionPromise) {
    startTransition(async () => {
      const result = await actionPromise;

      if (!result?.success) {
        alert(result?.error ?? "Algo salió mal. Probá de nuevo.");
        return;
      }

      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "¿Eliminar esta foto del hero? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    run(removeHeroImage(image.id));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => run(moveHeroImage(image.id, "up"))}
        disabled={isPending || isFirst}
        aria-label="Mover arriba"
        className={iconButtonClass}
      >
        <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={() => run(moveHeroImage(image.id, "down"))}
        disabled={isPending || isLast}
        aria-label="Mover abajo"
        className={iconButtonClass}
      >
        <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Eliminar"
        className={`${iconButtonClass} text-ink/60 hover:border-rose hover:text-rose`}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
