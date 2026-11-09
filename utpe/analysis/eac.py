"""Module 7: biaya per tahun (EAC) dan skema FLEX per produk PATRIA vs pesaing China.

Satuan dan data sama dengan Lampiran A Executive Summary (Case Book, diskonto
pelanggan 12%), sehingga perbandingan produk sejenis: harga dibagi umur pakai
dengan nilai waktu uang. Lihat juga utpe.analysis.tco untuk perbandingan per jam
(profil tidak setara; dipertahankan untuk keterlacakan).
"""

from __future__ import annotations

from functools import lru_cache

import yaml

from utpe import config

CONFIG_PATH = config.CONFIGS_DIR / "products_casebook.yaml"


@lru_cache(maxsize=1)
def load_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


def crf(r: float, n: float) -> float:
    """Faktor anuitas (capital recovery factor)."""
    if n <= 0:
        raise ValueError("umur harus > 0")
    return 1.0 / n if r == 0 else r / (1 - (1 + r) ** (-n))


def eac(harga: float, umur: float, r: float = 0.12) -> float:
    """Biaya per tahun setara: harga x CRF(r, umur)."""
    return harga * crf(r, umur)


def flex_cost(harga: float, umur: float, r: float = 0.12, tenor: float = 4, sisa: float = 0.80) -> float:
    """Biaya per tahun bagi pelanggan untuk kebutuhan `tenor` tahun lewat sewa-beli dengan nilai
    sisa dijamin `sisa` x nilai buku garis lurus di akhir tenor. Bila umur < tenor, unit kedua
    dibeli di akhir umur unit pertama; nilai sisanya di akhir tenor dikreditkan dengan jaminan sama."""
    pv, t = 0.0, 0.0
    while t < tenor - 1e-9:
        pv += harga / (1 + r) ** t
        if t + umur >= tenor - 1e-9:
            pv -= sisa * harga * max(0.0, 1 - (tenor - t) / umur) / (1 + r) ** tenor
            break
        t += umur
    return pv * crf(r, tenor)


def diskonto_impas(hp: float, up: float, hc: float, uc: float) -> float | None:
    """Tingkat diskonto saat EAC PATRIA = EAC China (bisection). None bila tidak ada titik impas."""

    def f(x: float) -> float:
        return eac(hp, up, x) - eac(hc, uc, x)

    lo, hi = 1e-6, 5.0
    if not (f(lo) < 0 < f(hi)):
        return None
    for _ in range(200):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if f(m) < 0 else (lo, m)
    return (lo + hi) / 2


def tabel(r: float | None = None, tenor: float | None = None, sisa: float | None = None) -> list[dict]:
    """Ringkasan per produk A-D: premi harga, biaya per tahun tanpa diskonto, EAC, FLEX, diskonto impas."""
    cfg = load_config()
    r = cfg["diskonto"] if r is None else r
    tenor = cfg["flex"]["tenor"] if tenor is None else tenor
    sisa = cfg["flex"]["nilai_sisa_dijamin"] if sisa is None else sisa
    rows = []
    for k, p in cfg["produk"].items():
        hp, up, hc, uc = p["harga_patria"], p["umur_patria"], p["harga_china"], p["umur_china"]
        e_p, e_c = eac(hp, up, r), eac(hc, uc, r)
        f_p, f_c = flex_cost(hp, up, r, tenor, sisa), flex_cost(hc, uc, r, tenor, sisa)
        rows.append(
            {
                "produk": k,
                "harga_patria": hp,
                "umur_patria": up,
                "harga_china": hc,
                "umur_china": uc,
                "premi_harga": hp / hc - 1,
                "selisih_biaya_th_tanpa_diskonto": (hp / up) / (hc / uc) - 1,
                "eac_patria": e_p,
                "eac_china": e_c,
                "selisih_eac": e_p / e_c - 1,
                "flex_patria": f_p,
                "flex_china": f_c,
                "selisih_flex": f_p / f_c - 1,
                "diskonto_impas": diskonto_impas(hp, up, hc, uc),
            }
        )
    return rows


def c_essential(r: float | None = None, tenor: float | None = None, sisa: float | None = None) -> dict:
    """FLEX C-Essential (design-to-cost) vs pesaing China untuk Produk C."""
    cfg = load_config()
    r = cfg["diskonto"] if r is None else r
    tenor = cfg["flex"]["tenor"] if tenor is None else tenor
    sisa = cfg["flex"]["nilai_sisa_dijamin"] if sisa is None else sisa
    ce, c = cfg["c_essential"], cfg["produk"]["C"]
    f_e = flex_cost(ce["harga"], ce["umur"], r, tenor, sisa)
    f_c = flex_cost(c["harga_china"], c["umur_china"], r, tenor, sisa)
    return {"flex_c_essential": f_e, "flex_china": f_c, "selisih_flex": f_e / f_c - 1}


def diskon_vs_volume(harga: float = 4.16, diskon: float = 0.20, margin_kontribusi: float | None = None) -> dict:
    """Volume sama, tanpa margin pembiayaan sebagai laba UTPE: berapa kali volume harus naik
    agar diskon tidak menurunkan total laba kontribusi."""
    if margin_kontribusi is None:
        margin_kontribusi = load_config()["margin_kontribusi"]
    biaya_var = harga * (1 - margin_kontribusi)
    k_penuh = harga - biaya_var
    k_diskon = harga * (1 - diskon) - biaya_var
    return {
        "harga": harga,
        "diskon": diskon,
        "margin_kontribusi": margin_kontribusi,
        "kontribusi_penuh": k_penuh,
        "kontribusi_diskon": k_diskon,
        "penurunan_kontribusi": k_diskon / k_penuh - 1,
        "volume_impas": (k_penuh / k_diskon) if k_diskon > 0 else None,
    }
