"""Module 6c: export laporan (markdown) dari hasil validasi."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from utpe import config
from utpe.reporting.validator import CheckResult, summarize

_BADGE = {"OK": "✅ Cocok", "WARN": "🟡 Selisih", "FAIL": "❌ Beda", "MISSING": "⚠️ Hilang"}


def validation_report_md(results: list[CheckResult], output_path: str | Path | None = None) -> str:
    """Tulis laporan validasi ke markdown, return path."""
    out = Path(output_path or (config.OUTPUT_DIR / "validation_report.md"))
    summary = summarize(results)
    lines = [
        "# Validation Report",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## Cross-Check: Hasil Analisis vs Executive Summary",
        "",
        "| Angka | Nilai Hasil | Nilai ES | Selisih % | Status |",
        "|-------|-------------|----------|-----------|--------|",
    ]
    for r in results:
        csv_v = f"{r.csv_value:,.0f}" if r.csv_value is not None else "N/A"
        diff = f"{r.diff_pct:.2f}%" if r.diff_pct is not None else "-"
        lines.append(
            f"| {r.label} | {csv_v} | {r.es_value:,.0f} | {diff} | {_BADGE.get(r.status, r.status)} |"
        )
    lines += ["", "---", ""]
    if summary["consistent"]:
        lines.append(f"✅ SEMUA ANGKA KONSISTEN (toleransi {config.VALIDATION_TOLERANCE_PCT}%)")
    else:
        lines.append(
            f"❌ {summary['FAIL']} inkonsistensi, {summary['MISSING']} hilang — perlu diperbaiki"
        )
    text = "\n".join(lines) + "\n"
    out.write_text(text, encoding="utf-8")
    return str(out)
