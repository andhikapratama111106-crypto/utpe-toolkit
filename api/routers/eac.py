from fastapi import APIRouter, HTTPException, Query
from utpe.analysis import eac

router = APIRouter()


@router.get("")
def run_eac(
    r: float = Query(0.12, ge=0, le=0.5),
    tenor: float = Query(4, gt=0, le=10),
    sisa: float = Query(0.80, ge=0, le=1),
):
    try:
        return {
            "r": r,
            "tenor": tenor,
            "sisa": sisa,
            "produk": eac.tabel(r, tenor, sisa),
            "c_essential": eac.c_essential(r, tenor, sisa),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/discount")
def run_discount(
    discount: float = Query(0.20, gt=0, lt=1),
    margin: float = Query(0.30, gt=0, lt=1),
    price: float = Query(4.16, gt=0),
):
    try:
        return eac.diskon_vs_volume(price, discount, margin)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
