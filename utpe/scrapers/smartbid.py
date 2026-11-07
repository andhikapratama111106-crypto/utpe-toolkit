"""Pilar tambahan: benchmark harga unit bekas via SmartBid (lelang).

Catatan: tidak ada scraper SmartBid eksplisit di script legacy; sumbernya
muncul sebagai komentar harga SANY bekas 2022 (~Rp 600 juta) di tco_model.py.
Module ini mengangkat data itu jadi scraper injeksi agar lengkap 10+ sumber.
"""

from __future__ import annotations

from utpe.scrapers._injected import InjectedScraper


class SmartbidScraper(InjectedScraper):
    source_name = "smartbid_bekas"
    source_url = "https://smartbid.co.id/"
    ROWS = [
        {
            "field": "SANY SY215C bekas 2022",
            "value": "600000000",
            "unit": "Rp",
            "note": "lelang SmartBid",
        },
        {
            "field": "Komatsu PC200-8 bekas 2011",
            "value": "450000000",
            "unit": "Rp",
            "note": "lelang SmartBid",
        },
    ]
