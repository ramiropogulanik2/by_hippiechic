"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookieConsent";

export default function CookieBanner() {
  // Arranca en false a propósito: en el server no hay localStorage, así que
  // si arrancara en true (mostrado) el HTML del server nunca coincidiría con
  // el del cliente en la primera visita real. El useEffect decide después,
  // ya en el navegador, si corresponde mostrarlo.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = window.localStorage.getItem(STORAGE_KEY) === "true";
    if (!hasConsent) setIsVisible(true);
  }, []);

  function handleAccept() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    // WhatsAppFloatButton escucha esto para volver a su posición normal: sin
    // este aviso no se entera de que el banner se cerró recién ahora, en esta
    // pestaña (localStorage solo notifica a OTRAS pestañas, no a la propia).
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand/10 bg-ink px-4 py-4 text-sand sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm text-sand/80 sm:text-left">
          Al navegar por este sitio aceptás el uso de cookies para mejorar tu
          experiencia.
        </p>

        <button
          type="button"
          onClick={handleAccept}
          className="shrink-0 rounded-full bg-sand px-6 py-2 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
