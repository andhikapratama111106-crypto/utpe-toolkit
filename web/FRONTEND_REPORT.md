# Frontend Report

Status: selesai. `npm run build` lulus (Next.js 16.4.5, Turbopack, TypeScript strict). Tidak ada deploy.

## Stack
Next.js App Router + TypeScript, framer-motion 14, Recharts 3. CSS biasa dengan design token di `src/app/globals.css` (tanpa Tailwind). Font memakai SF/system stack, jadi build tidak butuh jaringan. Dark mode default (`data-theme="dark"`), ada tombol ke mode terang yang disimpan di localStorage. `MotionConfig reducedMotion="user"` menghormati pengaturan reduce-motion.

## Halaman (6)
| Route | Isi | API |
|-------|-----|-----|
| `/` | 4 angka kunci dengan count-up, tautan ke modul | `/api/health` (di nav) |
| `/tco` | Cost/jam 3 unit, bar chart, komposisi biaya, kalkulator UTPE (slider) | `POST /api/tco` |
| `/sensitivity` | 5 skenario, Monte Carlo P10/P50/P90 (pilih 1.000 / 10.000 / 50.000 iterasi) | `POST /api/sensitivity` |
| `/projection` | Price War vs Financing, selisih, NPV P10/P50/P90 | `POST /api/projection` |
| `/game-theory` | Matriks payoff, sel Nash, payoff per kombinasi | `POST /api/game` |
| `/validate` | Tabel cek terhadap Executive Summary | `GET /api/validate` |

Angka kunci tampil: UTPE Cost/hour 754.067; Profit Financing 278 M; NPV P50 398 M; Nash (200, 150). Sudah dicek di HTML hasil prerender.

## Fallback
`src/lib/api.ts` (`useLive`): render awal memakai data statis (`src/lib/data.ts`, dari `configs/`, `data/processed/`, `output/validation_report.md`). Lalu fetch ke `/api/*` dengan timeout 8 detik. Jika gagal, bukan 2xx, atau bentuk respons salah (guard manual), halaman tetap memakai data statis. Lencana "Data live dari API" / "Data statis (API belum siap)" menunjukkan sumbernya. Kalkulator TCO memakai rumus lokal bila API gagal.

Dev lokal: `API_PROXY_URL=http://127.0.0.1:8000 npm run dev` meneruskan `/api/*` ke backend (rewrite di `next.config.mjs`, nonaktif bila variabel kosong).

## Masalah dan konflik
1. **`vercel.json` tidak membangun `web/`.** File itu hanya punya build `api/main.py` (`@vercel/python`) dan route `/api/(.*)` ke `api/main.py`. Tidak ada build Next.js, jadi frontend tidak akan ikut ter-deploy. Tidak saya ubah. Usulan (butuh persetujuan, karena menyentuh konfigurasi deploy):
   ```json
   {
     "builds": [
       { "src": "web/package.json", "use": "@vercel/next" },
       { "src": "api/main.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "api/main.py" },
       { "src": "/(.*)", "dest": "web/$1" }
     ]
   }
   ```
   Alternatif: Vercel project terpisah untuk `web/` (Root Directory `web`) dan set `API_PROXY_URL` ke URL backend.
2. **Entry point backend.** `vercel.json` menunjuk `api/main.py`, tetapi aplikasi FastAPI dengan semua router (`/api/health`, `/api/tco`, ...) ada di `api/index.py`; `api/main.py` hanya punya `/` dan `/api/tco` versi lama. Perlu diselaraskan oleh pemilik `api/` (saya tidak mengubah `api/`).
3. **NPV tidak ada di API.** Tidak ada endpoint yang menghitung NPV. NPV P10/P50/P90 (127 / 398 / 717 M) diambil dari `configs/validation_rules.yaml` (Executive Summary) dan diberi label sumbernya di halaman Projection. `mc` dari `/api/sensitivity` adalah percentile cost/jam, bukan NPV.
4. **Tabrakan di `web/`.** Saat saya mulai, `web/` sudah dibuat pihak lain (scaffold `create-next-app` dengan Tailwind, radix, lucide, dan `next.config.ts` aneh berisi `cacheComponents` serta loader `@tailwindcss/turbopack`), padahal tugas menyebut folder belum ada. Penulisan `package.json`, `tsconfig.json`, `.gitignore`, `next.config.mjs` saya menimpa file itu, dan `npm install` memangkas dependensi yang tidak dipakai. Saya hapus `next.config.ts`, `eslint.config.mjs`, README, aset boilerplate, lalu membangun ulang di atasnya. Bila pihak lain masih bekerja di `web/`, hasilnya perlu dikoordinasikan.
5. Fallback Monte Carlo hanya untuk n=10.000 (seed 42); untuk n lain tanpa API, angkanya tetap sama.
6. Peringatan build: Next mengabaikan `package-lock.json` di `/Users/andhikapratama` (di luar repo git). Tidak mempengaruhi hasil; bisa diatasi dengan `turbopack.root` atau menghapus lockfile liar itu.

## Belum dicek
Belum diuji dengan backend hidup (hanya fallback statis dan HTML prerender) dan belum dilihat di browser. Tidak ada lint (ESLint tidak dipasang) atau test frontend.
