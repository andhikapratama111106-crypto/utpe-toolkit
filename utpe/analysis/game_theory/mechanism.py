"""Mechanism design sederhana untuk skema financing.

Memodelkan pilihan UTPE menawarkan skema pembiayaan agar pembeli
memilih produk UTPE (harga penuh) ketimbang kompetitor murah.
Fokus: participation constraint (IR) & incentive compatibility (IC).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class FinancingOffer:
    """Satu skema pembiayaan yang ditawarkan ke pembeli."""

    name: str
    harga: float
    dp_pct: float
    bunga_pct: float
    tenor_bulan: int

    def total_bayar(self) -> float:
        """Total yang dibayar pembeli (flat interest)."""
        pokok = self.harga * (1 - self.dp_pct)
        bunga = pokok * self.bunga_pct * (self.tenor_bulan / 12)
        return self.harga * self.dp_pct + pokok + bunga

    def cicilan_bulanan(self) -> float:
        pokok = self.harga * (1 - self.dp_pct)
        bunga = pokok * self.bunga_pct * (self.tenor_bulan / 12)
        return (pokok + bunga) / self.tenor_bulan


def buyer_utility(offer: FinancingOffer, willingness_to_pay: float, discount: float = 0.0) -> float:
    """Utilitas pembeli = WTP - total bayar (present-value kasar via discount)."""
    pv_total = offer.total_bayar() * (1 - discount)
    return willingness_to_pay - pv_total


def choose_offer(
    offers: list[FinancingOffer], willingness_to_pay: float, outside_option: float = 0.0
) -> dict:
    """Pembeli memilih offer dengan utilitas tertinggi di atas outside option (IR).

    outside_option = utilitas membeli kompetitor China (harga murah).
    """
    ranked = sorted(
        ((o, buyer_utility(o, willingness_to_pay)) for o in offers),
        key=lambda x: x[1],
        reverse=True,
    )
    best_offer, best_util = ranked[0]
    participates = best_util >= outside_option
    return {
        "chosen": best_offer.name if participates else "Outside (kompetitor)",
        "best_utility": best_util,
        "outside_option": outside_option,
        "participates": participates,
        "ranking": [(o.name, u) for o, u in ranked],
    }
