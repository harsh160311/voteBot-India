import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VoteBot India")

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= STATIC FILES FIX =================
app.mount("/static", StaticFiles(directory="static"), name="static")

# ================= ENV =================
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

FREE_MODELS = [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4-5-air:free",
    "minimax/minimax-m2.5:free",
]

SYSTEM_PROMPT_EN = """
You are VoteBot India — AI assistant for Indian elections.
- English only
- short answers
- simple tone
- neutral
"""

SYSTEM_PROMPT_HI = """
आप VoteBot India हैं — भारतीय चुनावों का AI सहायक।
- केवल हिंदी
- छोटा जवाब
- निष्पक्ष
"""

# ================= REQUEST =================
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: list = []

# ================= HOME PAGE =================
@app.get("/", response_class=HTMLResponse)
async def home():
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    except:
        return HTMLResponse("<h1>VoteBot India Running 🚀</h1>")

# ================= CHAT =================
@app.post("/chat")
async def chat(req: ChatRequest):

    if not OPENROUTER_API_KEY:
        return JSONResponse({"status": "error", "reply": "Missing API Key"})

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
    }

    for model in FREE_MODELS:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 300
            }

            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(OPENROUTER_URL, json=payload, headers=headers)

            data = r.json()

            if "choices" in data:
                return {
                    "status": "ok",
                    "reply": data["choices"][0]["message"]["content"]
                }

        except:
            continue

    return {"status": "error", "reply": "AI failed"}

# ================= HEALTH =================
@app.get("/health")
async def health():
    return {"status": "healthy"}
