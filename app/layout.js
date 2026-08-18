import { Cormorant_Garamond, Work_Sans, Caveat } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

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

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className="h-full scroll-smooth antialiased"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${cormorantGaramond.variable} ${workSans.variable} ${caveat.variable} min-h-full flex flex-col font-body`}
      >
        {children}
      </body>
    </html>
  );
}
