from fastapi import FastAPI, WebSocket
from .routes import inference, decisions, ocr, finance, market, events
from dotenv import load_dotenv
load_dotenv()

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

@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        # For now, just echo the message back
        await websocket.send_text(f"You said: {data}")
