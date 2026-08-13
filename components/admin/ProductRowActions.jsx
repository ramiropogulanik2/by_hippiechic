"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteProduct, toggleProductPublished } from "@/lib/actions/products";

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-30";

export default function ProductRowActions({ product }) {
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
      `¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    run(deleteProduct(product.id));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          run(toggleProductPublished(product.id, product.is_published))
        }
        disabled={isPending}
        aria-label={product.is_published ? "Despublicar" : "Publicar"}
        className={iconButtonClass}
      >
        {product.is_published ? (
          <Eye className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <EyeOff className="h-4 w-4" strokeWidth={1.5} />
        )}
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
