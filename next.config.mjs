/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sin esto, Next bloquea en dev los assets/JS pedidos desde un origin
  // distinto al que arrancó el server (solo localhost por defecto). La página
  // carga igual (SSR), pero el JS de hidratación no, y por eso ningún botón
  // responde al abrir el sitio desde el celular por la IP de LAN.
  allowedDevOrigins: ["192.168.0.198"],
  images: {
    remotePatterns: [
      // Placeholders del hero mientras no haya fotos reales.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage: de ahí van a salir las fotos de productos.
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
