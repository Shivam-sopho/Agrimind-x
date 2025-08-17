from fastapi import APIRouter, UploadFile, File
from ..agents import pestguard

router_api = APIRouter(prefix="/infer", tags=["pestguard"])

@router_api.post("/pestguard")
async def pestguard_infer(file: UploadFile = File(...)):
    img = await file.read()
    result = pestguard.classify(img)
    return result.model_dump()
