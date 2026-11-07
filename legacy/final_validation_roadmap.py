import pandas as pd

# ==========================================
# BAGIAN 1: VALIDASI FINANCIAL (Skenario Konservatif)
# ==========================================
print("="*90)
print("VALIDASI: SKENARIO KONSERVATIF (Margin Financing 3%)")
print("="*90)

total_market_units = 200
harga_jual_normal = 4_160_000_000
harga_jual_diskon = 3_328_000_000
margin_kotor_produk = 0.25
penetrasi_financing = 0.60
tenor_rata_rata = 3

# Skenario A: Price War
unit_a = total_market_units * 0.8
revenue_a = unit_a * harga_jual_diskon
laba_produk_a = revenue_a * margin_kotor_produk
total_a = laba_produk_a

# Skenario B: Financing (Konservatif - Margin Bersih 3%)
unit_b = total_market_units * 1.1
revenue_b = unit_b * harga_jual_normal
laba_produk_b = revenue_b * margin_kotor_produk
nilai_pembiayaan = revenue_b * penetrasi_financing
# UTPE hanya dapat share margin bersih 3% (bukan 9% bunga kotor)
laba_financing_konservatif = (nilai_pembiayaan * 0.03) * tenor_rata_rata
total_b_konservatif = laba_produk_b + laba_financing_konservatif

df_val = pd.DataFrame([
    {"Skenario": "A. Price War", "Total Profit (Rp)": total_a},
    {"Skenario": "B. Financing (Konservatif 3%)", "Total Profit (Rp)": total_b_konservatif}
])
pd.options.display.float_format = '{:,.0f}'.format
print(df_val.to_string(index=False))

selisih_konservatif = total_b_konservatif - total_a
print(f"\n💡 Selisih profit (konservatif): Rp {selisih_konservatif:,.0f}")
print(f"   Peningkatan: {(selisih_konservatif/total_a)*100:.1f}%")
print("   → Kesimpulan: Strategi Financing TETAP LEBIH UNGGUL meski margin ditekan.\n")

# ==========================================
# BAGIAN 2: IMPLEMENTATION ROADMAP & KPI
# ==========================================
print("="*90)
print("IMPLEMENTATION ROADMAP & KPI (12 BULAN)")
print("="*90)

roadmap = [
    {
        "Fase": "Q1 (Bulan 1-3)",
        "Inisiatif": "Kemitraan Financing (Astra Financial/IMFI)",
        "Aksi": "Finalisasi MoU, integrasi sistem kredit, training sales",
        "PIC": "Direktur Keuangan & Sales",
        "KPI": "MoU ditandatangani; 100% sales terlatih",
        "Target": "100% kesiapan"
    },
    {
        "Fase": "Q1 (Bulan 1-3)",
        "Inisiatif": "TCO-Based Sales Toolkit",
        "Aksi": "Buat kalkulator TCO digital & materi presentasi",
        "PIC": "Marketing & Engineering",
        "KPI": "Toolkit diluncurkan; digunakan di 50% meeting klien",
        "Target": "50% adopsi"
    },
    {
        "Fase": "Q2 (Bulan 4-6)",
        "Inisiatif": "Lead Time Reduction (Local Sourcing)",
        "Aksi": "Identifikasi 5 komponen lokal; negosiasi supplier",
        "PIC": "Supply Chain & Produksi",
        "KPI": "Lead time turun dari 10 bln ke 8 bln",
        "Target": "-20% lead time"
    },
    {
        "Fase": "Q2 (Bulan 4-6)",
        "Inisiatif": "Pilot Project Financing",
        "Aksi": "Tawarkan skema ke 20 klien eksisting",
        "PIC": "Sales & Astra Financial",
        "KPI": "10 unit terjual via skema financing",
        "Target": "10 unit"
    },
    {
        "Fase": "Q3 (Bulan 7-9)",
        "Inisiatif": "Ekspansi Segmen Konstruksi & Logistik",
        "Aksi": "Luncurkan attachment khusus untuk konstruksi & bongkar muat",
        "PIC": "R&D & Marketing",
        "KPI": "3 produk attachment baru; 5 klien baru dari sektor non-mining",
        "Target": "5 klien baru"
    },
    {
        "Fase": "Q4 (Bulan 10-12)",
        "Inisiatif": "Evaluasi & Scaling",
        "Aksi": "Review KPI, perluas skema financing, tingkatkan volume",
        "PIC": "Manajemen Puncak",
        "KPI": "60% penjualan via financing; profit +50% YoY",
        "Target": "60% penetrasi"
    }
]

df_roadmap = pd.DataFrame(roadmap)
print(df_roadmap[["Fase", "Inisiatif", "KPI", "Target"]].to_string(index=False))
df_roadmap.to_csv("implementation_roadmap.csv", index=False)
print("\n✅ Roadmap disimpan di 'implementation_roadmap.csv'")

# Simpan validasi
df_val.to_csv("validasi_konservatif.csv", index=False)
print("✅ Validasi konservatif disimpan di 'validasi_konservatif.csv'")
