"""Module 6a: validator konsistensi angka.

Port dari legacy/validate_consistency_v2.py. Membandingkan angka hasil
analisis (CSV) dengan source-of-truth (Executive Summary) dengan toleransi.
"""

from __future__ import annotations

from dataclasses import dataclass

from utpe import config

# Source of truth: angka Executive Summary (dari script legacy).
ES_NUMBERS: dict[str, float] = {
    "cost_per_hour_komatsu": 517_400,
    "cost_per_hour_sany": 483_114,
    "cost_per_hour_utpe": 754_067,
    "profit_price_war": 133_120_000_000,
    "profit_financing_kons": 278_220_800_000,
    "npv_p50": 398_000_000_000,
    "npv_p10": 127_000_000_000,
    "npv_p90": 717_000_000_000,
}


@dataclass
class CheckResult:
    label: str
    csv_value: float | None
    es_value: float
    status: str
    diff_pct: float | None = None


def compare(
    label: str,
    csv_val: float | None,
    es_val: float,
    tol_pct: float = config.VALIDATION_TOLERANCE_PCT,
) -> CheckResult:
    """Bandingkan satu nilai. Status: cocok / selisih / beda / hilang."""
    if csv_val is None:
        return CheckResult(label, None, es_val, "MISSING")
    diff_pct = abs(csv_val - es_val) / es_val * 100 if es_val else 0.0
    if diff_pct <= tol_pct:
        status = "OK"
    elif diff_pct <= 5:
        status = "WARN"
    else:
        status = "FAIL"
    return CheckResult(label, csv_val, es_val, status, diff_pct)


def validate_tco(df, rules: dict | None = None) -> list[CheckResult]:
    """Cek cost-per-hour per merek dari DataFrame TCO."""
    rules = rules or ES_NUMBERS
    results = []
    for _, row in df.iterrows():
        merek = str(row.get("Merek", ""))
        val = row.get("Cost_per_Hour")
        if "Komatsu" in merek:
            results.append(compare("Cost/hour Komatsu", val, rules["cost_per_hour_komatsu"]))
        elif "SANY" in merek:
            results.append(compare("Cost/hour SANY", val, rules["cost_per_hour_sany"]))
        elif "UTPE" in merek:
            results.append(compare("Cost/hour UTPE", val, rules["cost_per_hour_utpe"]))
    return results


def validate_projection(df, rules: dict | None = None) -> list[CheckResult]:
    """Cek total profit per skenario dari DataFrame proyeksi finansial.

    Melengkapi validate_tco: 2 angka profit Executive Summary (Price War &
    Financing Konservatif) yang tidak ada di DataFrame TCO.
    """
    rules = rules or ES_NUMBERS
    results = []
    for _, row in df.iterrows():
        skenario = str(row.get("Skenario", ""))
        val = row.get("Total_Profit")
        if "Price War" in skenario:
            results.append(compare("Profit Price War", val, rules["profit_price_war"]))
        elif "Financing" in skenario:
            results.append(
                compare("Profit Financing Konservatif", val, rules["profit_financing_kons"])
            )
    return results


def summarize(results: list[CheckResult]) -> dict:
    """Ringkas jumlah OK/WARN/FAIL/MISSING."""
    counts = {"OK": 0, "WARN": 0, "FAIL": 0, "MISSING": 0}
    for r in results:
        counts[r.status] = counts.get(r.status, 0) + 1
    counts["total"] = len(results)
    counts["consistent"] = counts["FAIL"] == 0 and counts["MISSING"] == 0
    return counts
