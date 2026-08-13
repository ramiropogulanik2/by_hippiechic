import { MessageCircle } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function Footer() {
  // Devuelve null si falta NEXT_PUBLIC_WHATSAPP_NUMBER: en ese caso se omite
  // el botón en vez de linkear a un wa.me/undefined roto.
  const whatsappUrl = buildWhatsAppUrl(
    "Hola! Tengo una consulta sobre un producto."
  );

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
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Escribinos por WhatsApp
          </a>
        )}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center sm:px-6">
        <p className="font-accent text-2xl tracking-wide">HIPPIE &amp; CHIC</p>

        <a
          href="https://www.instagram.com/by_hippiechic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline-offset-4 transition-colors hover:text-caramel hover:underline"
        >
          @by_hippiechic
        </a>

        <p className="font-accent text-xl text-caramel">
          Envíos a todo el país
        </p>

        <p className="text-xs text-sand/60">
          Los pedidos se confirman por WhatsApp
        </p>
      </div>
    </footer>
  );
}
