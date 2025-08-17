from fastapi import APIRouter
from ..agents import irrigai
from ..core.schemas import IrrigationRequest

router = APIRouter(prefix="/decide", tags=["irrigai"])

@router.post("/irrigai")
def irrigate(req: IrrigationRequest):
    res = irrigai.decide_irrigation(req)
    return res.model_dump()
