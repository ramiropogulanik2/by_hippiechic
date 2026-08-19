import { Caveat, Cormorant_Garamond, Fraunces, Karla } from "next/font/google";
import "./globals.css";

// Fraunces es variable y expone dos ejes además del grosor: SOFT (redondea
// los terminales) y WONK (glifos alternativos inclinados). Hay que pedirlos
// explícitamente con `axes`, si no next/font sirve solo el eje de peso y
// las font-variation-settings de globals.css no tendrían efecto.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

// Vuelve solo para los 3 momentos de marca donde, probado el rediseño, se
// prefirió la serif original a la Fraunces itálica (ver .font-classic en
// globals.css). style: normal+italic para que la itálica sea real, no la
// sintética que dibuja el navegador si solo se pide "normal".
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Igual que Cormorant arriba: vuelve solo para el texto del hero, que se
// pidió que quedara igual al de antes de este experimento (manuscrita, no
// la Fraunces itálica).
const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["500", "600"],
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
        className={`${fraunces.variable} ${karla.variable} ${cormorantGaramond.variable} ${caveat.variable} min-h-full flex flex-col font-body`}
      >
        {children}
      </body>
    </html>
  );
}
