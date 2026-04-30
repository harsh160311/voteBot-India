# 🗳️ VoteBot India — AI Election Education Chatbot

> An AI-powered chatbot that educates Indian citizens about the election process, voting rights, EVM, and civic participation.

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-orange)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Google-Cloud_Run-blue)](https://cloud.google.com/run)

---

## 📌 Chosen Vertical

**Election Process Education** — Building a smart AI assistant that helps Indian citizens understand the democratic process, their voting rights, and how to participate effectively in elections.

---

## 🧠 Approach & Logic

### Problem Statement
Many Indian citizens, especially first-time voters in rural areas, lack awareness about:
- How to register as a voter
- How EVM machines work
- What the Election Commission does
- Their constitutional right to vote

### Solution
VoteBot India uses **Google Gemini AI** to answer election-related questions in a conversational, easy-to-understand way — available in both **English and Hindi**.

### Architecture
```
User (Browser)
    │
    ▼
FastAPI Backend (Python)
    ├──► Google Gemini 2.0 Flash API  →  AI-powered answers
    └──► Google Translate API          →  Hindi ↔ English support
    │
    ▼
Docker Container → Google Cloud Run (Deployment)
```

---

## ⚙️ How the Solution Works

### 1. AI Chat Engine
- Uses **Google Gemini 2.0 Flash** model via REST API
- System prompt enforces neutrality, factual responses, and election focus
- Maintains conversation history (last 3 turns) for contextual replies

### 2. Multilingual Support
- **Google Translate API** enables Hindi ↔ English switching
- Users can toggle language with one click
- Quick topic buttons update dynamically in the selected language

### 3. Quick Topics
Pre-built question shortcuts for common topics:
- How to Vote | EVM & VVPAT | Voter ID / EPIC
- Election Commission | Model Code of Conduct
- Lok Sabha / Rajya Sabha | Reservation | Vote Counting

### 4. Frontend
- Clean, responsive UI with Indian tricolor theme
- Spinning Ashoka Chakra branding
- Mobile-friendly layout
- Real-time typing animation

---

## 🚀 Setup & Running Locally

### Prerequisites
- Python 3.11+
- Google Gemini API Key ([Get here](https://makersuite.google.com/app/apikey))
- Google Translate API Key ([Get here](https://console.cloud.google.com))

### Steps

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/votebot-india.git
cd votebot-india

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

export GEMINI_API_KEY=your_key_here
export GOOGLE_TRANSLATE_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload --port 8080

# Visit http://localhost:8080
```

---

## 🐳 Docker & Cloud Run Deployment

```bash
# Build Docker image
docker build -t votebot-india .

# Test locally
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e GOOGLE_TRANSLATE_API_KEY=your_key \
  votebot-india

# Deploy to Cloud Run
gcloud run deploy votebot-india \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,GOOGLE_TRANSLATE_API_KEY=your_key
```

---

## 📂 Project Structure

```
votebot-india/
├── main.py              # FastAPI application & API endpoints
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container configuration for Cloud Run
├── .env.example         # Environment variables template
├── static/
│   ├── index.html       # Main frontend page
│   ├── style.css        # Styling (Indian theme)
│   └── script.js        # Frontend logic & API calls
└── README.md
```

---

## 🎯 Google Services Used

| Service | Purpose |
|---|---|
| **Google Gemini 2.0 Flash** | AI-powered election Q&A |
| **Google Translate API** | Hindi ↔ English language support |
| **Google Cloud Run** | Serverless deployment & hosting |

---

## 📋 Assumptions Made

1. Users have basic internet access and browser support
2. Gemini API responses are treated as educational, not legal advice
3. The bot is intentionally restricted to election topics only
4. Political neutrality is enforced via system prompt — no party endorsements
5. Conversation history is stored client-side only (no persistent database)

---

## 🔒 Security Considerations

- API keys stored as environment variables (never hardcoded)
- CORS middleware configured for API security
- Input sanitization in frontend before rendering
- Rate limiting handled by Google APIs
- No user data stored or logged

---

## 🌟 Key Features

- ✅ **Bilingual** — English + Hindi support
- ✅ **Neutral** — No political bias, fact-based answers
- ✅ **Contextual** — Remembers conversation history
- ✅ **Mobile Responsive** — Works on all devices
- ✅ **Fast** — Gemini Flash model for quick responses
- ✅ **Educational** — 8 pre-built topic shortcuts

---

## 👨‍💻 Developer

Built with ❤️ for PromptWars — Election Process Education Challenge

*Jai Hind! 🇮🇳 Every vote matters.*
