export default function Footer() {
  return (
    <footer className="bg-ink text-sand">
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
