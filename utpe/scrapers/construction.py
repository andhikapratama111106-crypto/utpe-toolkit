"""Pilar 6: struktur pasar konstruksi Indonesia."""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class ConstructionScraper(InjectedScraper):
    source_name = "pilar6_konstruksi"
    source_url = "riset-pasar-konstruksi"
    ROWS = [
        {"field": "Unit terjual 2025", "value": "21694", "unit": "unit", "note": "baseline pasar"},
        {
            "field": "Unit terjual 2026",
            "value": "23000",
            "unit": "unit",
            "note": "proyeksi, incl IKN",
        },
        {"field": "Unit terjual 2031", "value": "31920", "unit": "unit", "note": "CAGR 6.65%"},
        {"field": "Nilai pasar 2025", "value": "3.41", "unit": "USD miliar", "note": ""},
        {"field": "Nilai pasar 2031", "value": "4.89", "unit": "USD miliar", "note": ""},
    ]
