"""Test Module 2: TCO."""

from utpe.analysis import tco
from utpe.models import TCOConfig


def test_compute_tco_komatsu_matches_legacy():
    cfg = TCOConfig(
        merek="Komatsu",
        model="PC200",
        harga_beli=1_025_000_000,
        lifetime_jam=10_000,
        biaya_maintenance_jam=62_500,
    )
    res = tco.compute_tco(cfg)
    # bbm = 12*25200*10000 = 3,024,000,000; maint = 625,000,000; operator = 500,000,000
    assert res["Total_BBM"] == 12 * 25_200 * 10_000
    assert res["Total_TCO"] == 1_025_000_000 + 3_024_000_000 + 625_000_000 + 500_000_000
    # cost per hour
    assert res["Cost_per_Hour"] == res["Total_TCO"] / 10_000


def test_cost_per_hour_shortcut():
    cph = tco.cost_per_hour(600_000_000, 7_000, 45_000)
    assert cph > 0


def test_run_fleet_shape():
    df = tco.run_fleet()
    assert len(df) == 3
    assert set(["Merek", "Cost_per_Hour", "Total_TCO"]).issubset(df.columns)
    # UTPE termahal capex -> cost per hour tertinggi di armada default
    utpe = df[df["Merek"].str.contains("UTPE")].iloc[0]
    assert utpe["Cost_per_Hour"] > 0


def test_from_dict_legacy_aliases():
    cfg = TCOConfig.from_dict(
        {
            "Merek": "X",
            "Model": "Y",
            "Harga_Beli": 100,
            "Estimasi_Lifetime_Jam": 10,
            "Biaya_Maintenance_Jam": 5,
        }
    )
    assert cfg.merek == "X"
    assert cfg.lifetime_jam == 10
