"""Solver Nash equilibrium 2x2 -- tanpa dependensi eksternal selain numpy."""

from __future__ import annotations

from utpe.analysis.game_theory.base import PayoffMatrix


def find_nash_equilibria(payoff: PayoffMatrix) -> list[dict]:
    """Cari Nash equilibrium untuk game 2x2 (pure + mixed)."""
    A, B = payoff.a, payoff.b
    equilibria: list[dict] = []

    # Pure strategy equilibrium
    for i in range(2):
        for j in range(2):
            utpe_ok = A[i, j] >= A[1 - i, j]
            sany_ok = B[i, j] >= B[i, 1 - j]
            if utpe_ok and sany_ok:
                equilibria.append(
                    {
                        "type": "pure",
                        "utpe_strategy": i,
                        "sany_strategy": j,
                        "payoff": (float(A[i, j]), float(B[i, j])),
                        "pareto_optimal": _is_pareto(A, B, i, j),
                    }
                )

    # Mixed strategy (hanya jika tidak ada pure)
    if not equilibria:
        denom_a = A[0, 0] - A[0, 1] - A[1, 0] + A[1, 1]
        denom_b = B[0, 0] - B[1, 0] - B[0, 1] + B[1, 1]
        if denom_a != 0 and denom_b != 0:
            p = (A[1, 1] - A[0, 1]) / denom_a
            q = (B[1, 1] - B[1, 0]) / denom_b
            if 0 < p < 1 and 0 < q < 1:
                eq_payoff_a = (
                    p * q * A[0, 0]
                    + p * (1 - q) * A[0, 1]
                    + (1 - p) * q * A[1, 0]
                    + (1 - p) * (1 - q) * A[1, 1]
                )
                eq_payoff_b = (
                    p * q * B[0, 0]
                    + p * (1 - q) * B[0, 1]
                    + (1 - p) * q * B[1, 0]
                    + (1 - p) * (1 - q) * B[1, 1]
                )
                equilibria.append(
                    {
                        "type": "mixed",
                        "utpe_probabilities": (float(p), float(1 - p)),
                        "sany_probabilities": (float(q), float(1 - q)),
                        "payoff": (float(eq_payoff_a), float(eq_payoff_b)),
                        "pareto_optimal": False,
                    }
                )
    return equilibria


def _is_pareto(A, B, i, j) -> bool:
    for i2 in range(2):
        for j2 in range(2):
            if (i2, j2) == (i, j):
                continue
            if A[i2, j2] >= A[i, j] and B[i2, j2] >= B[i, j]:
                if A[i2, j2] > A[i, j] or B[i2, j2] > B[i, j]:
                    return False
    return True


def nash_equilibria(payoff: PayoffMatrix) -> list[dict]:
    """Alias untuk kompatibilitas."""
    return find_nash_equilibria(payoff)
