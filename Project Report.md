# Project Report: Notice2Action

**An AI-Powered Notice Summarization & Action Item Extraction System**

---

## Executive Summary

**Notice2Action** is an intelligent, full-stack web application developed to bridge the communication gap between dense institutional circulars and student execution. Built as part of the AU.28 Hackathon, Notice2Action ingests official college notices in various formats (PDF, DOCX, TXT, or raw text snippets) and leverages Large Language Models (LLMs) to automatically extract plain-language summaries, urgency-coded deadline timelines, personalized eligibility criteria, structured step-by-step action checklists, grounded Q&A capabilities, and one-click calendar exports (`.ics`).

---

## 1. Problem Statement

Educational institutions, administrative offices, and academic departments frequently release critical announcements regarding examinations, fee payments, hackathons, scholarships, placement drives, and workshop registrations. 

However, current dissemination methods present significant usability challenges:

* **Information Overload & Low Readability:** Official notices are typically issued as multi-page PDFs or dense text documents filled with administrative jargon, boilerplate disclaimers, and unformatted tables.
* **Missed Deadlines:** Critical cutoff dates and times are frequently buried deep within text body paragraphs, leading to missed submission windows and late fees.
* **Ambiguous Eligibility Criteria:** Students often fail to identify whether a specific circular applies to their branch, academic year, CGPA requirement, or prerequisite course.
* **Lack of Actionability:** Notices inform users of *what* is happening, but rarely provide a structured, trackable checklist of *how* and *when* to comply.
* **Inaccessible Archives:** Past announcements get buried in email threads or message groups, making context retrieval difficult when questions arise later.

Notice2Action addresses these pain points by transforming static, cluttered text into structured, actionable workflows.

---

## 2. Proposed Solution

**Notice2Action** introduces an automated NLP pipeline combined with a modern, responsive web dashboard. The solution operates through a four-stage workflow:

```
[ Dual Notice Input ] ──► [ Text Extraction ] ──► [ OpenAI Structured NLP ] ──► [ Interactive Action Dashboard ]
(PDF/DOCX/TXT/Text)       (pdfplumber/docx)        (Strict JSON Output)         (Checklist, Deadlines, ICS, Chat)
```

1. **Ingestion & Extraction:** Users paste raw notice text or upload document files (`.pdf`, `.docx`, `.txt`). The backend text extraction service parses raw text cleanly while preserving contextual structure.
2. **AI Analysis & JSON Structuring:** The backend dispatches extracted text to an OpenAI LLM utilizing strict Pydantic JSON schemas. The model categorizes the notice, generates a concise summary, identifies precise date/time deadlines, evaluates eligibility rules, extracts key takeaways, and compiles a sequential action plan.
3. **Actionable Dashboard Presentation:** The frontend presents the analysis using dynamic visual cues—including urgency badges (Red for <48h, Amber for <7 days, Green for >7 days), eligibility verdict banners, tickable task checklists, and interactive grounded Q&A.
4. **Integration & Storage:** Users can export deadlines directly into their personal calendar (.ics format) and persist historical notices locally without requiring complex database setups.

---

## 3. Key Features

Notice2Action includes the following core features:

* 📄 **Dual-Mode Notice Ingestion:** Supports direct copy-pasting of text snippets as well as multi-format document uploads (`.pdf`, `.docx`, `.txt`).
* 🏷️ **Smart Categorization & Plain-Language Summary:** Classifies notices into categories (*Hackathon / Event*, *Scholarship*, *Exam Fee*, *Placement*, *Workshop*, etc.) and provides a 2-3 sentence executive summary.
* ⏳ **Urgency-Coded Timeline Tracking:** Automatically calculates relative days remaining and assigns visual urgency badges:
  * 🔴 **High Urgency (Red):** Deadline within 48 hours.
  * 🟡 **Medium Urgency (Amber):** Deadline within 7 days.
  * 🟢 **Low Urgency (Green):** Deadline beyond 7 days or open-ended.
* 🎯 **Personalized Eligibility Verdict:** Displays a prominent **"YOU ARE ELIGIBLE"** verdict banner alongside detailed prerequisite criteria (e.g., target branches, CGPA cutoffs, batch years).
* ✅ **Interactive Action Checklist:** Converts instruction text into a sequence of actionable check-boxes with live progress indicators (`2 of 5 completed`) stored persistently.
* 📅 **One-Tap Calendar Export (.ics):** Generates and downloads standard `.ics` calendar events (compatible with Google Calendar, Apple Calendar, and Microsoft Outlook).
* 💬 **Grounded "Ask Notice2Action" Assistant:** Context-aware Q&A drawer allowing users to ask specific questions about the notice (e.g., *"What documents do I need to bring?"* or *"Where is the venue?"*) with answers strictly bounded by the notice content.
* 🗂️ **Notice History & Management:** Built-in search, filtering by urgency and category, sorting options, and full notice detail views.
* 🎨 **UI/UX Pro Max Design System:** Built with modern glassmorphic cards, smooth micro-animations, full light/dark theme toggles, and browser notification triggers.

---

## 4. Technologies Used

Notice2Action is built using a modern, decoupled full-stack architecture:

### 4.1 Frontend Stack
* **Framework & Language:** React 19 + TypeScript + Vite
* **Styling & UI:** Tailwind CSS v3 with class-based Dark Mode (`darkMode: 'class'`)
* **Design System:** Custom glassmorphism utilities, CSS design tokens, Google Fonts (*Outfit* for headings, *Plus Jakarta Sans* for body text)
* **Iconography:** Lucide React (`lucide-react`)
* **State & Persistence:** Browser `localStorage` for notice history, action checklist state, theme preferences, and authentication sessions.

### 4.2 Backend Stack
* **Framework:** FastAPI (Python 3.10+)
* **Server:** Uvicorn ASGI Server
* **Validation & Schemas:** Pydantic v2
* **HTTP & Testing:** `httpx`, `pytest` test suite

### 4.3 AI & Text Extraction Pipeline
* **LLM Engine:** OpenAI API (`gpt-4o-mini`) using System Prompts & Structured JSON Schema output constraints.
* **PDF Extraction:** `pdfplumber` with `PyPDF2` fallback handling multi-column text layouts.
* **Word Document Extraction:** `python-docx` for `.docx` structural parsing.

### 4.4 Deployment & Infrastructure
* **Version Control:** Git & GitHub (`AbhishikthPaul12/Notice2Action`)
* **Deployment Platform:** Render (FastAPI Web Service & React Static Site with SPA rewrite rules)

---

## 5. Implementation Details

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Notice2Action System                            │
├───────────────────────────────────┬─────────────────────────────────────────┤
│          Frontend (React)         │             Backend (FastAPI)           │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ • UploadZone (Drag/Drop & Paste)  │ • POST /api/analyze (Text Ingestion)   │
│ • AnalysisDashboard (Visual Output)│ • POST /api/analyze/file (File Upload)  │
│ • Action Checklists & ICS Generator│ • POST /api/ask (Contextual Q&A)       │
│ • History & Search Management     │ • Document Parsing (pdfplumber/docx)    │
│ • Settings & Dark Mode Manager    │ • OpenAI Structured JSON Pipeline       │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

### 5.2 API Specifications

| Endpoint | Method | Input Payload | Output | Description |
|---|---|---|---|---|
| `/api/analyze` | `POST` | `{"text": "..."}` | `NoticeAnalysis` JSON | Ingests raw text and returns extracted notice analysis. |
| `/api/analyze/file` | `POST` | `multipart/form-data` (file) | `NoticeAnalysis` JSON | Extracts text from PDF/DOCX/TXT and analyzes content. |
| `/api/ask` | `POST` | `{"notice_text": "...", "question": "..."}` | `{"answer": "..."}` | Answers specific user query grounded strictly in notice context. |
| `/api/auth/login` | `POST` | `{"email": "...", "password": "..."}` | `{"success": true, "user": ...}` | Authenticates user session (with client-side fallback). |
| `/api/health` | `GET` | None | `{"status": "ok"}` | Service health check endpoint. |

### 5.3 OpenAI Prompt Engineering & Schema Enforcement

To guarantee predictable JSON responses without hallucinated keys or broken markdown, Notice2Action enforces strict Pydantic schemas:

```python
class NoticeAnalysis(BaseModel):
    title: str
    category: Optional[str] = "General"
    summary: str
    deadline: Deadline
    eligibility: List[str]
    actions: List[ActionItem]
    important_points: List[str]
    extracted_text: Optional[str] = ""
```

---

## 6. Future Scope

While Notice2Action provides a complete MVP, future enhancements include:

1. **LMS & ERP Integrations:** Direct API synchronization with platforms like Google Classroom, Canvas, Moodle, and college ERP portals for automated circular ingestion.
2. **Multi-Channel Push Notifications:** Integration with Telegram Bots, WhatsApp Business API, and automated SMS alerts to notify students of high-urgency deadlines (<24h).
3. **OCR Engine Integration:** Adding Tesseract OCR or EasyOCR to extract text from scanned paper notices and image-based circular flyers (`.jpg`, `.png`).
4. **Multilingual & Voice Support:** Automatic translation of notices into regional languages along with AI voice read-aloud capabilities for visually impaired accessibility.
5. **Role-Based Admin Portal:** Allowing college administration to push verified structured notices directly to student dashboards.

---

## 7. References / Bibliography

1. **FastAPI Documentation:** FastAPI Framework for building APIs with Python 3.10+. https://fastapi.tiangolo.com/
2. **React & Vite Documentation:** React 19 Client Framework and Vite Frontend Tooling. https://vitejs.dev/ & https://react.dev/
3. **OpenAI API Reference:** Structured Outputs & JSON Mode in GPT models. https://platform.openai.com/docs/guides/structured-outputs
4. **pdfplumber Library:** Plumb a PDF for detailed information about each text character, rectangle, and line. https://github.com/jsvine/pdfplumber
5. **Tailwind CSS Documentation:** Utility-first CSS framework for rapid UI development. https://tailwindcss.com/
6. **RFC 5545:** Internet Calendaring and Scheduling Core Object Specification (iCalendar `.ics` format). https://datatracker.ietf.org/doc/html/rfc5545
