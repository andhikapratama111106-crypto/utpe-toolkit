"""Module 6b: chart matplotlib dengan palette korporat UTPE."""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # non-interaktif; aman untuk CLI/headless.
import matplotlib.pyplot as plt  # noqa: E402

from utpe import config  # noqa: E402


def _style(ax):
    ax.grid(True, color=config.PALETTE["grid"], linewidth=0.8)
    ax.set_axisbelow(True)
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    ax.tick_params(colors=config.PALETTE["hitam"])


def bar_cost_per_hour(df, output_path: str | Path | None = None) -> str:
    """Bar chart cost-per-hour per merek."""
    out = Path(output_path or (config.OUTPUT_DIR / "cost_per_hour.png"))
    fig, ax = plt.subplots(figsize=(8, 5))
    colors = (config.CHART_COLORS * ((len(df) // 3) + 1))[: len(df)]
    ax.bar(df["Merek"], df["Cost_per_Hour"], color=colors)
    ax.set_title("Cost per Hour (TCO)", color=config.PALETTE["hitam"], fontweight="bold")
    ax.set_ylabel("Rp / jam")
    _style(ax)
    fig.tight_layout()
    fig.savefig(out, dpi=120)
    plt.close(fig)
    return str(out)


def hist_monte_carlo(samples, output_path: str | Path | None = None) -> str:
    """Histogram hasil Monte Carlo cost-per-hour."""
    out = Path(output_path or (config.OUTPUT_DIR / "monte_carlo.png"))
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(samples, bins=40, color=config.PALETTE["merah"], alpha=0.85)
    ax.set_title(
        "Distribusi Monte Carlo: Cost per Hour", color=config.PALETTE["hitam"], fontweight="bold"
    )
    ax.set_xlabel("Rp / jam")
    ax.set_ylabel("Frekuensi")
    _style(ax)
    fig.tight_layout()
    fig.savefig(out, dpi=120)
    plt.close(fig)
    return str(out)
