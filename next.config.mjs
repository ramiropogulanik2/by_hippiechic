/** @type {import('next').NextConfig} */
const nextConfig = {
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
