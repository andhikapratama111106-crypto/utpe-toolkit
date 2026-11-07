from fastapi import FastAPI
from pydantic import BaseModel
from utpe.analysis.tco import calculate_tco, TCOConfig

app = FastAPI()


class TCORequest(BaseModel):
    brand: str
    model: str
    purchase_price: float
    lifetime_hours: int
    maintenance_per_hour: float
    fuel_consumption_lph: float
    fuel_price_per_liter: float
    operator_wage_per_hour: float


@app.get("/")
def root():
    return {"status": "ok", "toolkit": "utpe v0.1.0"}


@app.post("/api/tco")
def run_tco(req: TCORequest):
    config = TCOConfig(**req.model_dump())
    return calculate_tco(config)
