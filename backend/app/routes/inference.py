from fastapi import APIRouter, UploadFile, File, Request
from pydantic import BaseModel
import os
import requests
from ..agents import pestguard

router_api = APIRouter(prefix="/infer", tags=["pestguard"])

class OpenRouterRequest(BaseModel):
    prompt: str

@router_api.post("/test-openrouter")
async def test_openrouter(req: OpenRouterRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "OPENROUTER_API_KEY not set in environment"}
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://agrimind-x.com",  # or your project/demo URL
        "X-Title": "AgriMind-X MVP"
    }
    data = {
        "model": "tngtech/deepseek-r1t2-chimera:free",
        "messages": [
            {"role": "user", "content": req.prompt}
        ]
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@router_api.post("/pestguard")
async def pestguard_infer(file: UploadFile = File(...)):
    img = await file.read()
    result = pestguard.classify(img)
    return result.model_dump()
