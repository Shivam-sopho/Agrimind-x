from ..core.schemas import IrrigationRequest, IrrigationDecision

def decide_irrigation(req: IrrigationRequest) -> IrrigationDecision:
    if req.rain_48h_mm >= 5:
        return IrrigationDecision(
            recommendation="Delay irrigation 48h (rain expected)",
            liters=0.0,
            explanation=f"Rain {req.rain_48h_mm}mm forecast",
            confidence=0.9
        )
    if req.soil_moisture < 18:
        return IrrigationDecision(
            recommendation="Irrigate 20mm tonight",
            liters=20000.0,
            explanation=f"Soil moisture {req.soil_moisture}% < threshold",
            confidence=0.8
        )
    return IrrigationDecision(
        recommendation="No irrigation needed",
        liters=0.0,
        explanation="Soil moisture adequate",
        confidence=0.7
    )
