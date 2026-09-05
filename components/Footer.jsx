"use client";

import { useState } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Eyebrow from "@/components/ui/Eyebrow";
import PolicyModal from "@/components/ui/PolicyModal";
import { policyContent } from "@/lib/policyContent";
import { termsContent } from "@/lib/termsContent";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Cambio #10 del handoff: los links dejan de ser una lista plana y pasan a
// cuatro columnas con jerarquía (marca+redes / Comprar / Ayuda / Showroom).
//
// El footer sigue en espresso y no en papel como el mock: el mock lo dibuja
// claro porque ahí arriba va un bloque negro de WhatsApp (cambio #9, que no
// se pidió). Manteniendo el CTA oscuro que ya existe, un footer claro debajo
// sería la misma banda oscura partida al medio.
const SHOP_LINKS = [
  { key: "comoComprar", label: "¿Cómo comprar?" },
  { key: "mediosDePago", label: "Medios de pago" },
  { key: "metodosDeEnvio", label: "Métodos de envío" },
];

const columnTitleClass =
  "font-body text-[11px] uppercase tracking-[0.2em] text-sand/50";

const linkClass =
  "link-underline w-fit font-body text-[15px] text-sand/85 transition-colors hover:text-ember";

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
          funcione como cierre del recorrido. */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        {/* tone="dark" cambia también la línea, no solo el texto: con el
            className suelto la rayita quedaba en óxido oscuro, invisible
            sobre el espresso del footer. */}
        <Eyebrow tone="dark" className="mx-auto">
          ¿Tenés dudas con el talle?
        </Eyebrow>

        <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-5xl">
          Escribinos y te ayudamos a <span className="font-accent">elegir</span>
        </h2>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2.5 bg-[#25D366] px-8 py-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-[#0b2b15] transition-colors hover:bg-[#1fbb59]"
          >
            <FaWhatsapp className="h-4 w-4" />
            Escribinos por WhatsApp
          </a>
        )}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 border-t border-sand/10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-11 lg:px-8">
        <div className="flex flex-col gap-4">
          {/* El PNG es tinta oscura sobre transparente: sobre el espresso del
              footer hay que invertirlo a blanco. */}
          <Image
            src="/hippiechic-logo-v2.png"
            alt="Hippie & Chic"
            width={582}
            height={190}
            className="h-11 w-auto self-start [filter:brightness(0)_invert(1)]"
          />

          <p className="max-w-[34ch] font-body text-sm leading-relaxed text-sand/70">
            Envíos a todo el país · Córdoba, Argentina. Los pedidos se
            confirman por WhatsApp.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <a
              href="https://www.instagram.com/by_hippiechic"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-sand/25 px-4 py-2 font-body text-[11px] uppercase tracking-[0.12em] text-sand/85 transition-colors hover:border-sand hover:bg-sand hover:text-ink"
            >
              Instagram
            </a>

            {/* TODO: confirmar URL exacta de Facebook con Rami antes de
                publicar — la página se llama "Hippie & CHIC", esta es un
                placeholder armado con ese nombre y puede no ser la real. */}
            <a
              href="https://www.facebook.com/HippieChicOk"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-sand/25 px-4 py-2 font-body text-[11px] uppercase tracking-[0.12em] text-sand/85 transition-colors hover:border-sand hover:bg-sand hover:text-ink"
            >
              Facebook
            </a>
          </div>
        </div>

        <nav className="flex flex-col items-start gap-3">
          <p className={columnTitleClass}>Comprar</p>

          {SHOP_LINKS.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => setOpenPolicyKey(link.key)}
              className={linkClass}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <nav className="flex flex-col items-start gap-3">
          <p className={columnTitleClass}>Ayuda</p>

          <button
            type="button"
            onClick={() => setOpenPolicyKey("cambiosYDevoluciones")}
            className={linkClass}
          >
            Cambios y devoluciones
          </button>

          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className={linkClass}
          >
            Términos y condiciones
          </button>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Contacto
            </a>
          )}
        </nav>

        <div className="flex flex-col items-start gap-3">
          <p className={columnTitleClass}>Showroom</p>

          {/* TODO: confirmar el horario con la dueña antes de publicar — el
              handoff lo trae como dato a verificar. */}
          <p className="font-body text-[15px] leading-relaxed text-sand/80">
            Córdoba Capital
            <br />
            Con cita previa
            <br />
            Lun a Vie · 10 a 18 h
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-sand/10 px-4 py-6 sm:px-6 lg:px-8">
        <p className="font-body text-[11px] uppercase tracking-[0.14em] text-sand/50">
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
