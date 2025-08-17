from fastapi import APIRouter
from ..agents.marketbrain import forecast_action

router = APIRouter(prefix="/market", tags=["marketbrain"])
PRICES = [1850, 1875, 1860, 1888, 1920]

@router.get("/forecast")
def forecast():
    return forecast_action(PRICES).model_dump()
