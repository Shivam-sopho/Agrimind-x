from ..core.schemas import OCRResult, FinanceSubmit
import re

def ocr_extract(text: str) -> OCRResult:
    name = re.search(r'Name[:\\s]+([A-Za-z ]+)', text)
    land = re.search(r'(\\d+(?:\\.\\d+)?)\\s*(ha|hectare)', text, re.I)
    fields = {}
    if name: fields["farmer_name"] = name.group(1).strip()
    if land: fields["land_size_ha"] = land.group(1)
    return OCRResult(fields=fields, explanation="Extracted demo fields")

def submit_finance(data: FinanceSubmit) -> dict:
    return {"status":"received","application_id":"FIN-"+str(abs(hash(str(data.fields))))[:8]}
