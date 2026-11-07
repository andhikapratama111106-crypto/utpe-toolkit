"""Pilar 8: struktur pembiayaan alat berat (OJK)."""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class OjkScraper(InjectedScraper):
    source_name = "pilar8_ojk"
    source_url = "https://keuangan.kontan.co.id/"
    ROWS = [
        {
            "field": "Total piutang pembiayaan",
            "value": "48.65",
            "unit": "Rp triliun",
            "note": "Juni 2026",
        },
        {"field": "Porsi pertambangan", "value": "27.13", "unit": "Rp triliun", "note": ""},
        {"field": "Persentase mining", "value": "55.76", "unit": "%", "note": ""},
    ]
