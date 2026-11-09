"""Test Module 7: biaya per tahun (EAC) dan FLEX. Nilai acuan = Lampiran A Executive Summary."""

import pytest

from utpe.analysis import eac
from utpe.reporting.validator import validate_eac

# produk: (eac_patria, eac_china, selisih_eac, flex_patria, flex_china, selisih_flex, diskonto_impas)
ACUAN = {
    "A": (0.2124, 0.3298, -0.356, 0.2746, 0.3665, -0.251, 0.458),
    "B": (0.6020, 0.6548, -0.081, 0.8466, 0.8466, 0.000, 0.209),
    "C": (0.1291, 0.1315, -0.018, 0.1741, 0.1545, 0.127, 0.133),
    "D": (0.0373, 0.0625, -0.404, 0.0438, 0.0678, -0.354, 1.003),
}
TANPA_DISKONTO = {"A": -0.53, "B": -0.26, "C": -0.22, "D": -0.51}


@pytest.fixture(scope="module")
def rows():
    return {r["produk"]: r for r in eac.tabel()}


@pytest.mark.parametrize("k", list(ACUAN))
def test_tabel_cocok_lampiran_a(rows, k):
    r = rows[k]
    ep, ec, se, fp, fc, sf, be = ACUAN[k]
    assert r["eac_patria"] == pytest.approx(ep, abs=1e-3)
    assert r["eac_china"] == pytest.approx(ec, abs=1e-3)
    assert r["selisih_eac"] == pytest.approx(se, abs=1e-3)
    assert r["flex_patria"] == pytest.approx(fp, abs=1e-3)
    assert r["flex_china"] == pytest.approx(fc, abs=1e-3)
    assert r["selisih_flex"] == pytest.approx(sf, abs=1e-3)
    assert r["diskonto_impas"] == pytest.approx(be, abs=1e-3)
    assert r["selisih_biaya_th_tanpa_diskonto"] == pytest.approx(TANPA_DISKONTO[k], abs=5e-3)


def test_crf_nol_persen():
    assert eac.crf(0, 4) == pytest.approx(0.25)


def test_patria_lebih_murah_per_tahun_semua_produk(rows):
    assert all(r["selisih_eac"] < 0 for r in rows.values())


def test_c_kehilangan_keunggulan_di_atas_impas():
    c = eac.load_config()["produk"]["C"]
    assert eac.eac(c["harga_patria"], c["umur_patria"], 0.14) > eac.eac(c["harga_china"], c["umur_china"], 0.14)


def test_c_essential():
    ce = eac.c_essential()
    assert ce["flex_c_essential"] == pytest.approx(0.1556, abs=1e-3)
    assert ce["selisih_flex"] == pytest.approx(0.007, abs=1e-3)


def test_diskon_vs_volume():
    d = eac.diskon_vs_volume(4.16, 0.20, 0.30)
    assert d["kontribusi_penuh"] == pytest.approx(1.248, abs=1e-3)
    assert d["kontribusi_diskon"] == pytest.approx(0.416, abs=1e-3)
    assert d["penurunan_kontribusi"] == pytest.approx(-0.667, abs=1e-3)
    assert d["volume_impas"] == pytest.approx(3.0, abs=1e-3)


def test_diskon_melebihi_margin_tidak_pernah_impas():
    assert eac.diskon_vs_volume(4.16, 0.35, 0.30)["volume_impas"] is None


def test_validate_eac_semua_ok():
    res = validate_eac(eac.tabel())
    assert len(res) == 5
    assert all(r.status == "OK" for r in res)
