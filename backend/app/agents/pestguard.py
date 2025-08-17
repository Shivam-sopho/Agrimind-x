from ..core.schemas import PestResult
import random

CLASSES = [
    ("Bacterial Leaf Blight (paddy)", "Apply copper-based fungicide"),
    ("Brown Spot (paddy)", "Use balanced fertilizer and fungicide"),
    ("Nitrogen Deficiency", "Apply nitrogen fertilizer like urea"),
]

def classify(image_bytes: bytes) -> PestResult:
    label, treatment = random.choice(CLASSES)
    confidence = round(random.uniform(0.72, 0.95), 2)
    explanation = "Mock classification demo."
    return PestResult(label=label, confidence=confidence, treatment=treatment, explanation=explanation)
