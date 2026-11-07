"""Module 5: game theory (pricing, entry, mechanism design)."""

from __future__ import annotations

from utpe.analysis.game_theory.base import BaseGame, PayoffMatrix, Player
from utpe.analysis.game_theory.entry_game import EntryGame
from utpe.analysis.game_theory.mechanism import FinancingOffer, choose_offer
from utpe.analysis.game_theory.pricing_game import (
    BertrandGame,
    MatrixGame,
    StackelbergGame,
    build_bertrand,
)
from utpe.analysis.game_theory.solvers import find_nash_equilibria, nash_equilibria

__all__ = [
    "BaseGame",
    "PayoffMatrix",
    "Player",
    "BertrandGame",
    "MatrixGame",
    "build_bertrand",
    "StackelbergGame",
    "EntryGame",
    "FinancingOffer",
    "choose_offer",
    "find_nash_equilibria",
    "nash_equilibria",
]
