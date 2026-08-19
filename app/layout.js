import { Fraunces, Karla } from "next/font/google";
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
        className={`${fraunces.variable} ${karla.variable} min-h-full flex flex-col font-body`}
      >
        {children}
      </body>
    </html>
  );
}
