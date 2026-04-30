import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VoteBot India")

# CORS enable
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free models fallback
FREE_MODELS = [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4-5-air:free",
    "minimax/minimax-m2.5:free",
]

# Prompts
SYSTEM_PROMPT_EN = """
You are VoteBot India — AI assistant for Indian elections.

RULES:
- English only
- Short 2-3 lines
- Simple friendly tone
- Politically neutral
"""

SYSTEM_PROMPT_HI = """
आप VoteBot India हैं — भारतीय चुनावों के लिए AI सहायक।

नियम:
- केवल हिंदी में उत्तर दें
- छोटा और सरल जवाब
- निष्पक्ष रहें
"""

# Request body
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: list = []

# =========================
# HOME ROUTE (UI FIX)
# =========================
@app.get("/", response_class=HTMLResponse)
async def home():
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except Exception:
        return HTMLResponse("<h1>VoteBot India API Running 🚀</h1>")

# =========================
# CHAT API
# =========================
@app.post("/chat")
async def chat(req: ChatRequest):

    if not OPENROUTER_API_KEY:
        return JSONResponse({
            "status": "error",
            "reply": "Missing OPENROUTER_API_KEY in environment"
        })

    system_prompt = SYSTEM_PROMPT_HI if req.language == "hi" else SYSTEM_PROMPT_EN

    messages = [{"role": "system", "content": system_prompt}]

    for h in req.history[-8:]:
        messages.append({
            "role": h.get("role", "user"),
            "content": h.get("content", "")
        })

    messages.append({"role": "user", "content": req.message})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://votebot-india.com",
        "X-Title": "VoteBot India"
    }

    last_error = None

    for model in FREE_MODELS:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 300
            }

            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    OPENROUTER_URL,
                    json=payload,
                    headers=headers
                )

            data = response.json()

            if "choices" in data:
                return {
                    "status": "ok",
                    "reply": data["choices"][0]["message"]["content"]
                }

            last_error = data

        except Exception as e:
            last_error = str(e)

    return {
        "status": "error",
        "reply": f"AI failed: {last_error}"
    }

# =========================
# HEALTH CHECK (RENDER)
# =========================
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "VoteBot India"}
