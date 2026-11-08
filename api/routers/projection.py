from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utpe.analysis import projection as proj

router = APIRouter()


class ProjectionRequest(BaseModel):
    konservatif: bool = False


@router.post("")
def run_projection(req: ProjectionRequest):
    try:
        df = proj.compare(konservatif=req.konservatif)
        pw = float(df.iloc[0]["Total_Profit"])
        fin = float(df.iloc[1]["Total_Profit"])
        pct = (fin - pw) / pw * 100 if pw else None
        return {
            "price_war": {"profit": pw},
            "financing": {"profit": fin},
            "delta": {"absolute": fin - pw, "percentage": pct},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
