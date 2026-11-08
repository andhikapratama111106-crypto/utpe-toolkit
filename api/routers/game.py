from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utpe import config
from utpe.analysis.game_theory import build_bertrand, nash_equilibria

router = APIRouter()


class GameRequest(BaseModel):
    game: str = "bertrand"
    config: str = "pricing_war.yaml"


@router.post("")
def run_game(req: GameRequest):
    if req.game != "bertrand":
        raise HTTPException(status_code=400, detail=f"game '{req.game}' tidak didukung")
    # Hanya nama file di configs/games/ (cegah path traversal).
    path = config.GAMES_CONFIG_DIR / req.config
    if path.name != req.config or not path.is_file():
        raise HTTPException(status_code=400, detail=f"config '{req.config}' tidak ditemukan")
    try:
        g = build_bertrand(str(path))
        eqs = nash_equilibria(g.payoff)
        # Equilibrium "mixed" tidak punya utpe_strategy/sany_strategy, jadi salin apa adanya.
        eqs = [{k: list(v) if isinstance(v, tuple) else v for k, v in e.items()} for e in eqs]
        return {
            "players": [{"name": p.name, "strategies": p.strategies} for p in g.players],
            "equilibria": eqs,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
