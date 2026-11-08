from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from utpe.analysis import sensitivity as sens

router = APIRouter()


class SensitivityRequest(BaseModel):
    # shortcut: batas 100k iterasi supaya request tidak membebani server, naikkan jika perlu.
    iterations: int = Field(default=1000, ge=1, le=100_000)
    monte_carlo: bool = True


@router.post("")
def run_sensitivity(req: SensitivityRequest):
    try:
        df = sens.run_scenarios()
        scenarios = [
            {"skenario": str(r["Skenario"]), "cost_per_hour": float(r["Cost_per_Hour"])}
            for _, r in df.iterrows()
        ]
        mc = None
        if req.monte_carlo:
            m = sens.monte_carlo(n=req.iterations)
            mc = {k: float(m[k]) for k in ("p10", "p50", "p90")}
        return {"scenarios": scenarios, "mc": mc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
