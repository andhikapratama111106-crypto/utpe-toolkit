"""Market-entry game: incumbent (UTPE) vs entrant (kompetitor China)."""

from __future__ import annotations

import numpy as np

from utpe.analysis.game_theory.base import BaseGame, PayoffMatrix, Player


class EntryGame(BaseGame):
    """Game masuk pasar 2x2.

    Entrant: {Masuk, Tak Masuk}. Incumbent: {Lawan, Akomodasi}.
    Payoff default menggambarkan entry-deterrence klasik.
    """

    def __init__(
        self,
        monopoly_profit: float = 100.0,
        duopoly_profit: float = 40.0,
        fight_loss: float = 10.0,
        entry_cost: float = 20.0,
        **kw,
    ):
        players = [
            Player("Entrant (China)", ["Masuk", "Tak Masuk"]),
            Player("Incumbent (UTPE)", ["Lawan", "Akomodasi"]),
        ]
        super().__init__(players, **kw)
        self.monopoly_profit = monopoly_profit
        self.duopoly_profit = duopoly_profit
        self.fight_loss = fight_loss
        self.entry_cost = entry_cost

    def build_payoff(self) -> PayoffMatrix:
        m, d, f, c = (
            self.monopoly_profit,
            self.duopoly_profit,
            self.fight_loss,
            self.entry_cost,
        )
        # Baris = entrant {Masuk, Tak Masuk}; kolom = incumbent {Lawan, Akomodasi}.
        # Entrant payoff.
        a = np.array(
            [
                [-f - c, d - c],  # Masuk vs (Lawan, Akomodasi)
                [0.0, 0.0],  # Tak Masuk
            ]
        )
        # Incumbent payoff.
        b = np.array(
            [
                [-f, d],  # Masuk: incumbent rugi kalau melawan, bagi pasar kalau akomodasi
                [m, m],  # Tak Masuk: incumbent monopoli
            ]
        )
        return PayoffMatrix(a, b)
