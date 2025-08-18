from fastapi import APIRouter, UploadFile, File, Form, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import requests
from ..agents import pestguard
import cloudinary
import cloudinary.uploader



def upload_to_cloudinary(file_bytes, resource_type="image"):
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
        secure=True
    )


    result = cloudinary.uploader.upload(
        file_bytes,
        resource_type=resource_type
    )
    print("Cloudinary upload URL:", result["secure_url"])
    return result["secure_url"]

router_api = APIRouter(prefix="/infer", tags=["pestguard"])

def call_llm_api(prompt: str) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return "LLM API key not set."
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://agrimind-x.com",
        "X-Title": "AgriMind-X MVP"
    }
    system_prompt = (
        "You are AgriMind, an expert in Indian agriculture. Your expertise includes: "
        "\n- IrrigAI: Deciding irrigation based on soil moisture and rainfall forecast"
        "\n- PestGuard: Detecting diseases and deficiencies from crop leaf images"
        "\n- FinanceFlow: Extracting data from subsidy/loan forms and auto-filling applications"
        "\n- MarketBrain: Predicting market trends and suggesting sell/hold actions"
        "\n- EcoTrack: Estimating water savings and carbon footprint from AI-driven actions"
        "\n- SoilSense: Monitoring soil health and advising on fertilization"
        "\nRespond in a helpful, clear, and friendly manner, using your expertise in these areas."
    )
    data = {
        "model": "tngtech/deepseek-r1t2-chimera:free",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        return f"LLM error: {str(e)}"

def call_gemma_image_llm(image_b64: str, user_prompt: str) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return "LLM API key not set."
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://agrimind-x.com",
        "X-Title": "AgriMind-X MVP"
    }
    system_prompt = (
        "You are a world-class expert in crop disease and soil health. "
        "Analyze the uploaded image and provide a diagnosis and actionable advice for Indian farmers."
    )
    data = {
        "model": "google/gemma-3-27b-it:free",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt, "image": image_b64}
        ]
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except Exception as e:
        return f"Gemma LLM error: {str(e)}"

class OpenRouterRequest(BaseModel):
    prompt: str

@router_api.post("/test-openrouter")
async def test_openrouter(req: OpenRouterRequest):
    return {"response": call_llm_api(req.prompt)}

@router_api.post("/pestguard")
async def pestguard_infer(file: UploadFile = File(...)):
    img = await file.read()
    result = pestguard.classify(img)
    return result.model_dump()

import requests
import os

def get_weather_forecast(lat, lon):
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        return None
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        data = response.json()
        # Extract a simple summary for the next 3 days
        forecast = []
        for entry in data.get('list', [])[:3]:
            dt_txt = entry['dt_txt']
            rain = entry.get('rain', {}).get('3h', 0)
            temp = entry['main']['temp']
            humidity = entry['main']['humidity']
            forecast.append(f"{dt_txt}: {temp}°C, {humidity}% humidity, {rain}mm rain")
        return '\n'.join(forecast)
    except Exception:
        return None

# Update /infer/chat endpoint to use weather data if lat/lon is provided
from fastapi import Form

@router_api.post("/chat")
async def chat_infer(prompt: str = Form(...), image: UploadFile = File(None), latitude: str = Form(None), longitude: str = Form(None), manual_location: str = Form(None)):
    weather_summary = None
    if latitude and longitude:
        weather_summary = get_weather_forecast(latitude, longitude)
    # Optionally, you could use manual_location with a geocoding API
    if image:
        img_bytes = await image.read()
        image_url = upload_to_cloudinary(img_bytes, resource_type="image")
        # Use Google LLM for image analysis, include weather if available
        user_prompt = prompt
        if weather_summary:
            user_prompt = f"Weather forecast for your location:\n{weather_summary}\n\n{prompt}"
        llm_response = call_gemma_image_llm(image_url, user_prompt)
        return JSONResponse({"response": llm_response})
    else:
        user_prompt = prompt
        if weather_summary:
            user_prompt = f"Weather forecast for your location:\n{weather_summary}\n\n{prompt}"
        llm_response = call_llm_api(user_prompt)
        return JSONResponse({"response": llm_response})

@router_api.post("/financeflow")
async def financeflow_infer(text: str = Body(...)):
    system_prompt = (
        "You are FinanceFlow, an expert in extracting data from Indian government subsidy/loan forms and auto-filling applications for farmers. "
        "Given the following user input or OCR text, extract the relevant details and provide a summary or auto-filled application."
    )
    user_prompt = f"{system_prompt}\n\n{text}"
    llm_response = call_llm_api(user_prompt)
    return {"response": llm_response}

@router_api.post("/marketbrain")
async def marketbrain_infer(text: str = Body(...)):
    system_prompt = (
        "You are MarketBrain, an expert in predicting Indian agricultural market trends and advising farmers on whether to sell or hold their produce. "
        "Given the following market data or user question, provide a clear recommendation and reasoning."
    )
    user_prompt = f"{system_prompt}\n\n{text}"
    llm_response = call_llm_api(user_prompt)
    return {"response": llm_response}

@router_api.post("/ecotrack")
async def ecotrack_infer(text: str = Body(...)):
    system_prompt = (
        "You are EcoTrack, an expert in estimating water savings and carbon footprint for Indian farms based on AI-driven actions. "
        "Given the following user input or farm data, estimate the water savings and carbon footprint, and provide actionable advice."
    )
    user_prompt = f"{system_prompt}\n\n{text}"
    llm_response = call_llm_api(user_prompt)
    return {"response": llm_response}
