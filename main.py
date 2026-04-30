import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VoteBot India")

# CORS (frontend support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variable
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free AI models fallback list
FREE_MODELS = [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4-5-air:free",
    "minimax/minimax-m2.5:free",
]

# English system prompt
SYSTEM_PROMPT_EN = """
You are VoteBot India — an AI assistant that explains Indian elections simply.

RULES:
- Reply ONLY in English
- Short answers (2-3 lines)
- Be friendly and simple
- No hashtags
- Max 1 emoji
- Politically neutral

Topics: voting process, voter ID, EVM, VVPAT, Election Commission, Lok Sabha, Rajya Sabha.
"""

# Hindi system prompt
SYSTEM_PROMPT_HI = """
You are VoteBot India — an AI assistant for Indian elections.

RULES:
- Reply ONLY in Hindi (Devanagari)
- Short answers (2-3 lines)
- Friendly tone
- No hashtags
- Max 1 emoji
- Politically neutral
"""

# Request model
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: list = []

# Root route (FIXED - no static dependency)
@app.get("/")
async def root():
    return {
        "status": "VoteBot India is running 🚀",
        "usage": "/docs for API testing"
    }

# Chat endpoint
@app.post("/chat")
async def chat(req: ChatRequest):

    if not OPENROUTER_API_KEY:
        return JSONResponse({
            "status": "error",
            "reply": "Missing OPENROUTER_API_KEY in environment variables"
        })

    system_prompt = SYSTEM_PROMPT_HI if req.language == "hi" else SYSTEM_PROMPT_EN

    messages = [{"role": "system", "content": system_prompt}]

    # last 8 messages context
    for h in req.history[-8:]:
        role = h.get("role", "user")
        messages.append({"role": role, "content": h.get("content", "")})

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

# Health check (IMPORTANT for Render)
@app.get("/health")
async def health():
    return {"status": "healthy"}
