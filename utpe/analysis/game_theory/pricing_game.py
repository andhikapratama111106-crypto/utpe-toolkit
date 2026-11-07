"""Pricing games: Bertrand & Stackelberg (UTPE vs kompetitor China)."""

from __future__ import annotations

import numpy as np

from utpe import config
from utpe.analysis.game_theory.base import BaseGame, PayoffMatrix, Player


class BertrandGame(BaseGame):
    """Kompetisi harga simultan (Bertrand) dalam bentuk diskret.

    Tiap pemain memilih satu level harga dari ``prices``. Permintaan
    linear: perusahaan dengan harga lebih rendah merebut pangsa lebih besar.
    Profit = (harga - biaya) * kuantitas.
    """

    def __init__(self, prices: list[float], cost: float = 0.0, market_size: float = 100.0, **kw):
        players = [
            Player("UTPE", [str(p) for p in prices]),
            Player("China", [str(p) for p in prices]),
        ]
        super().__init__(players, **kw)
        self.prices = np.asarray(prices, dtype=float)
        self.cost = cost
        self.market_size = market_size

    def _demand(self, p_self: float, p_other: float) -> float:
        if p_self < p_other:
            return self.market_size
        if p_self > p_other:
            return 0.0
        return self.market_size / 2.0

    def build_payoff(self) -> PayoffMatrix:
        n = len(self.prices)
        a = np.zeros((n, n))
        b = np.zeros((n, n))
        for i, pi in enumerate(self.prices):
            for j, pj in enumerate(self.prices):
                a[i, j] = (pi - self.cost) * self._demand(pi, pj)
                b[i, j] = (pj - self.cost) * self._demand(pj, pi)
        return PayoffMatrix(a, b)


class MatrixGame(BaseGame):
    """Game bimatrix dengan payoff eksplisit (dibaca dari YAML).

    ``payoff_matrix`` berbentuk list baris; tiap sel adalah pasangan
    ``[payoff_row, payoff_col]``. Mis. ``[[[278, 100], [200, 150]], ...]``.
    """

    def __init__(self, payoff_matrix, players: list[Player] | None = None, **kw):
        super().__init__(players, **kw)
        self._raw = payoff_matrix

    def build_payoff(self) -> PayoffMatrix:
        arr = np.asarray(self._raw, dtype=float)
        # arr shape: (n_row, n_col, 2) -> pisah jadi payoff a (row) & b (col).
        a = arr[:, :, 0]
        b = arr[:, :, 1]
        return PayoffMatrix(a, b)


def build_bertrand(config_path: str | None = None):
    """Build game pricing Bertrand.

    Kalau ``config_path`` diberi dan YAML punya ``payoff_matrix``, pakai
    matriks eksplisit itu (MatrixGame). Kalau tidak, fallback ke BertrandGame
    default dan cetak peringatan.
    """
    if config_path:
        cfg = config.load_yaml(config_path)
        pm = cfg.get("payoff_matrix")
        if pm is not None:
            players = None
            strat = cfg.get("strategies") or {}
            names = cfg.get("players") or list(strat.keys())
            if names:
                players = [Player(str(n), [str(s) for s in strat.get(n, [])]) for n in names]
            return MatrixGame(pm, players=players)
        # YAML lama (kind/params): pakai params prices/cost.
        params = cfg.get("params") or {}
        if "prices" in params:
            return BertrandGame(
                prices=params["prices"],
                cost=params.get("cost", 0.0),
                market_size=params.get("market_size", 100.0),
            )
        print("[warn] config tidak punya payoff_matrix/params, pakai payoff default")
    else:
        print("[warn] pakai payoff default")
    return BertrandGame(prices=[100, 110], cost=90)


class StackelbergGame(BaseGame):
    """Kompetisi kuantitas dengan pemimpin-pengikut (Stackelberg).

    Inverse demand: P = a - b*(q_leader + q_follower).
    Leader memilih q lebih dulu; follower membalas best-response.
    """

    def __init__(self, a: float = 1000.0, b: float = 1.0, cost: float = 100.0, **kw):
        super().__init__([Player("UTPE (leader)"), Player("China (follower)")], **kw)
        self.a = a
        self.b = b
        self.cost = cost

    def follower_best_response(self, q_leader: float) -> float:
        q = (self.a - self.cost - self.b * q_leader) / (2 * self.b)
        return max(q, 0.0)

    def solve_stackelberg(self) -> dict:
        """Hitung keluaran Stackelberg (closed-form kuantitas linear)."""
        q_leader = (self.a - self.cost) / (2 * self.b)
        q_follower = self.follower_best_response(q_leader)
        price = self.a - self.b * (q_leader + q_follower)
        profit_leader = (price - self.cost) * q_leader
        profit_follower = (price - self.cost) * q_follower
        return {
            "q_leader": q_leader,
            "q_follower": q_follower,
            "price": price,
            "profit_leader": profit_leader,
            "profit_follower": profit_follower,
        }

    def build_payoff(self) -> PayoffMatrix:
        # Diskretisasi kuantitas untuk representasi bimatrix.
        qmax = (self.a - self.cost) / self.b
        grid = np.linspace(0, qmax, 6)
        n = len(grid)
        a = np.zeros((n, n))
        bmat = np.zeros((n, n))
        for i, ql in enumerate(grid):
            for j, qf in enumerate(grid):
                price = self.a - self.b * (ql + qf)
                a[i, j] = (price - self.cost) * ql
                bmat[i, j] = (price - self.cost) * qf
        return PayoffMatrix(a, bmat)
