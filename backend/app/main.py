from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import base64
import json
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
        try:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if 'image' in msg:
                image_data = base64.b64decode(msg['image'])
                with open('received_image.jpg', 'wb') as f:
                    f.write(image_data)
                await websocket.send_text("Image received!")
            elif 'audio' in msg:
                audio_data = base64.b64decode(msg['audio'])
                with open('received_audio.wav', 'wb') as f:
                    f.write(audio_data)
                print("Audio received and saved as received_audio.wav")
                await websocket.send_text("Audio received!")
            elif 'text' in msg:
                # Call LLM for text messages
                llm_response = inference.call_llm_api(msg['text'])
                await websocket.send_text(llm_response)
            else:
                await websocket.send_text("Unknown message format.")
        except WebSocketDisconnect:
            break
        except Exception as e:
            try:
                await websocket.send_text(f"Error: {str(e)}")
            except Exception:
                pass
            break
