"""Test Module 5: game theory."""

import numpy as np

from pathlib import Path

from utpe.analysis.game_theory import (
    BertrandGame,
    EntryGame,
    FinancingOffer,
    StackelbergGame,
    build_bertrand,
    choose_offer,
    find_nash_equilibria,
    nash_equilibria,
)
from utpe.analysis.game_theory.base import PayoffMatrix

PRICING_WAR_YAML = (
    Path(__file__).resolve().parent.parent / "configs" / "games" / "pricing_war.yaml"
)


def test_payoff_matrix_shape_mismatch():
    import pytest

    with pytest.raises(ValueError):
        PayoffMatrix(np.zeros((2, 2)), np.zeros((2, 3)))


def test_prisoners_dilemma_pure_nash():
    # Klasik PD: (Defect, Defect) satu-satunya pure NE.
    a = np.array([[3, 0], [5, 1]])  # row payoff
    b = np.array([[3, 5], [0, 1]])  # col payoff
    pm = PayoffMatrix(a, b)
    eqs = find_nash_equilibria(pm)
    assert len(eqs) == 1
    eq = eqs[0]
    assert eq["type"] == "pure"
    assert eq["utpe_strategy"] == 1 and eq["sany_strategy"] == 1
    assert eq["payoff"] == (1.0, 1.0)
    assert eq["pareto_optimal"] is False


def test_matching_pennies_mixed_nash():
    a = np.array([[1, -1], [-1, 1]])
    b = -a
    eqs = find_nash_equilibria(PayoffMatrix(a, b))
    assert len(eqs) == 1
    eq = eqs[0]
    assert eq["type"] == "mixed"
    assert eq["utpe_probabilities"] == (0.5, 0.5)
    assert eq["sany_probabilities"] == (0.5, 0.5)
    assert eq["payoff"] == (0.0, 0.0)


def test_bertrand_builds_and_solves():
    g = BertrandGame(prices=[100, 110], cost=90, market_size=100)
    assert g.payoff.shape == (2, 2)
    eqs = nash_equilibria(g.payoff)
    assert len(eqs) >= 1


def test_stackelberg_leader_advantage():
    g = StackelbergGame(a=1000, b=1, cost=100)
    res = g.solve_stackelberg()
    # Leader memproduksi lebih banyak dari follower.
    assert res["q_leader"] > res["q_follower"]
    assert res["price"] > 100


def test_entry_game_structure():
    g = EntryGame()
    assert g.payoff.shape == (2, 2)
    eqs = nash_equilibria(g.payoff)
    assert len(eqs) >= 1


def test_pricing_war_yaml_nash_locked():
    # Lock-in hasil Nash equilibrium dari configs/games/pricing_war.yaml.
    # Kalau payoff_matrix berubah, test ini fail -> sinyal NE berubah.
    g = build_bertrand(str(PRICING_WAR_YAML))
    eqs = nash_equilibria(g.payoff)
    assert len(eqs) == 1
    eq = eqs[0]
    assert eq["type"] == "pure"
    assert eq["utpe_strategy"] == 0  # UTPE Premium + Financing
    assert eq["sany_strategy"] == 1  # SANY Agresif
    assert eq["payoff"] == (200.0, 150.0)
    assert eq["pareto_optimal"] is True


def test_mechanism_choose_offer():
    offers = [
        FinancingOffer("A", harga=100, dp_pct=0.2, bunga_pct=0.09, tenor_bulan=36),
        FinancingOffer("B", harga=100, dp_pct=0.1, bunga_pct=0.11, tenor_bulan=48),
    ]
    res = choose_offer(offers, willingness_to_pay=200, outside_option=0)
    assert res["participates"] is True
    assert res["chosen"] in {"A", "B"}
