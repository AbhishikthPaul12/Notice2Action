# ⚙️ Notice2Action — Backend API

> **FastAPI Backend Service powered by OpenAI GPT-4o-mini.**  
> *Handles document text extraction, AI analysis, authentication, and context-aware Q&A.*

---

## 🚀 Overview

The Notice2Action backend is built with **FastAPI** to process unstructured documents (PDFs, Word documents, plain text) and text snippets, execute user authentication, send structured prompt requests to OpenAI, and return standardized JSON analysis objects containing title, summary, deadlines, urgency ratings, eligibility criteria, and action items.

---

## ⚡ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **AI Engine**: OpenAI API (`gpt-4o-mini`)
- **Document Extractors**: `pdfplumber`, `PyPDF2`, `python-docx`
- **Data Validation**: Pydantic v2
- **Testing**: `pytest` + `httpx` TestClient
- **Environment Management**: `python-dotenv`

---

## 📁 Folder Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── analyze.py        # POST /api/analyze and POST /api/analyze/file
│   │   ├── ask.py            # POST /api/ask (Notice Q&A endpoint)
│   │   └── auth.py           # POST /api/auth/login, /register, and GET /me
│   ├── services/
│   │   ├── ai_service.py     # OpenAI prompt engineering & structured JSON parsing
│   │   └── document_service.py # PDF (pdfplumber/PyPDF2), DOCX & TXT text extraction
│   ├── schemas.py            # Pydantic data validation models
│   └── main.py               # FastAPI initialization, CORS middleware, & health check
├── tests/                    # Automated Pytest unit test suite
│   ├── test_health.py        # API health check tests
│   └── test_auth.py          # Authentication route tests
├── uploads/                  # Temporary file upload directory
├── .env                      # API keys & configuration secrets (ignored by git)
└── requirements.txt          # Python dependencies for deployment
```

---

## 🛠️ Getting Started

### 1. Create Virtual Environment

```bash
python -m venv venv
```

Activate the environment:
- **Windows**: `venv\Scripts\activate`
- **macOS/Linux**: `source venv/bin/activate`

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- ReDoc Docs: `http://127.0.0.1:8000/redoc`

---

## 📡 API Reference

### 1. Upload & Analyze Document File
`POST /api/analyze/file`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (PDF, DOCX, or TXT)
- **Response**: `NoticeAnalysis` JSON

### 2. Analyze Text Snippet
`POST /api/analyze`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "text": "Notice: Final exam form submission deadline is September 15, 2026. Students must submit hard copies..."
}
```
- **Response**: `NoticeAnalysis` JSON

#### `NoticeAnalysis` Response Schema Example:
```json
{
  "title": "Scholarship Notice 2026",
  "summary": "Annual merit scholarship application requirements.",
  "deadline": {
    "date": "2026-09-15",
    "time": "17:00",
    "relative_days": 18,
    "description": "Final date for submission",
    "urgency": "high"
  },
  "eligibility": ["GPA > 3.5", "Full-time student"],
  "actions": [
    { "task": "Submit transcript PDF", "completed": false },
    { "task": "Fill out Google Form", "completed": false }
  ],
  "important_points": ["Late entries will be rejected"],
  "extracted_text": "Full text analyzed..."
}
```

### 3. Ask Notice Question
`POST /api/ask`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "notice_text": "Raw notice text...",
  "question": "What is the minimum GPA requirement?"
}
```
- **Response**: `{"answer": "The minimum required GPA is 3.5."}`

### 4. Authentication Endpoints

#### `POST /api/auth/login`
- **Body**: `{"email": "xyz@gmail.com", "password": "password123"}`
- **Response**: `{"success": true, "user": {"name": "XYZ", "email": "xyz@gmail.com"}}`

#### `POST /api/auth/register`
- **Body**: `{"name": "John Doe", "email": "john@example.com", "password": "password123"}`
- **Response**: `{"success": true, "user": {"name": "John Doe", "email": "john@example.com"}}`

### 5. Health Check
`GET /api/health`
- **Response**: `{"status": "ok"}`

---

## 🧪 Running Automated Tests

Run backend unit tests with `pytest`:

```bash
pytest
```

Interactive endpoint testing is also available via Swagger UI at `http://127.0.0.1:8000/docs`.

---

## 📄 License

MIT License — see [LICENSE](../LICENSE) file.
