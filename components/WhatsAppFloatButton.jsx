"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const STORAGE_KEY = "cookieConsent";

export default function WhatsAppFloatButton() {
  // Mientras el banner de cookies (components/CookieBanner.jsx) sigue sin
  // aceptarse, se solapa con este botón en mobile: el banner apilado mide
  // ~120px de alto, más que la posición default del botón. Arranca en la
  // posición normal (mismo motivo que el banner: en el server no hay
  // localStorage, así que si arrancara "elevado" el HTML del server no
  // coincidiría con el del cliente) y sube apenas el efecto confirma, ya en
  // el navegador, que el banner sigue sin aceptarse.
  const [clearBanner, setClearBanner] = useState(false);

  useEffect(() => {
    function checkConsent() {
      setClearBanner(window.localStorage.getItem(STORAGE_KEY) !== "true");
    }

    checkConsent();
    window.addEventListener("cookie-consent-accepted", checkConsent);
    return () =>
      window.removeEventListener("cookie-consent-accepted", checkConsent);
  }, []);

  // Devuelve null si falta NEXT_PUBLIC_WHATSAPP_NUMBER: en ese caso se omite
  // el botón en vez de linkear a un wa.me/undefined roto.
  const whatsappUrl = buildWhatsAppUrl("Hola! Tengo una consulta.");

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-105 ${
        clearBanner ? "bottom-36 sm:bottom-5" : "bottom-5"
      }`}
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
