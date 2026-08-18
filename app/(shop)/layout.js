import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

export default function ShopLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
      <CookieBanner />
    </>
  );
}
