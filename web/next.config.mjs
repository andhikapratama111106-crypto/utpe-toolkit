// Dev lokal: set API_PROXY_URL=http://127.0.0.1:8000 (uvicorn api.index:app) agar /api/* diteruskan ke backend Python.
// Di Vercel, /api/* ditangani langsung oleh vercel.json, jadi rewrite ini tidak aktif.
const proxy = process.env.API_PROXY_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // vercel.json memakai `builds` + rute ke web/$1; aset /_next/static/immutable/* tidak terjangkau (404).
  supportsImmutableAssets: false,
  async rewrites() {
    return proxy ? [{ source: "/api/:path*", destination: `${proxy}/api/:path*` }] : [];
  },
};

export default nextConfig;
