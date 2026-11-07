"""Pilar 9: pangsa pasar kompetitor China (SANY/XCMG)."""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class SanyScraper(InjectedScraper):
    source_name = "pilar9_pangsa_pasar"
    source_url = "riset-kompetitor-china"
    ROWS = [
        {
            "field": "SANY unit terkirim sejak 2008",
            "value": "43000",
            "unit": "unit",
            "note": ">43rb",
        },
        {"field": "SANY excavator aktif", "value": "26000", "unit": "unit", "note": "Sep 2025"},
        {
            "field": "SANY pangsa excavator",
            "value": "21",
            "unit": "%",
            "note": "20-22%, puncak ~30% 2024",
        },
        {"field": "XCMG pengalaman Indonesia", "value": "20", "unit": "tahun", "note": ">20 thn"},
        {"field": "XCMG target produk listrik 2026", "value": "30", "unit": "%", "note": ""},
    ]
