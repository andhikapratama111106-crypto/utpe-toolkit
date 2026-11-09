"""Test endpoint FastAPI (api/main.py), panggil ASGI langsung tanpa httpx/server."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "api"))

from main import app  # noqa: E402


def call(method: str, path: str, body: dict | None = None, query: str = "") -> tuple[int, dict]:
    payload = json.dumps(body).encode() if body is not None else b""
    sent: list[dict] = []

    async def receive():
        return {"type": "http.request", "body": payload, "more_body": False}

    async def send(msg):
        sent.append(msg)

    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "raw_path": path.encode(),
        "query_string": query.encode(),
        "headers": [(b"content-type", b"application/json")],
        "server": ("127.0.0.1", 8000),
        "client": ("127.0.0.1", 1),
        "scheme": "http",
        "http_version": "1.1",
    }
    asyncio.run(app(scope, receive, send))
    status = next(m["status"] for m in sent if m["type"] == "http.response.start")
    data = b"".join(m.get("body", b"") for m in sent if m["type"] == "http.response.body")
    return status, json.loads(data)


TCO_BODY = {
    "brand": "UTPE",
    "model": "B",
    "purchase_price": 4_160_000_000,
    "lifetime_hours": 12_000,
    "maintenance_per_hour": 55_000,
    "fuel_consumption_lph": 12,
    "fuel_price_per_liter": 25_200,
    "operator_wage_per_hour": 50_000,
}


def test_health():
    assert call("GET", "/api/health") == (200, {"ok": True, "version": "0.2.0"})


def test_tco():
    s, r = call("POST", "/api/tco", TCO_BODY)
    assert s == 200
    assert round(r["cost_per_hour"]) == 754_067


def test_tco_invalid():
    s, _ = call("POST", "/api/tco", {**TCO_BODY, "lifetime_hours": 0})
    assert s == 422


def test_sensitivity():
    s, r = call("POST", "/api/sensitivity", {"iterations": 500})
    assert s == 200
    assert len(r["scenarios"]) == 5
    assert r["mc"]["p10"] < r["mc"]["p50"] < r["mc"]["p90"]
    assert call("POST", "/api/sensitivity", {"monte_carlo": False})[1]["mc"] is None
    assert call("POST", "/api/sensitivity", {"iterations": 0})[0] == 422


def test_projection():
    s, r = call("POST", "/api/projection", {"konservatif": True})
    assert s == 200
    assert round(r["price_war"]["profit"]) == 133_120_000_000
    assert round(r["financing"]["profit"]) == 278_220_800_000


def test_game():
    s, r = call("POST", "/api/game", {})
    assert s == 200
    assert r["equilibria"][0]["type"] == "pure"
    assert r["players"][0]["name"] == "UTPE"
    assert call("POST", "/api/game", {"config": "../tco_base.yaml"})[0] == 400
    assert call("POST", "/api/game", {"game": "x"})[0] == 400


def test_validate():
    s, r = call("GET", "/api/validate")
    assert s == 200
    assert r["passed"] is True
    assert len(r["checks"]) == 10
    assert all(c["status"] == "OK" for c in r["checks"])


def test_eac():
    s, r = call("GET", "/api/eac")
    assert s == 200
    by = {p["produk"]: p for p in r["produk"]}
    assert round(by["B"]["selisih_eac"] * 100, 1) == -8.1
    assert round(by["C"]["diskonto_impas"] * 100, 1) == 13.3
    s, r = call("GET", "/api/eac", query="r=0.14")
    assert s == 200 and {p["produk"]: p for p in r["produk"]}["C"]["selisih_eac"] > 0
    assert call("GET", "/api/eac", query="r=0.9")[0] == 422


def test_eac_discount():
    s, r = call("GET", "/api/eac/discount", query="discount=0.2&margin=0.3")
    assert s == 200
    assert round(r["volume_impas"], 2) == 3.0
    assert call("GET", "/api/eac/discount", query="discount=1.5")[0] == 422
