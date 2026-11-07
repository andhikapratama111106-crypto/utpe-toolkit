import pandas as pd
import numpy as np

# --- Asumsi Dasar (Sama seperti sebelumnya) ---
HARGA_SOLAR = 25200
KONSUMSI_BBM = 12
UPAH_OPERATOR = 50000

# --- Fungsi untuk menghitung Cost per Hour ---
def hitung_cph(harga_beli, lifetime_jam, maint_jam):
    total_bbm = KONSUMSI_BBM * HARGA_SOLAR * lifetime_jam
    total_maint = maint_jam * lifetime_jam
    total_operator = UPAH_OPERATOR * lifetime_jam
    total_tco = harga_beli + total_bbm + total_maint + total_operator
    return total_tco / lifetime_jam

# --- Baseline Kompetitor (SANY) ---
sany_cph = hitung_cph(600_000_000, 7000, 45000)
print(f"Baseline SANY Cost per Hour: Rp {sany_cph:,.0f}\n")

# --- Simulasi UTPE ---
skenario = []

# 1. Baseline UTPE (Data Case Book)
cph_base = hitung_cph(4_160_000_000, 12000, 55000)
skenario.append({"Skenario": "Baseline (Data Case Book)", "Harga": 4160000000, "Lifetime_Jam": 12000, "Cost_per_Hour": cph_base})

# 2. UTPE Diskon 20% (Harga jadi 3.32 M)
cph_diskon = hitung_cph(4_160_000_000 * 0.8, 12000, 55000)
skenario.append({"Skenario": "Diskon Harga 20%", "Harga": 3328000000, "Lifetime_Jam": 12000, "Cost_per_Hour": cph_diskon})

# 3. UTPE Lifetime 15.000 Jam (Engineering membuktikan durability)
cph_lifetime = hitung_cph(4_160_000_000, 15000, 55000)
skenario.append({"Skenario": "Lifetime 15.000 Jam", "Harga": 4160000000, "Lifetime_Jam": 15000, "Cost_per_Hour": cph_lifetime})

# 4. Kombinasi Diskon 20% + Lifetime 15.000 Jam
cph_kombinasi = hitung_cph(4_160_000_000 * 0.8, 15000, 55000)
skenario.append({"Skenario": "Diskon 20% + Lifetime 15.000 Jam", "Harga": 3328000000, "Lifetime_Jam": 15000, "Cost_per_Hour": cph_kombinasi})

# 5. Kombinasi Ekstrem: Diskon 30% + Maintenance Turun jadi Rp 40.000
cph_ekstrem = hitung_cph(4_160_000_000 * 0.7, 15000, 40000)
skenario.append({"Skenario": "Diskon 30% + Maint Rp 40k + Lifetime 15rb", "Harga": 2912000000, "Lifetime_Jam": 15000, "Cost_per_Hour": cph_ekstrem})

# --- Tampilkan Hasil ---
df_sens = pd.DataFrame(skenario)
pd.options.display.float_format = '{:,.0f}'.format

print("="*80)
print("HASIL SENSITIVITY ANALYSIS UTPE")
print("="*80)
print(df_sens[["Skenario", "Harga", "Lifetime_Jam", "Cost_per_Hour"]].to_string(index=False))
print("="*80)

# Simpan ke CSV
df_sens.to_csv("hasil_sensitivity.csv", index=False)
print("\n✅ Data disimpan di 'hasil_sensitivity.csv'")
