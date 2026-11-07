"""Test Module 4: proyeksi finansial + NPV."""

from utpe.analysis import projection


def test_financing_beats_price_war():
    df = projection.compare()
    profit_a = df.iloc[0]["Total_Profit"]
    profit_b = df.iloc[1]["Total_Profit"]
    assert profit_b > profit_a


def test_konservatif_still_beats_price_war():
    df = projection.compare(konservatif=True)
    assert df.iloc[1]["Total_Profit"] > df.iloc[0]["Total_Profit"]


def test_price_war_has_no_financing_profit():
    res = projection.price_war()
    assert res["Laba_Financing"] == 0.0


def test_npv_basic():
    # Investasi 100 di t0, lalu 60 dua tahun, rate 10%.
    val = projection.npv([-100, 60, 60], 0.10)
    expected = -100 + 60 / 1.1 + 60 / 1.1**2
    assert abs(val - expected) < 1e-9


def test_npv_zero_rate():
    assert projection.npv([-100, 50, 50, 50], 0.0) == 50.0
