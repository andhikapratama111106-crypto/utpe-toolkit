"""Entry point Vercel (vercel.json -> api/main.py): FastAPI app UTPE Toolkit."""

import sys
from pathlib import Path

# Vercel menjalankan fungsi dari api/; paket `utpe` ada di root repo, `routers` di api/.
_API_DIR = Path(__file__).resolve().parent
for _p in (str(_API_DIR), str(_API_DIR.parent)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from routers import game, projection, sensitivity, tco, validate  # noqa: E402

VERSION = "0.1.0"

app = FastAPI(title="UTPE Toolkit API", version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "toolkit": f"utpe v{VERSION}"}


@app.get("/api/health")
def health():
    return {"ok": True, "version": VERSION}


app.include_router(tco.router, prefix="/api/tco")
app.include_router(sensitivity.router, prefix="/api/sensitivity")
app.include_router(projection.router, prefix="/api/projection")
app.include_router(game.router, prefix="/api/game")
app.include_router(validate.router, prefix="/api/validate")
