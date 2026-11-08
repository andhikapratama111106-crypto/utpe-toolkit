from fastapi import APIRouter, HTTPException
from utpe.analysis import projection, tco
from utpe.reporting.validator import validate_projection, validate_tco

router = APIRouter()


@router.get("")
def run_validate():
    try:
        results = validate_tco(tco.run_fleet()) + validate_projection(
            projection.compare(konservatif=True)
        )
        return {
            "passed": not any(r.status in ("FAIL", "MISSING") for r in results),
            "checks": [
                {
                    "label": r.label,
                    "csv_value": r.csv_value,
                    "expected": r.es_value,
                    "status": r.status,
                }
                for r in results
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
