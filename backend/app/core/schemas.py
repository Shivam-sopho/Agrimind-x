from pydantic import BaseModel
from typing import Optional, List, Dict

class IrrigationRequest(BaseModel):
    soil_moisture: float
    rain_48h_mm: float
    crop_stage: str = "vegetative"

class IrrigationDecision(BaseModel):
    recommendation: str
    liters: Optional[float]
    explanation: str
    confidence: float

class PestResult(BaseModel):
    label: str
    confidence: float
    treatment: str
    explanation: str

class OCRResult(BaseModel):
    fields: Dict[str, str]
    explanation: str

class FinanceSubmit(BaseModel):
    fields: Dict[str, str]

class MarketForecast(BaseModel):
    action: str
    explanation: str
    prices: List[float]

class Event(BaseModel):
    event_id: str
    agent: str
    inputs: Dict
    output: Dict
    explanation: str
