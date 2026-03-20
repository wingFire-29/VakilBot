# ⚖️ VakilBot – AI Legal Chatbot SaaS

**🌍 Live Live Platform:** [https://vakil-bot.vercel.app](https://vakil-bot.vercel.app)
**⚙️ Live Backend API:** [https://vakilbot-api.onrender.com](https://vakilbot-api.onrender.com)

> **India's AI-powered legal chatbot** – embed it on any law firm website to provide 24/7 legal guidance grounded in Indian constitutional law.

---

## ✨ Key Features
- **RAG-Powered LLM Backend**: Built with LangChain, FAISS, and Groq (Llama 3 70B) to accurately answer questions based exclusively on Indian legal corpora (IPC, CrPC, Constitution).
- **Embeddable JS Widget**: A lightweight, zero-dependency widget that any law firm can add to their site via a simple script tag and a secure API key.
- **Law Firm Dashboard**: A React dashboard for lawyers to regenerate API keys, update firm profiles, and view real-time chat analytics.
- **Analytics & Session Viewer**: Visual charts tracking chat volume, and a modal drill-down to review exact conversations between clients and the AI.
- **Production-Ready Deployment**: Configured with PostgreSQL via Supabase, WhiteNoise for static files, and deployed seamlessly on Render and Vercel.

---

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Django REST)     AI (LangChain + FAISS)
┌──────────────────┐        ┌─────────────────────┐   ┌────────────────────────┐
│ Landing Page     │◄──────►│ /api/auth/          │   │ Indian Constitution    │
│ Dashboard        │        │ /api/firms/         │   │ IPC / CrPC             │
│ Chat Demo        │        │ /api/chat/ask/      │──►│ Consumer Protection    │
└──────────────────┘        │ /api/chat/stats/    │   │ RTI Act                │
                             └─────────────────────┘   │ Domestic Violence Act  │
Embeddable Widget                                       └────────────────────────┘
┌─────────────────────────────┐
│ <script src="widget.js"     │
│   data-key="API_KEY">       │     TF-IDF Vector Store
└─────────────────────────────┘     ↕ Retrieval
                                    Groq LLM (llama3-70b-8192)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A **free Groq API key**: https://console.groq.com

### 1. Setup Backend

```powershell
# From e:\V-code directory:

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r backend\requirements.txt

# Create .env file
Copy-Item backend\.env.example backend\.env
# Edit backend\.env and add your GROQ_API_KEY

# Run database migrations
python backend\manage.py makemigrations users firms chatbot
python backend\manage.py migrate

# Build the legal knowledge base (creates TF-IDF index)
python backend\rag\ingest.py

# Start the backend server
python backend\manage.py runserver
```

### 2. Setup Frontend

```powershell
cd frontend
npm install
npm run dev
```

### 3. Open the App

- **SaaS Dashboard**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/
- **Widget Demo**: Open `widget/demo.html` in a browser

---

## 📁 Project Structure

```
e:\V-code\
├── backend\                     # Django REST API
│   ├── legalai\                 # Project settings & URLs
│   ├── users\                   # Auth app (register, login, JWT)
│   ├── firms\                   # Law firm management + embed keys
│   ├── chatbot\                 # Chat sessions, messages, RAG API
│   ├── rag\
│   │   ├── chain.py             # LangChain RAG pipeline
│   │   ├── ingest.py            # Document ingestion script
│   │   └── vector_store\        # FAISS index (created by ingest.py)
│   ├── legal_data\              # Indian legal text corpus
│   │   ├── constitution_of_india.txt
│   │   ├── indian_penal_code.txt
│   │   └── consumer_rti_dv_acts.txt
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend\                    # React SaaS website
│   ├── src\
│   │   ├── pages\               # LandingPage, Dashboard, ChatDemo, Login, Register
│   │   ├── components\          # Navbar
│   │   ├── context\             # AuthContext (JWT)
│   │   └── index.css            # Design system
│   ├── vite.config.js
│   └── package.json
└── widget\                      # Embeddable chatbot widget
    ├── chatbot-widget.js        # Standalone JS (zero dependencies)
    └── demo.html                # Sample law firm page
```

---

## 🔗 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | None | Register law firm + get JWT |
| POST | `/api/auth/login/` | None | Login, get access token |
| GET | `/api/auth/profile/` | JWT | Get user profile |
| GET | `/api/firms/` | JWT | Get firm details + embed key |
| PUT | `/api/firms/` | JWT | Update firm info |
| POST | `/api/firms/regenerate-key/` | JWT | Regenerate embed key |
| GET | `/api/firms/validate-key/?key=xxx` | None | Widget validates its key |
| POST | `/api/chat/ask/` | None | Ask a legal question (RAG) |
| GET | `/api/chat/history/` | JWT | Get firm's chat sessions |
| GET | `/api/chat/stats/` | JWT | Dashboard stats |

---

## 🤖 Widget Integration

Add this to any law firm website:

```html
<script 
  src="https://vakil-bot.vercel.app/chatbot-widget.js"
  data-key="YOUR_FIRM_EMBED_KEY"
  data-firm="Sharma & Associates"
  data-color="#6366f1">
</script>
```

Get your embed key from the dashboard after registering.

---

## 📚 Legal Data Sources

The RAG pipeline is trained on:
- **Constitution of India** – All Fundamental Rights (Articles 12–35), DPSPs, Schedules
- **Indian Penal Code (IPC)** – Key sections: homicide, theft, rape, cheating, defamation
- **CrPC** – Criminal procedure provisions
- **Consumer Protection Act 2019** – Consumer rights, e-commerce rules, product liability
- **Right to Information Act 2005** – Filing, exemptions, appeals
- **Protection of Women from Domestic Violence Act 2005** – Rights, protection orders

To add more legal data, simply add `.txt` files to `backend/legal_data/` and re-run:
```
python backend/rag/ingest.py
```

---

## 🌐 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.11, Django 5, Django REST Framework |
| Database | SQLite (dev), PostgreSQL (prod) |
| RAG | LangChain + TF-IDF (scikit-learn) |
| Embeddings | Pure Python TF-IDF Vectorizer |
| LLM | Groq API – llama3-70b-8192 (free tier) |
| Frontend | React 18 + Vite |
| Widget | Vanilla JS (zero dependencies) |
| Auth | JWT (djangorestframework-simplejwt) |
