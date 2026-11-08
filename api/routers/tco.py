from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from utpe.analysis.tco import compute_tco
from utpe.models import TCOConfig

router = APIRouter()


class TCORequest(BaseModel):
    brand: str
    model: str
    purchase_price: float = Field(gt=0)
    lifetime_hours: float = Field(gt=0)
    maintenance_per_hour: float = Field(ge=0)
    fuel_consumption_lph: float = Field(ge=0)
    fuel_price_per_liter: float = Field(ge=0)
    operator_wage_per_hour: float = Field(ge=0)


@router.post("")
def run_tco(req: TCORequest):
    try:
        cfg = TCOConfig(
            merek=req.brand,
            model=req.model,
            harga_beli=req.purchase_price,
            lifetime_jam=req.lifetime_hours,
            biaya_maintenance_jam=req.maintenance_per_hour,
            konsumsi_bbm=req.fuel_consumption_lph,
            harga_solar=req.fuel_price_per_liter,
            upah_operator=req.operator_wage_per_hour,
        )
        r = compute_tco(cfg)
        return {
            "brand": req.brand,
            "model": req.model,
            "total_tco": float(r["Total_TCO"]),
            "cost_per_hour": float(r["Cost_per_Hour"]),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
