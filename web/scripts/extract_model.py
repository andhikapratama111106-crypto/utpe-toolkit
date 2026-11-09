#!/usr/bin/env python3
"""Extract the numbers the web UI shows from the NBCC 2026 Excel model.

Usage: python3 web/scripts/extract_model.py <path/to/UTPE_PATRIA_Model_NBCC2026.xlsx>
Writes web/src/content/model.json (committed; the .xlsx itself is not).
Needs openpyxl (cached values are read, so the workbook must have been saved by Excel).
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parents[1] / "src" / "content" / "model.json"
BINS = 40

wb = openpyxl.load_workbook(SRC, data_only=True)


def rows(sheet, r0, r1, c0=1, c1=9):
    ws = wb[sheet]
    return [[c.value for c in row] for row in ws.iter_rows(min_row=r0, max_row=r1, min_col=c0, max_col=c1)]


# --- Dashboard (active scenario = Base) -----------------------------------
dash = {r[0]: r for r in rows("Dashboard", 1, 33, 1, 7) if r[0]}
years = [int(str(y)[:4]) for y in dash["Proyeksi (skenario aktif)"][1:7]]
series = {k: [float(v) for v in dash[k][1:7]] for k in (
    "Pendapatan — strategi", "Pendapatan — do-nothing", "EBITDA — strategi", "EBITDA — do-nothing",
    "Margin EBITDA — strategi", "Margin EBITDA — do-nothing", "Δ Arus kas bebas")}
cum = [float(v) for v in dash["Δ Arus kas kumulatif"][2:7]]
assert dash["Skenario aktif"][1] == "Base", "workbook active scenario must be Base"

# --- Scenarios ---------------------------------------------------------------
sc = rows("Scenarios", 1, 27, 1, 8)
head = next(r for r in sc if r[0] == "Metrik")
names = [str(x) for x in head[2:7]]
scenarios = {
    str(r[0]): {"unit": r[1], "values": [r[i] for i in range(2, 7)]}
    for r in sc
    if r[0] and r[1] and r[0] != "Metrik" and any(isinstance(v, (int, float)) or isinstance(v, str) for v in r[2:7])
}

# --- Monte Carlo samples (real, 10.000 iterations) -------------------------
ws = wb["MC_Data"]
hdr = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
ix = hdr.index("npv")
npv = sorted(float(r[ix]) for r in ws.iter_rows(min_row=2, values_only=True) if r[ix] is not None)
n = len(npv)


def pct(p):
    k = (n - 1) * p
    lo = int(k)
    return npv[lo] + (npv[min(lo + 1, n - 1)] - npv[lo]) * (k - lo)


lo_edge, hi_edge = -300.0, 1200.0
step = (hi_edge - lo_edge) / BINS
counts = [0] * BINS
for v in npv:
    if lo_edge <= v < hi_edge:  # draws outside the axis range are counted in `clipped`, not binned
        counts[int((v - lo_edge) // step)] += 1
mc = {
    "n": n, "seed": 20261106,
    "p10": pct(0.10), "p50": pct(0.50), "p90": pct(0.90),
    "pNegative": sum(1 for v in npv if v < 0) / n,
    "min": npv[0], "max": npv[-1],
    "bins": [{"x0": lo_edge + i * step, "x1": lo_edge + (i + 1) * step, "count": c} for i, c in enumerate(counts)],
    "clipped": sum(1 for v in npv if v < lo_edge or v >= hi_edge),
}

# --- Tornado (NPV sensitivity, Rp M) -----------------------------------------
tor = [r for r in rows("Sensitivity", 1, 62, 1, 6)]
start = next(i for i, r in enumerate(tor) if r[0] and str(r[0]).startswith("Variabel (P10"))
tornado = []
for r in tor[start + 1:]:
    if r[0] is None or not isinstance(r[3], (int, float)):
        break
    tornado.append({"variable": r[0], "npvP10": r[3], "npvP90": r[4], "range": r[5]})
tornado = tornado[:10]

# --- Logistics SAM (Build_Base) --------------------------------------------
bb = rows("Build_Base", 1, 123, 1, 8)
sam_row = next(r for r in bb if r[0] and str(r[0]).startswith("SAM bodi & trailer"))
sam_logistics = {"unit": sam_row[1], "values": [float(v) for v in sam_row[3:8]], "years": years[1:]}

# --- Sources (APA 7) with hyperlinks -------------------------------------------
wsx = openpyxl.load_workbook(SRC, data_only=False)["Sources"]  # hyperlinks live in HYPERLINK() formulas
sources = []
for row in wsx.iter_rows(min_row=4, max_row=wsx.max_row):
    sid = row[0].value
    if not sid or not str(sid)[0] in "SA" or len(str(sid)) != 3:
        continue
    cell = row[2]
    m = re.search(r'HYPERLINK\("([^"]+)"', str(cell.value or ""))
    link = m.group(1) if m else (cell.hyperlink.target if cell.hyperlink else None)
    sources.append({"id": sid, "ref": row[1].value, "url": link, "usedFor": row[3].value, "type": row[4].value})

out = {
    "provenance": {"file": re.sub(r"(^[0-9a-f]{32}_)|(_\d+(?=\.xlsx$))", "", SRC.name), "note": "Case data is dummy (Case Book); see Sources S01."},
    "years": years,
    "indicators": {
        "npvBase": float(dash["NPV inkremental (Rp M)"][1]),
        "npvExTv": float(dash["NPV tanpa nilai terminal (Rp M)"][1]),
        "peak": float(dash["Dana puncak (Rp M)"][1]),
        "paybackYear": int(dash["Tahun payback"][1]),
        "investment": float(dash["Investasi (Rp M)"][1]),
        "checks": dash["Status pemeriksaan"][3] if False else str(dash["Skenario aktif"][4]),
    },
    "series": series,
    "cumulativeFcf": cum,
    "scenarioNames": names,
    "scenarios": scenarios,
    "monteCarlo": mc,
    "tornado": tornado,
    "samLogistics": sam_logistics,
    "sources": sources,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
print("wrote", OUT, OUT.stat().st_size, "bytes;", len(sources), "sources;", f"P10/50/90={mc['p10']:.0f}/{mc['p50']:.0f}/{mc['p90']:.0f}", f"P(neg)={mc['pNegative']:.4f}", "clipped", mc["clipped"])
