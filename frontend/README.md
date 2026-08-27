# 🎨 Notice2Action — Frontend Client

> **Modern, Responsive React + TypeScript Frontend for Notice2Action.**  
> *Built with React 19, Vite, Tailwind CSS, and Lucide Icons.*

---

## 🚀 Overview

The Notice2Action frontend provides an intuitive, high-performance web user interface designed to transform complex notices, circulars, and documents into clear, checkable action dashboards.

---

## ⚡ Tech Stack

- **Core**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3 (Custom color palette, glassmorphism, & dark mode)
- **Icons**: Lucide React
- **Branding**: Custom SVG favicon and logo component
- **State & Storage**: React Hooks + Browser `localStorage`

---

## 📁 Folder Structure

```
frontend/
├── public/
│   └── favicon.svg           # Custom Notice2Action brand SVG icon
├── src/
│   ├── components/           # Reusable UI Components
│   │   ├── Header.tsx        # Top navigation header with user profile & drawer trigger
│   │   ├── Sidebar.tsx       # Responsive desktop/mobile sidebar navigation
│   │   ├── Login.tsx         # Backend-connected authentication modal (/api/auth/login)
│   │   ├── UploadZone.tsx    # Dual-mode upload interface (Document File OR Paste Text)
│   │   ├── AnalysisLoader.tsx# Animated step loader with skeleton previews
│   │   └── AnalysisDashboard.tsx # Comprehensive notice visualization & action checklist
│   ├── pages/                # Application Views
│   │   ├── Dashboard.tsx     # Main upload & text snippet live analysis workflow
│   │   ├── MyNotices.tsx     # Saved notice history with search, sort & filters
│   │   ├── NoticeDetail.tsx  # Deep-dive view for specific saved notices
│   │   ├── HowItWorks.tsx    # Educational 4-step workflow explainer page
│   │   └── Settings.tsx      # Appearance, Notifications, Storage & About details
│   ├── services/
│   │   └── api.ts            # Fetch client wrapper for FastAPI endpoints (/analyze, /ask, /auth)
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces matching backend response schemas
│   ├── App.tsx               # Main routing shell & dark mode manager
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind base layer & dark mode styles
├── .env                      # Local environment configuration
├── tailwind.config.js        # Tailwind CSS theme & plugin config
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite bundler configuration
```

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `frontend` root:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Start Development Server

```bash
npm run dev
```

App runs at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Output bundle generated inside `dist/`.

---

## 🧪 Testing & Validation

Run TypeScript type-checking & production bundle build verification:

```bash
npm run build
```

---

## 🌟 Key Component Features

- **Dual-Mode UploadZone**: Supports both document file uploads (PDF, DOCX, TXT) via `POST /api/analyze/file` and raw notice text snippet pasting via `POST /api/analyze`.
- **FastAPI Authentication Integration**: `Login.tsx` connects to backend `/api/auth/login` and `/api/auth/register` with intelligent offline fallback.
- **Interactive Action Checklist**: Interactive checkable task list saved automatically to `localStorage`.
- **Ask Notice2Action Assistant**: Integrated Q&A chat panel connected to backend `/api/ask`.
- **Dark Mode Support**: Applied to document root and persisted across reloads.

---

## 📄 License

MIT License — see [LICENSE](../LICENSE) file.
