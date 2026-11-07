"""Entry point CLI (click) untuk toolkit UTPE."""

from __future__ import annotations

import click

from utpe import __version__, config
from utpe.analysis import projection, sensitivity, tco
from utpe.analysis.game_theory import (
    EntryGame,
    StackelbergGame,
    build_bertrand,
    nash_equilibria,
)
from utpe.reporting import charts, export
from utpe.reporting.validator import validate_projection, validate_tco
from utpe.scrapers import REGISTRY


@click.group()
@click.version_option(__version__, prog_name="utpe")
def cli():
    """UTPE toolkit: scraping, TCO, sensitivity, proyeksi, game theory, validasi."""


# --------------------------------------------------------------------------
# scrape
# --------------------------------------------------------------------------
@cli.command()
@click.argument("source", required=False)
@click.option("--all", "run_all", is_flag=True, help="Jalankan semua scraper.")
def scrape(source, run_all):
    """Jalankan scraper. SOURCE = salah satu nama di registry, atau --all."""
    targets = list(REGISTRY) if run_all else ([source] if source else [])
    if not targets:
        click.echo("Pilih SOURCE atau --all. Tersedia: " + ", ".join(REGISTRY))
        return
    for name in targets:
        cls = REGISTRY.get(name)
        if not cls:
            click.echo(f"[skip] scraper '{name}' tidak dikenal")
            continue
        sc = cls()
        items = sc.run()
        out = sc.save(items)
        click.echo(f"[ok] {name}: {len(items)} baris -> {out}")


# --------------------------------------------------------------------------
# tco
# --------------------------------------------------------------------------
@cli.command()
@click.option("--chart", is_flag=True, help="Buat bar chart cost-per-hour.")
def tco_cmd(chart):
    """Hitung TCO armada default dan simpan CSV."""
    df = tco.run_fleet()
    out = tco.save(df)
    click.echo(df.to_string(index=False))
    click.echo(f"\n[ok] disimpan -> {out}")
    if chart:
        click.echo(f"[ok] chart -> {charts.bar_cost_per_hour(df)}")


cli.add_command(tco_cmd, name="tco")


# --------------------------------------------------------------------------
# sensitivity
# --------------------------------------------------------------------------
@cli.command()
@click.option("--monte-carlo", "mc", is_flag=True, help="Jalankan Monte Carlo.")
@click.option("--n", default=10_000, help="Jumlah iterasi Monte Carlo.")
def sensitivity_cmd(mc, n):
    """Sensitivity deterministik, opsional Monte Carlo."""
    df = sensitivity.run_scenarios()
    out = sensitivity.save(df)
    click.echo(df.to_string(index=False))
    click.echo(f"\n[ok] disimpan -> {out}")
    if mc:
        res = sensitivity.monte_carlo(n=n)
        click.echo(
            f"\nMonte Carlo (n={res['n']}): "
            f"P10={res['p10']:,.0f} P50={res['p50']:,.0f} P90={res['p90']:,.0f}"
        )
        click.echo(f"[ok] chart -> {charts.hist_monte_carlo(res['samples'])}")


cli.add_command(sensitivity_cmd, name="sensitivity")


# --------------------------------------------------------------------------
# project (proyeksi finansial)
# --------------------------------------------------------------------------
@cli.command()
@click.option("--konservatif", is_flag=True, help="Pakai margin financing konservatif 3%.")
def project(konservatif):
    """Bandingkan strategi Price War vs Financing."""
    df = projection.compare(konservatif=konservatif)
    out = projection.save(df)
    click.echo(df.to_string(index=False))
    a = df.iloc[0]["Total_Profit"]
    b = df.iloc[1]["Total_Profit"]
    click.echo(f"\nSelisih profit: Rp {b - a:,.0f} ({(b - a) / a * 100:.1f}%)")
    click.echo(f"[ok] disimpan -> {out}")


# --------------------------------------------------------------------------
# game
# --------------------------------------------------------------------------
@cli.command()
@click.argument("kind", type=click.Choice(["bertrand", "stackelberg", "entry"]))
@click.option("--config", "config_path", default=None, help="YAML payoff untuk game bertrand.")
def game(kind, config_path):
    """Selesaikan satu game: bertrand | stackelberg | entry."""
    if kind == "bertrand":
        g = build_bertrand(config_path)
        eqs = nash_equilibria(g.payoff)
        click.echo(f"Bertrand: {len(eqs)} equilibria")
        for eq in eqs:
            click.echo(f"  {eq}")
    elif kind == "stackelberg":
        g = StackelbergGame()
        res = g.solve_stackelberg()
        for k, v in res.items():
            click.echo(f"  {k}: {v:,.2f}")
    else:
        g = EntryGame()
        eqs = nash_equilibria(g.payoff)
        click.echo(f"Entry: {len(eqs)} equilibria")
        for eq in eqs:
            click.echo(f"  {eq}")


# --------------------------------------------------------------------------
# validate
# --------------------------------------------------------------------------
@cli.command()
def validate():
    """Validasi konsistensi angka TCO vs Executive Summary, tulis report."""
    df_tco = tco.run_fleet()
    df_proj = projection.compare(konservatif=True)
    results = validate_tco(df_tco) + validate_projection(df_proj)
    for r in results:
        click.echo(f"  {r.label}: {r.status} ({r.diff_pct:.2f}%)")
    out = export.validation_report_md(results)
    click.echo(f"[ok] report -> {out}")


# --------------------------------------------------------------------------
# pipeline
# --------------------------------------------------------------------------
@cli.command()
@click.pass_context
def pipeline(ctx):
    """Jalankan seluruh alur: scrape all -> tco -> sensitivity -> project -> validate."""
    ctx.invoke(scrape, run_all=True)
    ctx.invoke(tco_cmd, chart=True)
    ctx.invoke(sensitivity_cmd, mc=True, n=5_000)
    ctx.invoke(project, konservatif=True)
    ctx.invoke(validate)
    click.echo(f"\n[done] output di {config.OUTPUT_DIR}")


if __name__ == "__main__":
    cli()
