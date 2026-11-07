# utpe

Toolkit analisis bisnis alat berat untuk kasus UTPE (PT United Tractors Pandu
Engineering) / PATRIA. Menghadapi penurunan permintaan akibat RKAB 2026 dan
kompetitor China (SANY/XCMG), toolkit ini mengumpulkan data pasar, menghitung
TCO, menguji sensitivity & Monte Carlo, memproyeksikan finansial, memodelkan
interaksi strategis (game theory), lalu memvalidasi dan membuat laporan.

## Instalasi

Butuh Python >= 3.10.

```bash
cd utpe-toolkit
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Penggunaan CLI

```bash
utpe --help                 # daftar perintah
utpe scrape --all           # jalankan 10 scraper -> data/raw/
utpe scrape rkab            # satu scraper saja
utpe tco --chart            # TCO armada + bar chart
utpe sensitivity --monte-carlo --n 10000
utpe project --konservatif  # Price War vs Financing
utpe game bertrand          # bertrand | stackelberg | entry
utpe validate               # cek konsistensi -> output/validation_report.md
utpe pipeline               # seluruh alur sekaligus
```

## Struktur

| Module | Lokasi | Fungsi |
|--------|--------|--------|
| 1. Scrapers | `utpe/scrapers/` | 10 sumber data pasar, output CSV terstandar |
| 2. TCO | `utpe/analysis/tco.py` | Total Cost of Ownership per unit |
| 3. Sensitivity | `utpe/analysis/sensitivity.py` | Skenario + Monte Carlo |
| 4. Proyeksi | `utpe/analysis/projection.py` | P&L, NPV, Price War vs Financing |
| 5. Game theory | `utpe/analysis/game_theory/` | Bertrand, Stackelberg, entry, mechanism |
| 6. Reporting | `utpe/reporting/` | Validator, charts, export markdown |

Konfigurasi ada di `configs/` (YAML). Data mentah legacy ada di `data/raw/`,
hasil analisis ditulis ke `data/processed/`, chart & laporan ke `output/`.
Script lama ada di `legacy/` sebagai referensi read-only.

## Testing

```bash
pytest
```

## Catatan port

Angka asumsi dan rumus dipindahkan apa adanya dari script legacy
(`legacy/*.py`). Scraper punya fallback data riset sehingga tetap jalan
offline. Scraper `smartbid` dan seluruh module game theory ditambahkan sesuai
struktur target karena belum ada di script legacy.
