"""Module 4: proyeksi finansial (P&L, NPV).

Port dari legacy/financial_projection.py + final_validation_roadmap.py.
Membandingkan strategi Price War vs Financing-as-a-Service, plus util NPV.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from utpe import config

# Asumsi default pasar (dari script legacy).
DEFAULTS = {
    "total_market_units": 200,
    "harga_jual_normal": 4_160_000_000,
    "harga_jual_diskon": 3_328_000_000,
    "margin_kotor_produk": 0.25,
    "margin_financing": 0.09,  # bunga kotor
    "margin_financing_konservatif": 0.03,  # share margin bersih
    "penetrasi_financing": 0.60,
    "tenor_rata_rata": 3,
}


def price_war(p: dict | None = None) -> dict:
    """Skenario A: perang harga (diskon, tanpa financing)."""
    p = {**DEFAULTS, **(p or {})}
    unit = p["total_market_units"] * 0.8
    revenue = unit * p["harga_jual_diskon"]
    laba_produk = revenue * p["margin_kotor_produk"]
    return {
        "Skenario": "A. Price War (Diskon 20%)",
        "Unit_Terjual": unit,
        "Revenue": revenue,
        "Laba_Produk": laba_produk,
        "Laba_Financing": 0.0,
        "Total_Profit": laba_produk,
    }


def financing(p: dict | None = None, konservatif: bool = False) -> dict:
    """Skenario B: financing-as-a-service (harga penuh + margin kredit)."""
    p = {**DEFAULTS, **(p or {})}
    unit = p["total_market_units"] * 1.1
    revenue = unit * p["harga_jual_normal"]
    laba_produk = revenue * p["margin_kotor_produk"]
    nilai_pembiayaan = revenue * p["penetrasi_financing"]
    margin = p["margin_financing_konservatif"] if konservatif else p["margin_financing"]
    laba_financing = nilai_pembiayaan * margin * p["tenor_rata_rata"]
    label = "B. Financing (Konservatif 3%)" if konservatif else "B. Financing & Value-Added"
    return {
        "Skenario": label,
        "Unit_Terjual": unit,
        "Revenue": revenue,
        "Laba_Produk": laba_produk,
        "Laba_Financing": laba_financing,
        "Total_Profit": laba_produk + laba_financing,
    }


def compare(p: dict | None = None, konservatif: bool = False) -> pd.DataFrame:
    """Tabel perbandingan Price War vs Financing."""
    return pd.DataFrame([price_war(p), financing(p, konservatif=konservatif)])


def npv(cashflows: list[float], rate: float) -> float:
    """Net Present Value. cashflows[0] = t0 (biasanya negatif/investasi)."""
    cf = np.asarray(cashflows, dtype=float)
    t = np.arange(len(cf))
    return float((cf / (1.0 + rate) ** t).sum())


def save(df: pd.DataFrame, path=None) -> str:
    out = str(path or (config.PROCESSED_DIR / "hasil_financial_projection.csv"))
    df.to_csv(out, index=False)
    return out
