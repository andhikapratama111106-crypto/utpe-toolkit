"""Pilar 4: skema pembiayaan (financing)."""

from __future__ import annotations

import re

from utpe.models import ScrapedItem
from utpe.scrapers.base import BaseScraper

URLS = [
    "https://indomobilfinance.co.id/customer/content/solusi-pembiayaan-alat-berat",
]

FALLBACK = [
    {"field": "DP", "value": "20", "unit": "%", "note": "IMFI"},
    {"field": "Bunga", "value": "9", "unit": "%", "note": "IMFI flat/tahun"},
    {"field": "Tenor", "value": "36", "unit": "bulan", "note": "IMFI"},
]


class FinancingScraper(BaseScraper):
    source_name = "pilar4_financing"
    source_url = URLS[0]

    def fetch(self) -> list:
        pages = []
        for url in URLS:
            html = self.http_get(url)
            if html:
                pages.append((url, html))
        return pages

    def parse(self, raw) -> list[ScrapedItem]:
        items: list[ScrapedItem] = []
        if raw:
            from bs4 import BeautifulSoup

            for url, html in raw:
                teks = BeautifulSoup(html, "html.parser").get_text(separator=" ")
                dp = re.search(r"DP[^\d]*(\d+)%", teks, re.I)
                bunga = re.search(r"[Bb]unga[^\d]*([\d\.,]+)%", teks)
                tenor = re.search(r"tenor[^\d]*(\d+)\s*(?:bulan|tahun)", teks, re.I)
                if dp:
                    items.append(ScrapedItem(self.source_name, url, "DP", dp.group(1), "%", "IMFI"))
                if bunga:
                    items.append(
                        ScrapedItem(self.source_name, url, "Bunga", bunga.group(1), "%", "IMFI")
                    )
                if tenor:
                    items.append(
                        ScrapedItem(self.source_name, url, "Tenor", tenor.group(1), "bulan", "IMFI")
                    )
        if not items:
            for row in FALLBACK:
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=self.source_url,
                        field=row["field"],
                        value=row["value"],
                        unit=row["unit"],
                        note=f"{row['note']}; fallback",
                    )
                )
        return items
