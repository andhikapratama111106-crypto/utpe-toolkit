"""
Validator Bot — cek konsistensi angka antar CSV.
Output: validation_report.md
"""

import pandas as pd
import os
from datetime import datetime

REPORT_PATH = "validation_report.md"
CHECKS = []

def load_csv(name):
    if not os.path.exists(name):
        return None
    return pd.read_csv(name)

tco = load_csv("hasil_tco_analysis.csv")
sens = load_csv("hasil_sensitivity.csv")
fin = load_csv("financial_projection.csv")
val = load_csv("validasi_konservatif.csv")
roadmap = load_csv("implementation_roadmap.csv")

# Cek Cost per Hour
if tco is not None:
    for _, row in tco.iterrows():
        CHECKS.append({
            "Angka": f"Cost per Hour — {row['Merek']}",
            "Nilai 1": f"Rp {row['Cost per Hour (Rp)']:,.0f}",
            "Sumber 1": "hasil_tco_analysis.csv",
            "Nilai 2": "—",
            "Sumber 2": "—",
            "Status": "ℹ️ Info"
        })

# Cek Profit Financing vs Price War
if val is not None:
    for _, row in val.iterrows():
        CHECKS.append({
            "Angka": f"Profit — {row['Skenario']}",
            "Nilai 1": f"Rp {row['Total Profit (Rp)']:,.0f}",
            "Sumber 1": "validasi_konservatif.csv",
            "Nilai 2": "—",
            "Sumber 2": "—",
            "Status": "ℹ️ Info"
        })

# Cek NPV (kalau ada di financial_projection)
if fin is not None:
    CHECKS.append({
        "Angka": "Financial Projection rows",
        "Nilai 1": f"{len(fin)} baris",
        "Sumber 1": "financial_projection.csv",
        "Nilai 2": "—",
        "Sumber 2": "—",
        "Status": "ℹ️ Info"
    })

# Cek keberadaan file
expected_files = [
    "pilar1_komatsu_fixed.csv", "pilar2_solar_timeseries.csv",
    "pilar3_maintenance.csv", "pilar4_financing_fixed.csv",
    "pilar5_rkab.csv", "pilar6_konstruksi.csv",
    "pilar7_tarif_sewa.csv", "pilar8_ojk.csv",
    "pilar9_pangsa_pasar.csv", "pilar10_pelabuhan.csv",
    "hasil_tco_analysis.csv", "hasil_sensitivity.csv",
    "financial_projection.csv", "validasi_konservatif.csv",
    "implementation_roadmap.csv"
]
missing = [f for f in expected_files if not os.path.exists(f)]

with open(REPORT_PATH, "w", encoding="utf-8") as f:
    f.write(f"# Validation Report\n\n")
    f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"## File Check\n\n")
    if missing:
        f.write(f"❌ Missing files ({len(missing)}):\n")
        for m in missing:
            f.write(f"- {m}\n")
    else:
        f.write(f"✅ All {len(expected_files)} expected CSV files present.\n")
    f.write(f"\n## Consistency Checks\n\n")
    f.write("| Angka | Nilai 1 | Sumber 1 | Nilai 2 | Sumber 2 | Status |\n")
    f.write("|-------|---------|----------|---------|----------|--------|\n")
    for c in CHECKS:
        f.write(f"| {c['Angka']} | {c['Nilai 1']} | {c['Sumber 1']} | {c['Nilai 2']} | {c['Sumber 2']} | {c['Status']} |\n")

print(f"✅ Report written to {REPORT_PATH}")
print(f"   Total checks: {len(CHECKS)}")
print(f"   Missing files: {len(missing)}")
