"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function PolicyModal({ isOpen, onClose, title, children }) {
  // Sin esto el fondo scrollea detrás del modal, confuso en mobile donde el
  // modal ya ocupa casi toda la pantalla.
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* stopPropagation: sin esto, cualquier click adentro del modal
          burbujea hasta el overlay y lo cierra igual. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-sm bg-card p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <h2 className="pr-8 font-display text-2xl leading-tight text-ink sm:text-3xl">
          {title}
        </h2>

        <div className="mt-5 overflow-y-auto font-body text-sm leading-relaxed text-ink/80">
          {children}
        </div>
      </div>
    </div>
  );
}
