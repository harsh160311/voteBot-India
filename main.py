import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VoteBot India")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory="static"), name="static")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

FREE_MODELS = [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4-5-air:free",
    "minimax/minimax-m2.5:free",
]

SYSTEM_PROMPT_EN = """You are VoteBot India — a friendly AI that helps Indian citizens understand elections.

STRICT RULES:
- ALWAYS reply in ENGLISH only — no Hindi, no other language
- NEVER use hashtags (#)
- Max 1 emoji per reply
- SHORT replies — 2 to 3 sentences for simple questions
- Talk like a helpful friend, not a robot
- If user says "hi" → greet warmly in one sentence, ask what they want to know
- Answer only what was asked, no extra info dumping

Topics: voting process, EVM, VVPAT, Voter ID, Election Commission, Lok Sabha, Rajya Sabha, Model Code of Conduct, reservation, vote counting.
Always politically neutral.
"""

SYSTEM_PROMPT_HI = """You are VoteBot India — a friendly AI that helps Indian citizens understand elections.

STRICT RULES:
- ALWAYS reply in HINDI (Devanagari script) only
- NEVER use hashtags (#)
- Max 1 emoji per reply
- SHORT replies — 2 to 3 sentences for simple questions
- Talk like a helpful friend, not a robot
- If user says "hi" or "नमस्ते" → greet warmly in one sentence, ask what they want to know
- Answer only what was asked, no extra info dumping

Topics: voting process, EVM, VVPAT, Voter ID, Election Commission, Lok Sabha, Rajya Sabha, Model Code of Conduct, reservation, vote counting.
Always politically neutral.
"""

class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: list = []

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/chat")
async def chat(req: ChatRequest):
    if not OPENROUTER_API_KEY:
        return JSONResponse({"reply": "OPENROUTER_API_KEY missing in .env file", "status": "error"})

    # Choose system prompt based on language
    system_prompt = SYSTEM_PROMPT_HI if req.language == "hi" else SYSTEM_PROMPT_EN

    messages = [{"role": "system", "content": system_prompt}]
    for h in req.history[-8:]:
        role = h.get("role", "user")
        if role not in ["user", "assistant"]:
            role = "user"
        messages.append({"role": role, "content": h.get("content", "")})

    messages.append({"role": "user", "content": req.message})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://votebot-india.com",
        "X-Title": "VoteBot India"
    }

    last_error = ""
    for model in FREE_MODELS:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 300
            }
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
            data = response.json()

            if "choices" in data:
                reply = data["choices"][0]["message"]["content"]
                return JSONResponse({"reply": reply, "status": "ok"})
            else:
                last_error = data.get("error", {}).get("message", str(data))
                continue
        except Exception as e:
            last_error = str(e)
            continue

    return JSONResponse({"reply": f"Error: {last_error}", "status": "error"})

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "VoteBot India"}