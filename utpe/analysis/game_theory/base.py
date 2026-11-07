"""Dasar game theory: Player, PayoffMatrix, BaseGame."""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np


@dataclass
class Player:
    """Pemain dalam game."""

    name: str
    strategies: list[str] = field(default_factory=list)


@dataclass
class PayoffMatrix:
    """Payoff dua pemain (bentuk bimatrix).

    ``a`` = payoff row player, ``b`` = payoff column player.
    Keduanya matriks berukuran (len(strat_row) x len(strat_col)).
    """

    a: np.ndarray
    b: np.ndarray

    def __post_init__(self):
        self.a = np.asarray(self.a, dtype=float)
        self.b = np.asarray(self.b, dtype=float)
        if self.a.shape != self.b.shape:
            raise ValueError(f"shape payoff tak sama: {self.a.shape} vs {self.b.shape}")

    @property
    def shape(self) -> tuple[int, int]:
        return self.a.shape


class BaseGame:
    """Kerangka sebuah game 2-pemain.

    Subclass meng-implement ``build_payoff`` yang menghasilkan PayoffMatrix.
    """

    def __init__(self, players: list[Player] | None = None, **params):
        self.players = players or []
        self.params = params
        self._payoff: PayoffMatrix | None = None

    def build_payoff(self) -> PayoffMatrix:
        raise NotImplementedError

    @property
    def payoff(self) -> PayoffMatrix:
        if self._payoff is None:
            self._payoff = self.build_payoff()
        return self._payoff

    def solve(self):
        """Cari equilibrium via solver default (Nash)."""
        from utpe.analysis.game_theory.solvers import nash_equilibria

        return nash_equilibria(self.payoff)
