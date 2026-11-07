"""Pilar 10: pasar peralatan pelabuhan & logistik."""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class PortScraper(InjectedScraper):
    source_name = "pilar10_pelabuhan"
    source_url = "riset-pasar-pelabuhan"
    ROWS = [
        {
            "field": "Container handling equipment",
            "value": "1.1",
            "unit": "USD miliar",
            "note": "reach stacker, forklift",
        },
        {"field": "Floating/ship crane CAGR 2026-2035", "value": "6", "unit": "%", "note": "5-7%"},
        {
            "field": "Port modernization",
            "value": "N/A",
            "unit": "",
            "note": "pendorong permintaan crane",
        },
    ]
