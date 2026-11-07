"""BaseScraper: kontrak bersama untuk semua scraper pilar."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

import pandas as pd
import requests

from utpe import config
from utpe.models import ScrapedItem

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
}


class BaseScraper(ABC):
    """Kontrak semua scraper.

    Subclass wajib set ``source_name`` + ``source_url`` dan implement
    ``fetch`` (ambil data mentah) serta ``parse`` (ubah jadi ScrapedItem).
    ``save`` sudah disediakan dan menulis CSV dengan kolom terstandar.
    """

    source_name: str = "base"
    source_url: str = ""
    timeout: int = 15

    @abstractmethod
    def fetch(self) -> list:
        """Ambil data mentah (HTML, JSON, atau data injeksi)."""
        raise NotImplementedError

    @abstractmethod
    def parse(self, raw) -> list[ScrapedItem]:
        """Ubah data mentah jadi daftar ScrapedItem terstandar."""
        raise NotImplementedError

    def run(self) -> list[ScrapedItem]:
        """fetch -> parse."""
        return self.parse(self.fetch())

    # -- util bersama ------------------------------------------------------
    def http_get(self, url: str) -> str | None:
        """GET sederhana; return teks HTML atau None kalau gagal."""
        try:
            resp = requests.get(url, headers=HEADERS, timeout=self.timeout)
            if resp.status_code != 200:
                return None
            return resp.text
        except requests.RequestException:
            return None

    def default_output(self) -> Path:
        return config.RAW_DIR / f"{self.source_name}.csv"

    def save(self, items: list[ScrapedItem], output_path: str | Path | None = None) -> Path:
        """Simpan ke CSV dengan kolom standar + metadata."""
        out = Path(output_path) if output_path else self.default_output()
        out.parent.mkdir(parents=True, exist_ok=True)
        rows = [it.to_row() for it in items]
        df = pd.DataFrame(rows, columns=config.SCRAPER_STD_COLUMNS)
        df.to_csv(out, index=False)
        return out
