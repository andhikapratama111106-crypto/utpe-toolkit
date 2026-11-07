"""Module 3: sensitivity analysis + Monte Carlo.

Port dari legacy/sensitivity_analysis.py, ditambah simulasi Monte Carlo
untuk cost-per-hour dengan parameter tak pasti.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from utpe import config
from utpe.analysis.tco import cost_per_hour

# Skenario deterministik UTPE (dari script legacy).
DEFAULT_SCENARIOS: list[dict] = [
    {
        "Skenario": "Baseline (Case Book)",
        "harga": 4_160_000_000,
        "lifetime": 12_000,
        "maint": 55_000,
    },
    {"Skenario": "Diskon Harga 20%", "harga": 3_328_000_000, "lifetime": 12_000, "maint": 55_000},
    {
        "Skenario": "Lifetime 15.000 Jam",
        "harga": 4_160_000_000,
        "lifetime": 15_000,
        "maint": 55_000,
    },
    {
        "Skenario": "Diskon 20% + Lifetime 15rb",
        "harga": 3_328_000_000,
        "lifetime": 15_000,
        "maint": 55_000,
    },
    {
        "Skenario": "Diskon 30% + Maint 40k + Lifetime 15rb",
        "harga": 2_912_000_000,
        "lifetime": 15_000,
        "maint": 40_000,
    },
]


def run_scenarios(scenarios: list[dict] | None = None) -> pd.DataFrame:
    """Hitung cost-per-hour untuk tiap skenario deterministik."""
    scenarios = scenarios or DEFAULT_SCENARIOS
    rows = []
    for s in scenarios:
        cph = cost_per_hour(s["harga"], s["lifetime"], s["maint"])
        rows.append(
            {
                "Skenario": s["Skenario"],
                "Harga": s["harga"],
                "Lifetime_Jam": s["lifetime"],
                "Maint_Jam": s["maint"],
                "Cost_per_Hour": cph,
            }
        )
    return pd.DataFrame(rows)


def monte_carlo(
    harga_mean: float = 4_160_000_000,
    harga_sd: float = 200_000_000,
    lifetime_mean: float = 12_000,
    lifetime_sd: float = 1_500,
    maint_mean: float = 55_000,
    maint_sd: float = 5_000,
    n: int = 10_000,
    seed: int | None = 42,
) -> dict:
    """Simulasi Monte Carlo cost-per-hour.

    Parameter di-sample dari distribusi normal (di-clip agar positif).
    Return ringkasan percentile P10/P50/P90 + array hasil.
    """
    rng = np.random.default_rng(seed)
    harga = np.clip(rng.normal(harga_mean, harga_sd, n), 1.0, None)
    lifetime = np.clip(rng.normal(lifetime_mean, lifetime_sd, n), 1.0, None)
    maint = np.clip(rng.normal(maint_mean, maint_sd, n), 0.0, None)

    total_bbm = config.KONSUMSI_BBM * config.HARGA_SOLAR * lifetime
    total_maint = maint * lifetime
    total_operator = config.UPAH_OPERATOR * lifetime
    total_tco = harga + total_bbm + total_maint + total_operator
    cph = total_tco / lifetime

    return {
        "n": n,
        "mean": float(cph.mean()),
        "p10": float(np.percentile(cph, 10)),
        "p50": float(np.percentile(cph, 50)),
        "p90": float(np.percentile(cph, 90)),
        "samples": cph,
    }


def save(df: pd.DataFrame, path=None) -> str:
    out = str(path or (config.PROCESSED_DIR / "hasil_sensitivity.csv"))
    df.to_csv(out, index=False)
    return out
