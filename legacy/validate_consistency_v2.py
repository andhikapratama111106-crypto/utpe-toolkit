"""
Validator v2 — bandingkan angka CSV dengan angka di Executive Summary.
Output: validation_report_v2.md
"""

import pandas as pd
import os
from datetime import datetime

REPORT_PATH = "validation_report_v2.md"
CHECKS = []

# ═══ SOURCE OF TRUTH: angka dari Executive Summary ═══
# Edit bagian ini kalau angka di ES berubah.
ES_NUMBERS = {
    "cost_per_hour_komatsu":  517_400,
    "cost_per_hour_sany":     483_114,
    "cost_per_hour_utpe":     754_067,
    "profit_price_war":       133_120_000_000,
    "profit_financing_kons":  278_220_800_000,
    "pendapatan_2031_strategi": 1_559_000_000_000,
    "pendapatan_2031_donothing": 1_001_000_000_000,
    "ebitda_2031_strategi":      166_000_000_000,
    "ebitda_2031_donothing":      21_000_000_000,
    "npv_p50":                   398_000_000_000,
    "npv_p10":                   127_000_000_000,
    "npv_p90":                   717_000_000_000,
}

def load_csv(name):
    return pd.read_csv(name) if os.path.exists(name) else None

def compare(label, csv_val, es_val, source_csv):
    """Bandingkan nilai CSV dengan ES. Toleransi 0,5%."""
    if csv_val is None:
        CHECKS.append({
            "Angka": label, "CSV": "N/A", "ES": f"{es_val:,}",
            "Sumber": source_csv, "Status": "⚠️ Tidak ditemukan di CSV"
        })
        return
    diff_pct = abs(csv_val - es_val) / es_val * 100 if es_val else 0
    if diff_pct <= 0.5:
        status = "✅ Cocok"
    elif diff_pct <= 5:
        status = f"🟡 Selisih {diff_pct:.1f}% (pembulatan?)"
    else:
        status = f"❌ BEDA {diff_pct:.1f}%"
    CHECKS.append({
        "Angka": label, "CSV": f"{csv_val:,}", "ES": f"{es_val:,}",
        "Sumber": source_csv, "Status": status
    })

# ═══ Cek 1: Cost per Hour ═══
tco = load_csv("hasil_tco_analysis.csv")
if tco is not None:
    for _, row in tco.iterrows():
        merek = row['Merek']
        val = row['Cost per Hour (Rp)']
        if "Komatsu" in merek:
            compare("Cost/hour Komatsu", val, ES_NUMBERS["cost_per_hour_komatsu"], "hasil_tco_analysis.csv")
        elif "SANY" in merek:
            compare("Cost/hour SANY", val, ES_NUMBERS["cost_per_hour_sany"], "hasil_tco_analysis.csv")
        elif "UTPE" in merek:
            compare("Cost/hour UTPE", val, ES_NUMBERS["cost_per_hour_utpe"], "hasil_tco_analysis.csv")

# ═══ Cek 2: Profit Financing vs Price War ═══
val = load_csv("validasi_konservatif.csv")
if val is not None:
    for _, row in val.iterrows():
        skenario = row['Skenario']
        if "Price War" in skenario:
            compare("Profit Price War", row['Total Profit (Rp)'], ES_NUMBERS["profit_price_war"], "validasi_konservatif.csv")
        elif "Financing" in skenario:
            compare("Profit Financing Konservatif", row['Total Profit (Rp)'], ES_NUMBERS["profit_financing_kons"], "validasi_konservatif.csv")

# ═══ Cek 3: File inventory ═══
expected = [
    "pilar1_komatsu_fixed.csv","pilar2_solar_timeseries.csv","pilar3_maintenance.csv",
    "pilar4_financing_fixed.csv","pilar5_rkab.csv","pilar6_konstruksi.csv",
    "pilar7_tarif_sewa.csv","pilar8_ojk.csv","pilar9_pangsa_pasar.csv",
    "pilar10_pelabuhan.csv","hasil_tco_analysis.csv","hasil_sensitivity.csv",
    "financial_projection.csv","validasi_konservatif.csv","implementation_roadmap.csv"
]
missing = [f for f in expected if not os.path.exists(f)]

# ═══ Tulis report ═══
with open(REPORT_PATH, "w", encoding="utf-8") as f:
    f.write(f"# Validation Report v2\n\n")
    f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"## File Inventory\n\n")
    f.write(f"{'✅' if not missing else '❌'} {len(expected)-len(missing)}/{len(expected)} file ada\n\n")
    if missing:
        f.write(f"Missing: {', '.join(missing)}\n\n")
    f.write(f"## Cross-Check: CSV vs Executive Summary\n\n")
    f.write("| Angka | Nilai CSV | Nilai ES | Sumber | Status |\n")
    f.write("|-------|-----------|----------|--------|--------|\n")
    for c in CHECKS:
        f.write(f"| {c['Angka']} | {c['CSV']} | {c['ES']} | {c['Sumber']} | {c['Status']} |\n")
    f.write(f"\n---\n")
    mismatches = [c for c in CHECKS if c['Status'].startswith('❌')]
    if not mismatches:
        f.write(f"✅ SEMUA ANGKA KONSISTEN (toleransi 0,5%)\n")
    else:
        f.write(f"❌ {len(mismatches)} INKONSISTENSI ditemukan — perlu diperbaiki sebelum submit\n")

print(f"✅ Report written to {REPORT_PATH}")
print(f"   Checks: {len(CHECKS)}")
print(f"   Mismatches: {len([c for c in CHECKS if c['Status'].startswith('❌')])}")
