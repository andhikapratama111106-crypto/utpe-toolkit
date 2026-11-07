"""Test Module 3: sensitivity + Monte Carlo."""

from utpe.analysis import sensitivity


def test_run_scenarios():
    df = sensitivity.run_scenarios()
    assert len(df) == 5
    assert "Cost_per_Hour" in df.columns
    # Skenario ekstrem (diskon 30% + maint 40k) harus lebih murah dari baseline.
    base = df.iloc[0]["Cost_per_Hour"]
    ekstrem = df.iloc[-1]["Cost_per_Hour"]
    assert ekstrem < base


def test_monte_carlo_percentiles_ordered():
    res = sensitivity.monte_carlo(n=2_000, seed=1)
    assert res["p10"] < res["p50"] < res["p90"]
    assert res["samples"].shape[0] == 2_000
    assert res["mean"] > 0


def test_monte_carlo_deterministic_seed():
    a = sensitivity.monte_carlo(n=1_000, seed=7)
    b = sensitivity.monte_carlo(n=1_000, seed=7)
    assert a["p50"] == b["p50"]
