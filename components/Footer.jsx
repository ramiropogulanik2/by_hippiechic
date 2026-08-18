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
  "underline-offset-4 transition-colors hover:text-caramel hover:underline";

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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 border-b border-sand/10 px-4 py-14 text-center sm:px-6">
        <Eyebrow>¿Tenés dudas?</Eyebrow>

        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Para consultas
        </h2>

        <p className="font-body text-sm text-sand/70">
          Escribinos y te ayudamos a elegir.
        </p>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-sand px-6 py-3 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            <FaWhatsapp className="h-4 w-4" />
            Escribinos por WhatsApp
          </a>
        )}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 border-b border-sand/10 px-4 py-12 text-center sm:px-6">
        <div className="flex flex-col items-center gap-3">
          <p className="font-accent text-2xl tracking-wide">HIPPIE &amp; CHIC</p>

          <Eyebrow className="mb-0">Seguime en:</Eyebrow>

          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/by_hippiechic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-sand/80 transition-colors hover:text-caramel"
            >
              <FaInstagram className="h-6 w-6" />
            </a>

            {/* TODO: confirmar URL exacta de Facebook con Rami antes de
                publicar — la página se llama "Hippie & CHIC", esta es un
                placeholder armado con ese nombre y puede no ser la real. */}
            <a
              href="https://www.facebook.com/HippieChicOk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-sand/80 transition-colors hover:text-caramel"
            >
              <FaFacebook className="h-6 w-6" />
            </a>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-body text-sm text-sand/80">
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

      <div className="mx-auto px-4 py-6 text-center sm:px-6">
        <p className="font-body text-xs text-sand/50">
          © Hippie &amp; Chic {new Date().getFullYear()}. Todos los derechos
          reservados.
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
