"""Module 1: scrapers 10 pilar data pasar alat berat."""

from __future__ import annotations

from utpe.scrapers.base import BaseScraper
from utpe.scrapers.construction import ConstructionScraper
from utpe.scrapers.financing import FinancingScraper
from utpe.scrapers.komatsu import KomatsuScraper
from utpe.scrapers.ojk import OjkScraper
from utpe.scrapers.port import PortScraper
from utpe.scrapers.rental import RentalScraper
from utpe.scrapers.rkab import RkabScraper
from utpe.scrapers.sany import SanyScraper
from utpe.scrapers.smartbid import SmartbidScraper
from utpe.scrapers.solar import SolarScraper

# Registry: nama pendek -> kelas scraper (dipakai CLI).
REGISTRY: dict[str, type[BaseScraper]] = {
    "komatsu": KomatsuScraper,
    "solar": SolarScraper,
    "financing": FinancingScraper,
    "rkab": RkabScraper,
    "construction": ConstructionScraper,
    "rental": RentalScraper,
    "ojk": OjkScraper,
    "sany": SanyScraper,
    "port": PortScraper,
    "smartbid": SmartbidScraper,
}

__all__ = [
    "BaseScraper",
    "REGISTRY",
    "KomatsuScraper",
    "SolarScraper",
    "FinancingScraper",
    "RkabScraper",
    "ConstructionScraper",
    "RentalScraper",
    "OjkScraper",
    "SanyScraper",
    "PortScraper",
    "SmartbidScraper",
]
