# Laporan Backend API UTPE Toolkit

Entry point: `api/main.py` (sesuai `vercel.json`). Router di `api/routers/`.
Test: `tests/test_api.py` (7 test, lulus; dipanggil lewat ASGI langsung karena `httpx` tidak ada di `.venv`).
Juga lulus: `test_cli`, `test_validator`, `test_game_theory`.

| Endpoint | Metode | Status | Catatan |
|---|---|---|---|
| `/api/health` | GET | OK 200 | `{"ok": true, "version": "0.1.0"}` |
| `/api/tco` | POST | OK 200 | pakai `compute_tco` + `TCOConfig` dari `utpe.models`; input tidak valid -> 422 |
| `/api/sensitivity` | POST | OK 200 | 5 skenario + Monte Carlo (p10/p50/p90); `iterations` 1..100000 |
| `/api/projection` | POST | OK 200 | Price War vs Financing; `konservatif` true/false |
| `/api/game` | POST | OK 200 | Bertrand dari `configs/games/`; nama config dijaga dari path traversal (400) |
| `/api/validate` | GET | OK 200 | 5 cek vs angka Executive Summary, `passed: true` |

## Contoh respons

`POST /api/tco` (body: brand, model, purchase_price, lifetime_hours, maintenance_per_hour, fuel_consumption_lph, fuel_price_per_liter, operator_wage_per_hour)
```json
{"brand": "UTPE", "model": "B", "total_tco": 9048800000.0, "cost_per_hour": 754066.67}
```

`POST /api/sensitivity` `{"iterations": 1000}`
```json
{"scenarios": [{"skenario": "Baseline (Case Book)", "cost_per_hour": 754066.67}, "..."],
 "mc": {"p10": 705068.42, "p50": 755226.99, "p90": 832233.44}}
```

`POST /api/projection` `{"konservatif": true}`
```json
{"price_war": {"profit": 133120000000.0}, "financing": {"profit": 278220800000.0},
 "delta": {"absolute": 145100800000.0, "percentage": 109.0}}
```

`POST /api/game` `{}`
```json
{"players": [{"name": "UTPE", "strategies": ["Premium + Financing", "Diskon Harga"]},
             {"name": "SANY", "strategies": ["Harga Premium", "Harga Agresif"]}],
 "equilibria": [{"type": "pure", "utpe_strategy": 0, "sany_strategy": 1,
                 "payoff": [200.0, 150.0], "pareto_optimal": true}]}
```

`GET /api/validate`
```json
{"passed": true, "checks": [{"label": "Cost/hour UTPE", "csv_value": 754066.67, "expected": 754067, "status": "OK"}, "..."]}
```

## Perubahan

- `api/main.py`: ditulis ulang. Sebelumnya memanggil `calculate_tco` (tidak ada) dan hanya punya 1 route. Sekarang memasang 6 endpoint + CORS, dan menambah `api/` dan root repo ke `sys.path`.
- `api/index.py` dihapus (duplikat app; `vercel.json` hanya menunjuk `api/main.py`).
- `api/routers/game.py`: respons ditambah `players` (nama strategi); equilibrium "mixed" tidak lagi memicu KeyError (500).
- `utpe/reporting/__init__.py`: tidak lagi import `charts`/`export` secara eager. Sebelumnya `/api/validate` ikut menarik matplotlib. `from utpe.reporting import charts` tetap jalan (CLI diuji).
- `api/requirements.txt`: fastapi, pydantic>=2, pandas, numpy, pyyaml (tanpa uvicorn/matplotlib).

## Masalah / risiko

- Belum diuji di Vercel (tidak boleh deploy). Perlu dicek: Vercel mungkin membaca `pyproject.toml` di root (isi: click, requests, bs4, matplotlib) dan bukan `api/requirements.txt`. Jika build gagal/terlalu besar, itu penyebab pertama yang dicek.
- `utpe/config.py` membuat folder `data/raw`, `data/processed`, `output` saat import. Di Vercel (filesystem read-only) aman karena ketiganya sudah ada di repo (`output/` hanya berisi `validation_report.md`).
- `/api/game` hanya mendukung `game: "bertrand"`.
- `/api/validate` memakai GET.
- `tests/test_cli.py` menimpa `data/raw/pilar5_rkab.csv` (timestamp scraper); sudah dikembalikan dengan `git checkout`.
