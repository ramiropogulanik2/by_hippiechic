import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShopLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-sand">{children}</main>
      <Footer />
    </>
  );
}
