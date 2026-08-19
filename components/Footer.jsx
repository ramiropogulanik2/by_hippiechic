"use client";

import { useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import Eyebrow from "@/components/ui/Eyebrow";
import PolicyModal from "@/components/ui/PolicyModal";
import { policyContent } from "@/lib/policyContent";
import { termsContent } from "@/lib/termsContent";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const POLICY_LINKS = [
  { key: "comoComprar", label: "¿Cómo comprar?" },
  { key: "mediosDePago", label: "Medios de pago" },
  { key: "metodosDeEnvio", label: "Métodos de envío" },
  { key: "cambiosYDevoluciones", label: "Cambios y devoluciones" },
];

const linkClass =
  "link-underline font-body text-[11px] uppercase tracking-[0.14em] text-sand/75 transition-colors hover:text-ember";

export default function Footer() {
  const [openPolicyKey, setOpenPolicyKey] = useState(null);
  const [termsOpen, setTermsOpen] = useState(false);

  // Devuelve null si falta NEXT_PUBLIC_WHATSAPP_NUMBER: en ese caso se omite
  // el botón en vez de linkear a un wa.me/undefined roto.
  const whatsappUrl = buildWhatsAppUrl(
    "Hola! Tengo una consulta sobre un producto."
  );

  const activePolicy = openPolicyKey ? policyContent[openPolicyKey] : null;

  return (
    <footer className="bg-ink text-sand">
      {/* Bloque de contacto: el CTA es lo único centrado del footer, para que
          funcione como cierre del recorrido. El resto va en grilla, alineado
          a la izquierda, más de directorio que de tarjeta. */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        {/* tone="dark" cambia también la línea, no solo el texto: con el
            className suelto la rayita quedaba en óxido oscuro, invisible
            sobre el espresso del footer. */}
        <Eyebrow tone="dark" className="mx-auto">
          ¿Tenés dudas?
        </Eyebrow>

        <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-5xl">
          Escribinos y te ayudamos a <span className="font-accent">elegir</span>
        </h2>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 inline-flex items-center gap-2.5 rounded-full bg-sand px-8 py-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ember"
          >
            <FaWhatsapp className="h-4 w-4" />
            Escribinos por WhatsApp
          </a>
        )}
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 border-t border-sand/10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-start lg:px-8">
        <div className="flex flex-col gap-5">
          <p className="font-accent text-3xl tracking-wide">Hippie &amp; Chic</p>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/by_hippiechic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sand/20 text-sand/80 transition-colors hover:border-ember hover:text-ember"
            >
              <FaInstagram className="h-[18px] w-[18px]" />
            </a>

            {/* TODO: confirmar URL exacta de Facebook con Rami antes de
                publicar — la página se llama "Hippie & CHIC", esta es un
                placeholder armado con ese nombre y puede no ser la real. */}
            <a
              href="https://www.facebook.com/HippieChicOk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-sand/20 text-sand/80 transition-colors hover:border-ember hover:text-ember"
            >
              <FaFacebook className="h-[18px] w-[18px]" />
            </a>
          </div>

          <p className="font-body text-sm text-sand/70">
            Envíos a todo el país · Córdoba, Argentina
          </p>
        </div>

        <nav className="flex flex-col items-start gap-3 md:items-end">
          {POLICY_LINKS.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => setOpenPolicyKey(link.key)}
              className={linkClass}
            >
              {link.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className={linkClass}
          >
            Términos y condiciones
          </button>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl border-t border-sand/10 px-4 py-6 sm:px-6 lg:px-8">
        <p className="font-body text-[11px] uppercase tracking-[0.14em] text-sand/60">
          © Hippie &amp; Chic {new Date().getFullYear()}
        </p>
      </div>

      <PolicyModal
        isOpen={Boolean(activePolicy)}
        onClose={() => setOpenPolicyKey(null)}
        title={activePolicy?.title ?? ""}
      >
        <p>{activePolicy?.body}</p>
      </PolicyModal>

      <PolicyModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title={termsContent.title}
      >
        {termsContent.body.map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-3" : undefined}>
            {paragraph}
          </p>
        ))}
      </PolicyModal>
    </footer>
  );
}
