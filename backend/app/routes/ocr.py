from fastapi import APIRouter, UploadFile, File
from ..agents import financeflow

router = APIRouter(prefix="/ocr", tags=["financeflow"])

@router.post("/financeflow")
async def ocr_extract(file: UploadFile = File(...)):
    text = (await file.read()).decode(errors="ignore")
    return financeflow.ocr_extract(text).model_dump()
