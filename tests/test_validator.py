"""Test Module 6: validator + export."""

import pandas as pd

from utpe.reporting import export
from utpe.reporting.validator import ES_NUMBERS, compare, summarize, validate_tco


def test_compare_ok_within_tolerance():
    r = compare("x", 100.4, 100.0)  # 0.4% < 0.5%
    assert r.status == "OK"


def test_compare_fail_big_gap():
    r = compare("x", 200.0, 100.0)
    assert r.status == "FAIL"


def test_compare_missing():
    r = compare("x", None, 100.0)
    assert r.status == "MISSING"


def test_validate_tco_against_es():
    # DataFrame yang persis sama dengan ES -> semua OK.
    df = pd.DataFrame(
        [
            {"Merek": "Komatsu (Premium)", "Cost_per_Hour": ES_NUMBERS["cost_per_hour_komatsu"]},
            {"Merek": "SANY (China)", "Cost_per_Hour": ES_NUMBERS["cost_per_hour_sany"]},
            {"Merek": "UTPE (Patria)", "Cost_per_Hour": ES_NUMBERS["cost_per_hour_utpe"]},
        ]
    )
    results = validate_tco(df)
    summary = summarize(results)
    assert summary["total"] == 3
    assert summary["consistent"] is True


def test_export_report_written(tmp_path):
    df = pd.DataFrame(
        [{"Merek": "Komatsu (Premium)", "Cost_per_Hour": ES_NUMBERS["cost_per_hour_komatsu"]}]
    )
    results = validate_tco(df)
    out = export.validation_report_md(results, output_path=tmp_path / "r.md")
    text = (tmp_path / "r.md").read_text(encoding="utf-8")
    assert "Validation Report" in text
    assert out.endswith("r.md")
