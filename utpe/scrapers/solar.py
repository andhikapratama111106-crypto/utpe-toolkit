"""Pilar 2: harga solar industri (time-series)."""

from __future__ import annotations

import re

from utpe.models import ScrapedItem
from utpe.scrapers.base import BaseScraper

URLS = [
    "https://industri.kontan.co.id/news/harga-solar-industri-b40",
    "https://www.cnbcindonesia.com/news/harga-solar-industri-terbaru",
]

FALLBACK = [
    {"tanggal": "2026-07", "harga": "Rp 30.550", "note": "B40 naik"},
    {"tanggal": "2026-09", "harga": "Rp 25.200", "note": "Pertamina Dex"},
]


class SolarScraper(BaseScraper):
    source_name = "pilar2_solar"
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
                tgl = re.search(
                    r"\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|"
                    r"Agustus|September|Oktober|November|Desember)\s+\d{4}",
                    teks,
                )
                harga = re.findall(r"Rp\s?[\d\.]+\s*(?:per\s*liter|/L)?", teks, re.I)
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=url,
                        field=tgl.group(0) if tgl else "N/A",
                        value=harga[0] if harga else "N/A",
                        unit="Rp/liter",
                    )
                )
        if not items:
            for row in FALLBACK:
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=self.source_url,
                        field=row["tanggal"],
                        value=row["harga"],
                        unit="Rp/liter",
                        note=f"{row['note']}; fallback",
                    )
                )
        return items
