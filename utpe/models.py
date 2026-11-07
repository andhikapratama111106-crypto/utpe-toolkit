"""Dataclass bersama antar-module."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

from utpe import config


@dataclass
class ScrapedItem:
    """Satu baris data hasil scraping, dalam format terstandar.

    Setiap scraper menghasilkan list[ScrapedItem] yang kolomnya seragam
    (lihat config.SCRAPER_STD_COLUMNS) sehingga mudah digabung.
    """

    source_name: str
    source_url: str
    field: str
    value: str
    unit: str = ""
    note: str = ""
    scraped_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(timespec="seconds")
    )

    def to_row(self) -> dict:
        """Dict dengan urutan kolom standar."""
        d = asdict(self)
        return {col: d.get(col, "") for col in config.SCRAPER_STD_COLUMNS}


@dataclass
class TCOConfig:
    """Parameter satu unit alat berat untuk kalkulasi TCO."""

    merek: str
    model: str
    harga_beli: float
    lifetime_jam: float
    biaya_maintenance_jam: float
    harga_solar: float = config.HARGA_SOLAR
    konsumsi_bbm: float = config.KONSUMSI_BBM
    upah_operator: float = config.UPAH_OPERATOR

    @classmethod
    def from_dict(cls, d: dict) -> TCOConfig:
        """Terima key gaya legacy maupun snake_case."""
        aliases = {
            "Merek": "merek",
            "Model": "model",
            "Harga_Beli": "harga_beli",
            "Estimasi_Lifetime_Jam": "lifetime_jam",
            "Biaya_Maintenance_Jam": "biaya_maintenance_jam",
        }
        norm = {aliases.get(k, k): v for k, v in d.items()}
        valid = {f for f in cls.__dataclass_fields__}  # noqa: C416
        return cls(**{k: v for k, v in norm.items() if k in valid})


@dataclass
class GameSpec:
    """Spesifikasi sebuah game: pemain, strategi, dan payoff."""

    name: str
    players: list[str]
    strategies: dict[str, list[str]]
    # payoffs[player] = matriks payoff (list of list) berurutan sesuai strategies.
    payoffs: dict[str, list[list[float]]] = field(default_factory=dict)
    kind: str = "normal"  # normal | bertrand | stackelberg | entry | mechanism
    params: dict = field(default_factory=dict)

    @classmethod
    def from_yaml(cls, path: str) -> GameSpec:
        data = config.load_yaml(path)
        return cls(
            name=data.get("name", "unnamed"),
            players=data.get("players", []),
            strategies=data.get("strategies", {}),
            payoffs=data.get("payoffs", {}),
            kind=data.get("kind", "normal"),
            params=data.get("params", {}),
        )
