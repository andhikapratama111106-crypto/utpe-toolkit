"""Pilar 7: tarif sewa alat berat (excavator PC200)."""

from __future__ import annotations

import re

from utpe.models import ScrapedItem
from utpe.scrapers.base import BaseScraper

URLS = [
    "https://arwanabeton.com/sewa-excavator-pc200/",
    "https://suhanakonstruksi.com/sewa-excavator-pc200/",
]

FALLBACK = [160000, 135000]


class RentalScraper(BaseScraper):
    source_name = "pilar7_tarif_sewa"
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
                m = re.search(r"Rp\s?([\d\.]+)\s*(?:/|\s)?(?:jam|hour)", teks, re.I)
                if m:
                    harga = m.group(1).replace(".", "")
                    items.append(
                        ScrapedItem(self.source_name, url, "Tarif sewa/jam", harga, "Rp/jam")
                    )
        if not items:
            for harga in FALLBACK:
                items.append(
                    ScrapedItem(
                        source_name=self.source_name,
                        source_url=self.source_url,
                        field="Tarif sewa/jam",
                        value=str(harga),
                        unit="Rp/jam",
                        note="riset pasar; fallback",
                    )
                )
        return items
