from fastapi import FastAPI
from .routes import inference, decisions, ocr, finance, market, events

app = FastAPI(title="AgriMind-X API", version="0.1.0")

app.include_router(inference.router_api)
app.include_router(decisions.router)
app.include_router(ocr.router)
app.include_router(finance.router)
app.include_router(market.router)
app.include_router(events.router)

@app.get("/")
def root():
    return {"msg": "AgriMind-X API running"}
