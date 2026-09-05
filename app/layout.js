import { Instrument_Serif, Jost } from "next/font/google";
import "./globals.css";

// Cambio #11 del handoff: la identidad tipográfica pasa a ser Instrument
// Serif (titulares) + Jost (todo lo demás). Reemplaza al cuarteto anterior
// (Fraunces + Karla + Cormorant + Caveat): dos familias en vez de cuatro,
// menos peso de fuentes y una voz más editorial.
//
// Instrument Serif no es variable y solo existe en 400 — por eso el weight
// fijo. La itálica sí es real (style: normal + italic), no la sintética que
// dibujaría el navegador si solo se pidiera "normal".
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Jost sí es variable: sin `weight` next/font sirve el rango completo y
// quedan disponibles 400/500/600 sin descargar tres archivos.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hippie & Chic",
  description:
    "Catálogo boho-chic. Envíos a todo el país. Los pedidos se confirman por WhatsApp.",
};

// themeColor va en un export "viewport" aparte, no dentro de "metadata": Next
// dejó de aceptarlo ahí hace varias versiones. Sin esto, en mobile la barra
// de direcciones/UI del navegador toma un color por default en vez de
// combinar con el sitio.
export const viewport = {
  themeColor: "#f7f2ea",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className="h-full scroll-smooth antialiased"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${instrumentSerif.variable} ${jost.variable} min-h-full flex flex-col font-body`}
      >
        {children}
      </body>
    </html>
  );
}
