import pandas as pd

# ==========================================
# ASUMSI PASAR (Berdasarkan Riset Anda)
# ==========================================
total_market_units = 200  # Target penjualan UTPE per tahun (asumsi)
harga_jual_normal = 4_160_000_000  # Harga Product B UTPE (Rp)
harga_jual_diskon = 3_328_000_000  # Skenario Diskon 20%

# Asumsi Margin
margin_kotor_produk = 0.25  # 25% dari harga jual adalah laba kotor
margin_financing = 0.09     # 9% bunga dari nilai pembiayaan (IMFI)
penetrasi_financing = 0.60  # 60% pelanggan menggunakan skema pembiayaan
tenor_rata_rata = 3         # 3 tahun

# ==========================================
# SKENARIO A: PRICE WAR (Status Quo)
# ==========================================
def hitung_skenario_price_war():
    unit_terjual = total_market_units * 0.8  # Asumsi volume naik 20% karena diskon
    revenue_produk = unit_terjual * harga_jual_diskon
    laba_kotor_produk = revenue_produk * margin_kotor_produk
    laba_financing = 0  # Tidak ada fokus financing
    return {
        "Skenario": "A. Price War (Diskon 20%)",
        "Unit Terjual": unit_terjual,
        "Revenue (Rp)": revenue_produk,
        "Laba Kotor Produk (Rp)": laba_kotor_produk,
        "Laba Financing (Rp)": laba_financing,
        "Total Profit (Rp)": laba_kotor_produk + laba_financing
    }

# ==========================================
# SKENARIO B: FINANCING & VALUE-ADDED (Strategi Anda)
# ==========================================
def hitung_skenario_financing():
    unit_terjual = total_market_units * 1.1  # Volume naik 10% karena skema menarik
    revenue_produk = unit_terjual * harga_jual_normal # Harga tidak didiskon
    laba_kotor_produk = revenue_produk * margin_kotor_produk
    
    # Laba dari Financing (IMFI / Astra Financial)
    nilai_pembiayaan = revenue_produk * penetrasi_financing
    laba_financing = (nilai_pembiayaan * margin_financing) * tenor_rata_rata
    
    return {
        "Skenario": "B. Financing & Value-Added",
        "Unit Terjual": unit_terjual,
        "Revenue (Rp)": revenue_produk,
        "Laba Kotor Produk (Rp)": laba_kotor_produk,
        "Laba Financing (Rp)": laba_financing,
        "Total Profit (Rp)": laba_kotor_produk + laba_financing
    }

# ==========================================
# EKSEKUSI & PERBANDINGAN
# ==========================================
hasil = [hitung_skenario_price_war(), hitung_skenario_financing()]
df = pd.DataFrame(hasil)

pd.options.display.float_format = '{:,.0f}'.format

print("="*90)
print("PERBANDINGAN STRATEGI: PRICE WAR vs FINANCING-AS-A-SERVICE")
print("="*90)
print(df.to_string(index=False))
print("="*90)

# Hitung selisih profit
profit_a = df.loc[0, "Total Profit (Rp)"]
profit_b = df.loc[1, "Total Profit (Rp)"]
selisih = profit_b - profit_a

print(f"\n💡 INSIGHT:")
print(f"Strategi Financing menghasilkan profit Rp {selisih:,.0f} LEBIH TINGGI dibanding Price War.")
print(f"Peningkatan profit: {(selisih/profit_a)*100:.1f}%")

# Simpan
df.to_csv("hasil_financial_projection.csv", index=False)
print("\n✅ Data disimpan di 'hasil_financial_projection.csv'")
