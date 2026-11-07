"""Test CLI (click)."""

from click.testing import CliRunner

from utpe import __version__
from utpe.cli import cli


def test_version():
    res = CliRunner().invoke(cli, ["--version"])
    assert res.exit_code == 0
    assert __version__ in res.output


def test_help_lists_commands():
    res = CliRunner().invoke(cli, ["--help"])
    assert res.exit_code == 0
    for cmd in ["scrape", "tco", "sensitivity", "project", "game", "validate", "pipeline"]:
        assert cmd in res.output


def test_tco_command_runs():
    res = CliRunner().invoke(cli, ["tco"])
    assert res.exit_code == 0
    assert "Cost_per_Hour" in res.output


def test_game_entry_runs():
    res = CliRunner().invoke(cli, ["game", "entry"])
    assert res.exit_code == 0
    assert "Entry" in res.output


def test_scrape_injected_source(tmp_path):
    # Scraper injeksi (rkab) jalan tanpa jaringan.
    res = CliRunner().invoke(cli, ["scrape", "rkab"])
    assert res.exit_code == 0
    assert "rkab" in res.output
