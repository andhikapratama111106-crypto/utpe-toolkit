"""Pilar 1: benchmark harga Komatsu bekas."""

from __future__ import annotations

import re

from utpe.models import ScrapedItem
from utpe.scrapers.base import BaseScraper

URLS = [
    "https://www.tokoalatberat.com/2026/10/komatsu-pc200-8-tahun-2011-hm-9000.html",
    "https://www.tokoalatberat.com/2026/10/excavator-komatsu-pc200-10m0-tahun-2021-hm-3200.html",
]

FALLBACK = [
    {"model": "PC200-8 (2011, HM 9000)", "harga": "Rp 450.000.000", "tahun": "2011"},
    {"model": "PC200-10M0 (2021, HM 3200)", "harga": "Rp 1.025.000.000", "tahun": "2021"},
]


class KomatsuScraper(BaseScraper):
    source_name = "pilar1_komatsu"
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
                h1 = BeautifulSoup(html, "html.parser").find("h1")
                judul = h1.get_text(strip=True) if h1 else "N/A"
                harga = re.search(r"Rp\s?[\d\.]+", teks)
                tahun = re.search(r"Tahun\s*(20\d{2})", teks, re.I)
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=url,
                        field=judul,
                        value=harga.group(0) if harga else "N/A",
                        unit="Rp",
                        note=f"tahun={tahun.group(1) if tahun else 'N/A'}",
                    )
                )
        if not items:
            for row in FALLBACK:
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=self.source_url,
                        field=row["model"],
                        value=row["harga"],
                        unit="Rp",
                        note=f"tahun={row['tahun']}; fallback",
                    )
                )
        return items
