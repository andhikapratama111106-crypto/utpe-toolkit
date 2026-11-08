"""Konstanta, path, dan palette korporat UTPE.

Semua angka asumsi dasar dipusatkan di sini supaya analisis konsisten
antar-module dan mudah diaudit (lihat legacy/tco_model.py).
"""

from __future__ import annotations

from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Path proyek
# ---------------------------------------------------------------------------
PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parent

CONFIGS_DIR = PROJECT_ROOT / "configs"
GAMES_CONFIG_DIR = CONFIGS_DIR / "games"
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
OUTPUT_DIR = PROJECT_ROOT / "output"

for _d in (RAW_DIR, PROCESSED_DIR, OUTPUT_DIR):
    try:
        _d.mkdir(parents=True, exist_ok=True)
    except OSError:  # filesystem read-only (Vercel) dan folder tidak ikut di-upload
        pass

# ---------------------------------------------------------------------------
# Palette korporat UTPE
# ---------------------------------------------------------------------------
PALETTE = {
    "merah": "#C12026",
    "hitam": "#231F20",
    "abu": "#999999",
    "grid": "#E6E6E6",
}

# Urutan warna untuk chart multi-series.
CHART_COLORS = [PALETTE["merah"], PALETTE["hitam"], PALETTE["abu"]]

# ---------------------------------------------------------------------------
# Asumsi dasar TCO (default; dapat di-override lewat YAML / TCOConfig)
# ---------------------------------------------------------------------------
HARGA_SOLAR = 25_200  # Rp per liter (Pertamina Dex, Pilar 2)
KONSUMSI_BBM = 12  # liter per jam (excavator 20 ton)
UPAH_OPERATOR = 50_000  # Rp per jam

# Kolom standar output scraper.
SCRAPER_STD_COLUMNS = [
    "source_name",
    "source_url",
    "scraped_at",
    "field",
    "value",
    "unit",
    "note",
]

# Toleransi default validator (persen).
VALIDATION_TOLERANCE_PCT = 0.5


def load_yaml(path: str | Path) -> dict:
    """Baca file YAML jadi dict. Path relatif di-resolve ke configs/."""
    p = Path(path)
    if not p.is_absolute() and not p.exists():
        p = CONFIGS_DIR / path
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}
