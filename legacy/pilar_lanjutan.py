import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
}

def log(msg):
    print(f"[*] {msg}")

# ==========================================
# PILAR 1: Struktur Pasar Konstruksi (Injeksi Data)
# ==========================================
def pilar_konstruksi():
    log("Memproses Pilar 1: Pasar Konstruksi Indonesia...")
    data = [
        {"Tahun": 2025, "Unit_Terjual": 21694, "Nilai_Pasar_USD_Miliar": 3.41, "Catatan": "Baseline pasar"},
        {"Tahun": 2026, "Unit_Terjual": 23000, "Nilai_Pasar_USD_Miliar": 3.62, "Catatan": "Proyeksi (termasuk IKN & jalan desa)"},
        {"Tahun": 2031, "Unit_Terjual": 31920, "Nilai_Pasar_USD_Miliar": 4.89, "Catatan": "Proyeksi CAGR 6.65%"},
        {"Tahun": 2026, "Unit_Terjual": 0, "Nilai_Pasar_USD_Miliar": 0, "Catatan": "IKN: 215 proyek jalan desa, 6900 jembatan"}
    ]
    df = pd.DataFrame(data)
    df.to_csv("pilar6_konstruksi.csv", index=False)
    log("  -> Selesai: pilar6_konstruksi.csv\n")

# ==========================================
# PILAR 2: Tarif Sewa Alat Berat (Web Scraping)
# ==========================================
def pilar_sewa():
    log("Memproses Pilar 2: Tarif Sewa Excavator...")
    urls = [
        "https://arwanabeton.com/sewa-excavator-pc200/",
        "https://suhanakonstruksi.com/sewa-excavator-pc200/"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # Cari pola harga sewa (misal: Rp 160.000 / jam)
            harga_match = re.search(r"Rp\s?([\d\.]+)\s*(?:/|\s)?(?:jam|hour)", teks, re.I)
            if harga_match:
                harga = int(harga_match.group(1).replace(".", ""))
                data.append({"Sumber": url, "Harga_Sewa_per_Jam": harga, "Satuan": "Rp"})
                log(f"  -> Berhasil: {url} = Rp {harga:,}")
            else:
                log(f"  -> Harga tidak ditemukan di {url}")
            time.sleep(1)
        except Exception as e:
            log(f"  -> Error: {e}")
            
    # Jika gagal semua, gunakan data fallback dari riset
    if not data:
        data = [
            {"Sumber": "Riset Pasar (Fallback)", "Harga_Sewa_per_Jam": 160000, "Satuan": "Rp"},
            {"Sumber": "Riset Pasar (Fallback)", "Harga_Sewa_per_Jam": 135000, "Satuan": "Rp"}
        ]
        log("  -> Menggunakan data fallback riset pasar.")
        
    df = pd.DataFrame(data)
    df.to_csv("pilar7_tarif_sewa.csv", index=False)
    log("  -> Selesai: pilar7_tarif_sewa.csv\n")

# ==========================================
# PILAR 3: Struktur Pembiayaan OJK (Web Scraping Berita)
# ==========================================
def pilar_ojk():
    log("Memproses Pilar 3: Struktur Pembiayaan Alat Berat (OJK)...")
    urls = [
        "https://keuangan.kontan.co.id/news/piutang-pembiayaan-alat-berat-capai-rp-4865-triliun-pada-juni-2026"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # Ekstrak total pembiayaan
            total_match = re.search(r"Rp\s?([\d\.,]+)\s*triliun", teks, re.I)
            total = total_match.group(1) if total_match else "N/A"
            
            # Ekstrak porsi mining
            mining_match = re.search(r"pertambangan[^\d]*Rp\s?([\d\.,]+)\s*triliun", teks, re.I)
            mining = mining_match.group(1) if mining_match else "N/A"
            
            # Ekstrak persentase
            persen_match = re.search(r"([\d\.,]+)%\s*(?:dari|terhadap)", teks, re.I)
            persen = persen_match.group(1) if persen_match else "N/A"
            
            data.append({
                "Total_Pembiayaan_Triliun": total,
                "Mining_Triliun": mining,
                "Persentase_Mining": persen,
                "URL": url
            })
            log(f"  -> Berhasil: Total={total}, Mining={mining} ({persen})")
        except Exception as e:
            log(f"  -> Error: {e}")
            
    # Fallback jika scraping gagal
    if not data or data[0]["Total_Pembiayaan_Triliun"] == "N/A":
        data = [{
            "Total_Pembiayaan_Triliun": 48.65,
            "Mining_Triliun": 27.13,
            "Persentase_Mining": 55.76,
            "URL": "Data Riset OJK (Fallback)"
        }]
        log("  -> Menggunakan data fallback OJK.")
        
    df = pd.DataFrame(data)
    df.to_csv("pilar8_ojk.csv", index=False)
    log("  -> Selesai: pilar8_ojk.csv\n")

# ==========================================
# PILAR 4: Pangsa Pasar SANY (Injeksi Data)
# ==========================================
def pilar_sany():
    log("Memproses Pilar 4: Pangsa Pasar SANY/XCMG...")
    data = [
        {"Merek": "SANY", "Data": "Total unit terkirim sejak 2008", "Nilai": ">43.000 unit"},
        {"Merek": "SANY", "Data": "Excavator aktif (Sep 2025)", "Nilai": "~26.000 unit"},
        {"Merek": "SANY", "Data": "Pangsa pasar excavator", "Nilai": "20-22% (mendekati 30% di 2024)"},
        {"Merek": "XCMG", "Data": "Pengalaman di Indonesia", "Nilai": ">20 tahun"},
        {"Merek": "XCMG", "Data": "Target pangsa produk listrik 2026", "Nilai": "30%"}
    ]
    df = pd.DataFrame(data)
    df.to_csv("pilar9_pangsa_pasar.csv", index=False)
    log("  -> Selesai: pilar9_pangsa_pasar.csv\n")

# ==========================================
# PILAR 5: Peralatan Pelabuhan & Logistik (Injeksi Data)
# ==========================================
def pilar_pelabuhan():
    log("Memproses Pilar 5: Pasar Peralatan Pelabuhan...")
    data = [
        {"Segmen": "Container Handling Equipment", "Nilai_Pasar": "USD 1.1 Miliar", "Keterangan": "Reach stacker, forklift, straddle carrier"},
        {"Segmen": "Floating/Ship Crane (2026-2035)", "Nilai_Pasar": "CAGR 5-7%", "Keterangan": "Port & terminal 35-45%, shipyard 15-20%"},
        {"Segmen": "Port Modernization Driver", "Nilai_Pasar": "N/A", "Keterangan": "Mendorong permintaan crane 2026"}
    ]
    df = pd.DataFrame(data)
    df.to_csv("pilar10_pelabuhan.csv", index=False)
    log("  -> Selesai: pilar10_pelabuhan.csv\n")

# ==========================================
# EKSEKUSI UTAMA
# ==========================================
if __name__ == "__main__":
    print("="*60)
    print("MEMULAI PIPELINE RISET LANJUTAN (5 PILAR TAMBAHAN)")
    print("="*60 + "\n")
    
    pilar_konstruksi()
    pilar_sewa()
    pilar_ojk()
    pilar_sany()
    pilar_pelabuhan()
    
    print("="*60)
    print("SEMUA DATA TAMBAHAN BERHASIL DIKUMPULKAN!")
    print("Silakan cek file pilar6 hingga pilar10 di folder ini.")
    print("="*60)
