"""Pilar 5: kuota produksi batubara (RKAB)."""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class RkabScraper(InjectedScraper):
    source_name = "pilar5_rkab"
    source_url = "https://journal.jogmec.go.jp/coal/"
    ROWS = [
        {
            "field": "Kuota RKAB 2026",
            "value": "720000000",
            "unit": "ton",
            "note": "JOGMEC ~720 juta ton",
        },
    ]
