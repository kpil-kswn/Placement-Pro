# 🚀 PlacementPro: AI-Powered Interview Preparation Platform

**Live Demo:** [Insert your Vercel Live Link Here]  
**Backend API Docs:** [https://placementpro-69dl.onrender.com/docs]

PlacementPro is a full-stack, AI-driven platform designed to help candidates ace their interviews. By leveraging advanced generative AI (Google Gemini), dynamic resume parsing, and text-to-speech technologies, PlacementPro generates hyper-personalized mock interviews, evaluates user responses, and provides actionable feedback to guarantee interview readiness.

---

## ✨ Features

- **AI Mock Interviews:** Dynamic, conversational interview scenarios powered by Google GenAI, tailored to specific job roles and industries.
- **Smart Resume Parsing:** Automated extraction of candidate skills and experiences from uploaded PDFs using `pdfplumber` to contextually inform the AI interviewer.
- **Voice Interactions:** Immersive interview experiences featuring Text-to-Speech (TTS) generation via `gTTS`.
- **Microservice Architecture:** A completely decoupled Next.js frontend and Python/FastAPI machine learning & processing engine.
- **Secure Authentication:** Seamless user login and session management via NextAuth.js.
- **Performance Tracking:** Persistent storage of user catalogs, mock test histories, and performance metrics using MongoDB.

---

## 🏗️ Tech Stack

**Frontend (Client & API Proxy):**
- Next.js (App Router)
- React & Tailwind CSS
- NextAuth.js (Authentication)

**Backend (AI & Processing Engine):**
- Python 3
- FastAPI & Uvicorn (High-performance API framework)
- Google GenAI (`google-genai` / Gemini LLM Integration)
- `pdfplumber` & `pypdfium2` (PDF text extraction)
- `gTTS` (Google Text-to-Speech)
- PyMongo (MongoDB Driver)

**Database & Deployment:**
- MongoDB (Database)
- Vercel (Frontend Hosting & Edge Functions)
- Render (Python Backend Hosting)

---

## 🔌 Core API Endpoints (FastAPI)

The Python backend acts as the core processing engine, exposing endpoints proxied securely through the Next.js frontend:

### `GET /api/v1/mock-test/catalog/{user_id}`
Retrieves the personalized catalog of available and completed mock tests for a specific user.
- **Requires:** Valid NextAuth session ID.
- **Returns:** JSON object containing the user's test history and performance metadata.

### `POST /api/v1/resume/upload`
Processes and extracts context from a user's uploaded resume.
- **Accepts:** `multipart/form-data` (PDF file).
- **Returns:** Parsed text and identified core competencies to seed the AI prompt.

### `POST /api/v1/interview/generate`
Triggers the Google GenAI model to generate the next interview question or evaluate a user's answer.
- **Accepts:** User context, role requirements, and previous conversation history.
- **Returns:** AI-generated text response and generated audio metadata (TTS).

---

## ⚙️ Running the Microservices Locally

This project operates as a monorepo containing both the frontend and backend. To run the application locally, you will need two separate terminal windows.

### 1. Start the Python AI Engine (Backend)
Open a terminal and navigate to the `backend` directory:
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up your local environment variables (.env)
# Must include MONGO_URI, GEMINI_API_KEY, etc.

# Start the FastAPI server
uvicorn main:app --reload --port 8000

