import pandas as pd

# ==========================================
# 1. DEFINISI ASUMSI DASAR (Berdasarkan Data Riset)
# ==========================================
# Harga BBM Solar Industri (Pilar 2 - Pertamina Dex Sept 2026)
HARGA_SOLAR = 25200  # Rp per liter
KONSUMSI_BBM = 12    # Liter per jam (standar excavator 20 ton)
UPAH_OPERATOR = 50000 # Rp per jam (asumsi standar)

# Data Profil Mesin
mesin_data = [
    {
        "Merek": "Komatsu (Premium)",
        "Model": "PC200-10M0",
        "Harga_Beli": 1025000000,  # Pilar 1
        "Estimasi_Lifetime_Jam": 10000, # Asumsi alat premium
        "Biaya_Maintenance_Jam": 62500  # Pilar 3
    },
    {
        "Merek": "SANY (China)",
        "Model": "SY215C",
        "Harga_Beli": 600000000,   # Dari scraping SmartBid (bekas 2022) / Estimasi baru
        "Estimasi_Lifetime_Jam": 7000,  # Asumsi lifetime lebih pendek
        "Biaya_Maintenance_Jam": 45000  # Asumsi biaya part lebih murah
    },
    {
        "Merek": "UTPE (Patria)",
        "Model": "Product B",
        "Harga_Beli": 4160000000,  # Dari Case Book Halaman 8
        "Estimasi_Lifetime_Jam": 12000, # Asumsi engineering unggul
        "Biaya_Maintenance_Jam": 55000  # Asumsi biaya part menengah
    }
]

# ==========================================
# 2. KALKULASI TCO
# ==========================================
hasil_tco = []

for mesin in mesin_data:
    # Hitung biaya variabel selama lifetime
    total_biaya_bbm = KONSUMSI_BBM * HARGA_SOLAR * mesin["Estimasi_Lifetime_Jam"]
    total_biaya_maint = mesin["Biaya_Maintenance_Jam"] * mesin["Estimasi_Lifetime_Jam"]
    total_biaya_operator = UPAH_OPERATOR * mesin["Estimasi_Lifetime_Jam"]
    
    # Total Cost of Ownership
    total_tco = (
        mesin["Harga_Beli"] + 
        total_biaya_bbm + 
        total_biaya_maint + 
        total_biaya_operator
    )
    
    # Cost per Hour (Biaya per jam operasional)
    cost_per_hour = total_tco / mesin["Estimasi_Lifetime_Jam"]
    
    hasil_tco.append({
        "Merek": mesin["Merek"],
        "Model": mesin["Model"],
        "Harga_Beli (Rp)": mesin["Harga_Beli"],
        "Total BBM (Rp)": total_biaya_bbm,
        "Total Maintenance (Rp)": total_biaya_maint,
        "Total Operator (Rp)": total_biaya_operator,
        "Total TCO (Rp)": total_tco,
        "Cost per Hour (Rp)": cost_per_hour
    })

# ==========================================
# 3. OUTPUT & SIMPAN
# ==========================================
df_tco = pd.DataFrame(hasil_tco)

# Format angka agar mudah dibaca
pd.options.display.float_format = '{:,.0f}'.format

print("\n" + "="*80)
print("HASIL ANALISIS TOTAL COST OF OWNERSHIP (TCO)")
print("="*80)
print(df_tco[["Merek", "Harga_Beli (Rp)", "Total TCO (Rp)", "Cost per Hour (Rp)"]].to_string(index=False))
print("="*80)

# Simpan ke CSV
df_tco.to_csv("hasil_tco_analysis.csv", index=False)
print("\n✅ Data TCO lengkap disimpan di 'hasil_tco_analysis.csv'")
print("Silakan buka file tersebut untuk melihat rincian BBM, Maintenance, dll.")

