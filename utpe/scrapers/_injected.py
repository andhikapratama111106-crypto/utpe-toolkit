"""Helper untuk scraper berbasis data riset injeksi.

Beberapa pilar (RKAB, konstruksi, SANY, pelabuhan, OJK) datanya berasal
dari riset manual / sumber yang sulit di-scrape langsung. Scraper-nya
tetap mengikuti kontrak BaseScraper tapi ``fetch`` mengembalikan data
injeksi, bukan HTTP.
"""

from __future__ import annotations

from utpe.models import ScrapedItem
from utpe.scrapers.base import BaseScraper


class InjectedScraper(BaseScraper):
    """Scraper yang sumber datanya adalah ROWS kelas (list of dict).

    Setiap dict minimal punya ``field`` dan ``value``; ``unit`` dan
    ``note`` opsional.
    """

    ROWS: list[dict] = []

    def fetch(self) -> list:
        return list(self.ROWS)

    def parse(self, raw) -> list[ScrapedItem]:
        return [
            ScrapedItem(
                source_name=self.source_name,
                source_url=self.source_url,
                field=str(r["field"]),
                value=str(r["value"]),
                unit=str(r.get("unit", "")),
                note=str(r.get("note", "")),
            )
            for r in raw
        ]
