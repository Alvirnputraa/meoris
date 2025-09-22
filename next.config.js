/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Izinkan gambar dari Supabase Storage (public dan signed URLs)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vtwooclhjobgdgvljauq.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
    // Atau bisa pakai opsi sederhana berikut (pilih salah satu pendekatan):
    // domains: ['vtwooclhjobgdgvljauq.supabase.co'],
  },
};

module.exports = nextConfig;

