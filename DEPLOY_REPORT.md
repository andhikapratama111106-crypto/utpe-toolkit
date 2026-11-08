# Deploy Report

LANGKAH 1 - Integrasi lokal: 6/6 halaman 200 (/, /tco, /sensitivity, /projection, /game-theory, /validate). Backend :8000 sudah hidup; /api/health, /api/validate, POST /api/tco lewat proxy Next (API_PROXY_URL) = 200. Frontend memakai path relatif `/api/*` (web/src/lib/api.ts), tanpa hardcode localhost:8000, jadi tidak ada refactor. NEXT_PUBLIC_API_URL tidak dipakai kode. `web/.env.local` dibuat untuk tes, lalu dihapus.

LANGKAH 2 - Config:
- vercel.json versi pengguna (buildCommand/outputDirectory/functions runtime/rewrites) ditulis persis, lalu DIGANTI karena Vercel gagal: "No Next.js version detected" (package.json ada di web/, bukan root). Final: `builds` = @vercel/next (web/package.json) + @vercel/python (api/main.py, maxLambdaSize 250mb); `routes` = /api/(.*) -> api/main.py, /(.*) -> web/$1. Field `regions`, `functions.runtime`, `memory` dibuang.
- .vercelignore: persis versi pengguna.
- api/requirements.txt: fastapi, uvicorn[standard], pydantic>=2.0, pandas, numpy, pyyaml (uvicorn ditambah).
- web/.env.production: `NEXT_PUBLIC_API_URL=` (kosong).
- utpe/config.py: mkdir data/raw, data/processed, output dibungkus try/except OSError. Sebab: .vercelignore membuang data/raw/ dan output/ (folder kosong tidak terunggah), dan filesystem Vercel read-only, jadi import `utpe` akan gagal.
- Pengaturan project Vercel: Preview Comments / Production Feedback dimatikan (PATCH enablePreviewFeedback=false, enableProductionFeedback=false). Sebab: deploy gagal dengan "Cannot patch preview comments when immutable static file upload is enabled" (Next 16.4.5).
- `vercel link` menambah `.vercel` dan `.env*` ke .gitignore dan menulis .env.local berisi token OIDC; file .env.local itu saya hapus setelah tiap perintah vercel.

LANGKAH 3 - Preview: https://utpe-toolkit-i2yyqapp3-andhikas-projects-78668db3.vercel.app , build sukses. Tanpa login = 302 (Vercel Authentication). Lewat `vercel curl`: /, /tco, /api/health = 200.

LANGKAH 4 - Production: https://utpe-toolkit.vercel.app (deployment: https://utpe-toolkit-fazjblpr5-andhikas-projects-78668db3.vercel.app)

LANGKAH 5 - Smoke test: 6/6 halaman 200. API health {"ok":true,"version":"0.1.0"} 200. validate {"passed":true,"checks":[{"label":"Cost/hour Komatsu",...}]} 200. tco {"brand":"UTPE","model":"Product B","total_tco":9048800000.0,"cost_per_hour":754066.6666666666} 200 (body pengguna diterima, tanpa 422).

URL PRODUCTION: https://utpe-toolkit.vercel.app

MASALAH:
- Tidak ada commit git. Perubahan belum di-commit: vercel.json, .vercelignore, api/requirements.txt, web/.env.production, utpe/config.py, .gitignore (oleh vercel link).
- Preview dilindungi Vercel Authentication (302 tanpa login). Production publik.
- Server dev lokal sudah dihentikan.
- Log: $KIROCREW_SCRATCH/vercel-preview.log, vercel-prod.log.
