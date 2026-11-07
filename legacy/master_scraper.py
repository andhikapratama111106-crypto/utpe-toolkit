import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
import time
import os

# Header standar untuk meniru browser asli
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
}

def log(msg):
    print(f"[*] {msg}")

# ==========================================
# PILAR 1: Benchmark Harga Komatsu (Bekas)
# ==========================================
def scrape_komatsu():
    log("Memulai Pilar 1: Scraping Harga Komatsu...")
    # URL contoh dari TokoAlatBerat (Anda bisa mengganti dengan URL aktual hasil pencarian)
    urls = [
        "https://www.tokoalatberat.com/2026/10/komatsu-pc200-8-tahun-2011-hm-9000.html",
        "https://www.tokoalatberat.com/2026/10/excavator-komatsu-pc200-10m0-tahun-2021-hm-3200.html"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                log(f"  -> Gagal akses {url}")
                continue
            
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # Ekstrak Judul
            title_tag = soup.find("h1")
            judul = title_tag.get_text(strip=True) if title_tag else "N/A"
            
            # Ekstrak Harga (Regex mencari Rp diikuti angka)
            harga_match = re.search(r"Rp\s?[\d\.]+", teks)
            harga = harga_match.group(0) if harga_match else "N/A"
            
            # Ekstrak Tahun (Regex mencari 20XX)
            tahun_match = re.search(r"Tahun\s*(20\d{2})", teks, re.I)
            tahun = tahun_match.group(1) if tahun_match else "N/A"
            
            # Ekstrak HM
            hm_match = re.search(r"HM\s*([\d\.]+)", teks, re.I)
            hm = hm_match.group(1) if hm_match else "N/A"
            
            data.append({"Merek": "Komatsu", "Judul": judul, "Harga": harga, "Tahun": tahun, "HM": hm, "URL": url})
            log(f"  -> Berhasil: {judul} | {harga}")
            time.sleep(1)
        except Exception as e:
            log(f"  -> Error: {e}")
            
    df = pd.DataFrame(data)
    df.to_csv("pilar1_komatsu.csv", index=False)
    log("Pilar 1 Selesai. File: pilar1_komatsu.csv\n")

# ==========================================
# PILAR 2: Harga Solar Industri (Time-Series)
# ==========================================
def scrape_solar():
    log("Memulai Pilar 2: Scraping Harga Solar...")
    # URL berita Kontan/CNBC sebagai contoh
    urls = [
        "https://industri.kontan.co.id/news/harga-solar-industri-b40-naik-jadi-rp-30550-per-liter-ini-penjelasan-pertamina",
        "https://www.cnbcindonesia.com/news/20260915120000-4-123456/harga-solar-industri-terbaru"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                continue
            
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # Ekstrak tanggal berita (format "17 April 2026")
            tanggal_match = re.search(r"\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4}", teks)
            tanggal = tanggal_match.group(0) if tanggal_match else "N/A"
            
            # Ekstrak harga solar (fokus pada teks yang mengandung "solar" dan "Rp")
            # Ini adalah regex sederhana, mungkin perlu penyesuaian
            harga_matches = re.findall(r"Rp\s?[\d\.]+\s*(?:per\s*liter|/L)?", teks, re.I)
            # Ambil harga yang paling relevan (biasanya angka terbesar atau yang dekat dengan kata "solar")
            harga_terpilih = harga_matches[0] if harga_matches else "N/A"
            
            data.append({"Tanggal": tanggal, "Harga_Ditemukan": harga_terpilih, "URL": url})
            log(f"  -> Berhasil: {tanggal} | {harga_terpilih}")
            time.sleep(1)
        except Exception as e:
            log(f"  -> Error: {e}")
            
    df = pd.DataFrame(data)
    df.to_csv("pilar2_solar.csv", index=False)
    log("Pilar 2 Selesai. File: pilar2_solar.csv\n")

# ==========================================
# PILAR 3: Biaya Maintenance (Proxy dari Jurnal/PU)
# ==========================================
def scrape_maintenance():
    log("Memulai Pilar 3: Estimasi Biaya Maintenance...")
    # Karena PDF Katalog PU mungkin sulit diakses langsung, kita buat baseline model
    # Berdasarkan jurnal: Biaya repair & maintenance ~ 12.5% dari harga beli per tahun
    # Jam kerja efektif per tahun ~ 2000 jam
    log("  -> Menggunakan baseline industry: Repair & Maintenance = 12.5% CAPEX / 2000 hours")
    
    # Contoh kalkulasi untuk Komatsu PC200 (Harga ~ Rp 1 Miliar)
    harga_beli = 1_000_000_000
    biaya_maintenance_tahunan = harga_beli * 0.125
    jam_kerja_tahunan = 2000
    biaya_per_jam = biaya_maintenance_tahunan / jam_kerja_tahunan
    
    data = [{
        "Aset": "Komatsu PC200",
        "Harga_Beli_Proxy": harga_beli,
        "Biaya_Maintenance_Tahunan": biaya_maintenance_tahunan,
        "Jam_Kerja_Tahunan": jam_kerja_tahunan,
        "Biaya_Maintenance_per_Jam": biaya_per_jam
    }]
    
    df = pd.DataFrame(data)
    df.to_csv("pilar3_maintenance.csv", index=False)
    log(f"  -> Berhasil: Biaya Maintenance PC200 = Rp {biaya_per_jam:,.0f} / jam")
    log("Pilar 3 Selesai. File: pilar3_maintenance.csv\n")

# ==========================================
# PILAR 4: Skema Pembiayaan (Financing)
# ==========================================
def scrape_financing():
    log("Memulai Pilar 4: Scraping Skema Pembiayaan...")
    # URL contoh dari IMFI / Trakindo
    urls = [
        "https://indomobilfinance.co.id/customer/content/solusi-pembiayaan-alat-berat-di-olimfiade-2026-imfi"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # Ekstrak DP, Bunga, Tenor
            dp = re.search(r"DP[^\d]*(\d+)%", teks, re.I)
            bunga = re.search(r"[Bb]unga[^\d]*([\d\.,]+)%", teks)
            tenor = re.search(r"tenor[^\d]*(\d+)\s*(?:bulan|tahun)", teks, re.I)
            
            data.append({
                "Lembaga": "IMFI",
                "DP": dp.group(1) + "%" if dp else "N/A",
                "Bunga": bunga.group(1) + "%" if bunga else "N/A",
                "Tenor": tenor.group(0) if tenor else "N/A",
                "URL": url
            })
            log(f"  -> Berhasil: DP={data[-1]['DP']}, Bunga={data[-1]['Bunga']}")
            time.sleep(1)
        except Exception as e:
            log(f"  -> Error: {e}")
            
    df = pd.DataFrame(data)
    df.to_csv("pilar4_financing.csv", index=False)
    log("Pilar 4 Selesai. File: pilar4_financing.csv\n")

# ==========================================
# PILAR 5: Data Produksi Batubara (RKAB)
# ==========================================
def scrape_rkab():
    log("Memulai Pilar 5: Scraping Data RKAB Batubara...")
    # URL contoh artikel berita / JOGMEC
    urls = [
        "https://journal.jogmec.go.jp/coal/news-flash/news-flash_11462.html"
    ]
    data = []
    
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                continue
                
            soup = BeautifulSoup(resp.text, "html.parser")
            teks = soup.get_text(separator=" ")
            
            # JOGMEC menggunakan format "約7億2,000万トン" (sekitar 720 juta ton)
            # Kita coba cari pola angka diikuti "億" (Oku = 100 juta)
            match = re.search(r"(\d+)億\s*([\d,]+)万トン", teks)
            if match:
                oku = int(match.group(1)) * 100_000_000
                man = int(match.group(2).replace(",", "")) * 10_000
                total_ton = oku + man
            else:
                # Fallback: cari angka juta ton dalam bahasa Inggris/Indonesia
                match_id = re.search(r"(\d+)\s*juta\s*ton", teks, re.I)
                total_ton = int(match_id.group(1)) * 1_000_000 if match_id else "N/A"
                
            data.append({"Sumber": "JOGMEC", "Kuota_RKAB_Ton": total_ton, "URL": url})
            log(f"  -> Berhasil: Kuota RKAB = {total_ton} ton")
            time.sleep(1)
        except Exception as e:
            log(f"  -> Error: {e}")
            
    df = pd.DataFrame(data)
    df.to_csv("pilar5_rkab.csv", index=False)
    log("Pilar 5 Selesai. File: pilar5_rkab.csv\n")

# ==========================================
# EKSEKUSI UTAMA
# ==========================================
if __name__ == "__main__":
    print("="*50)
    print("MEMULAI PIPELINE RISET UTPE (5 PILAR DATA)")
    print("="*50 + "\n")
    
    scrape_komatsu()
    scrape_solar()
    scrape_maintenance()
    scrape_financing()
    scrape_rkab()
    
    print("="*50)
    print("SEMUA PROSES SELESAI!")
    print("Silakan cek folder Anda. Ada 5 file CSV yang siap dianalisis.")
    print("="*50)
