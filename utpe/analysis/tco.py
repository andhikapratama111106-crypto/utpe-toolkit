"""Module 2: Total Cost of Ownership (TCO).

Port dari legacy/tco_model.py. Rumus dasar:
    total_tco = harga_beli + bbm + maintenance + operator
    cost_per_hour = total_tco / lifetime_jam
di mana komponen variabel = tarif_per_jam * lifetime_jam.
"""

from __future__ import annotations

import pandas as pd

from utpe import config
from utpe.models import TCOConfig

# Profil default 3 mesin (dari tco_model.py).
DEFAULT_FLEET: list[dict] = [
    {
        "merek": "Komatsu (Premium)",
        "model": "PC200-10M0",
        "harga_beli": 1_025_000_000,
        "lifetime_jam": 10_000,
        "biaya_maintenance_jam": 62_500,
    },
    {
        "merek": "SANY (China)",
        "model": "SY215C",
        "harga_beli": 600_000_000,
        "lifetime_jam": 7_000,
        "biaya_maintenance_jam": 45_000,
    },
    {
        "merek": "UTPE (Patria)",
        "model": "Product B",
        "harga_beli": 4_160_000_000,
        "lifetime_jam": 12_000,
        "biaya_maintenance_jam": 55_000,
    },
]


def compute_tco(cfg: TCOConfig) -> dict:
    """Hitung TCO satu unit. Return rincian komponen + cost per hour."""
    total_bbm = cfg.konsumsi_bbm * cfg.harga_solar * cfg.lifetime_jam
    total_maint = cfg.biaya_maintenance_jam * cfg.lifetime_jam
    total_operator = cfg.upah_operator * cfg.lifetime_jam
    total_tco = cfg.harga_beli + total_bbm + total_maint + total_operator
    cost_per_hour = total_tco / cfg.lifetime_jam
    return {
        "Merek": cfg.merek,
        "Model": cfg.model,
        "Harga_Beli": cfg.harga_beli,
        "Total_BBM": total_bbm,
        "Total_Maintenance": total_maint,
        "Total_Operator": total_operator,
        "Total_TCO": total_tco,
        "Cost_per_Hour": cost_per_hour,
    }


def cost_per_hour(harga_beli: float, lifetime_jam: float, maint_jam: float, **kw) -> float:
    """Shortcut cost-per-hour (dipakai sensitivity & Monte Carlo)."""
    cfg = TCOConfig(
        merek="",
        model="",
        harga_beli=harga_beli,
        lifetime_jam=lifetime_jam,
        biaya_maintenance_jam=maint_jam,
        **kw,
    )
    return compute_tco(cfg)["Cost_per_Hour"]


def run_fleet(fleet: list[dict] | None = None) -> pd.DataFrame:
    """Hitung TCO untuk sekumpulan mesin, return DataFrame."""
    fleet = fleet or DEFAULT_FLEET
    rows = [compute_tco(TCOConfig.from_dict(m)) for m in fleet]
    return pd.DataFrame(rows)


def save(df: pd.DataFrame, path=None) -> str:
    out = str(path or (config.PROCESSED_DIR / "hasil_tco_analysis.csv"))
    df.to_csv(out, index=False)
    return out
