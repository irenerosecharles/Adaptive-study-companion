# Adaptive AI Companion — FastAPI & PostgreSQL Backend

This directory contains the production-grade Python FastAPI backend with PostgreSQL, SQLAlchemy, Alembic migrations, and FAISS vector search integration.

## Architecture & Technology Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL (with SQLAlchemy 2.0 ORM)
- **Vector Search:** FAISS (`faiss-cpu`)
- **Embeddings:** Sentence Transformers (`all-MiniLM-L6-v2` or BGE)
- **Document Processing:** PyMuPDF (`fitz`), `python-docx`, `python-pptx`, Tesseract OCR
- **Hub-and-Spoke Engine:** Persistent Student Model (PSM)

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py           # Environment and model configurations
│   ├── database.py         # SQLAlchemy engine and session dependency
│   ├── models.py           # Relational PostgreSQL models
│   ├── schemas.py          # Pydantic request/response validators
│   ├── routers/            # Modular REST API endpoints
│   │   ├── auth.py
│   │   ├── classrooms.py
│   │   ├── knowledge.py
│   │   ├── assessment.py
│   │   ├── analytics.py
│   │   ├── career.py
│   │   └── notes.py
│   └── services/           # Decoupled business logic
│       ├── psm_service.py  # Central Persistent Student Model hub
│       └── rag_service.py  # Chunking, extraction, and FAISS indexing
├── requirements.txt        # Python package dependencies
├── seed.py                 # Initial demonstration data seeder
├── Dockerfile              # Container definition
└── README.md
```

---

## Running the Backend Locally

### 1. Prerequisites
- Python 3.10+
- PostgreSQL server (or SQLite for local testing)

### 2. Create Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/adaptive_companion_db
SECRET_KEY=your_secure_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Seed Demonstration Data
```bash
python seed.py
```

### 5. Start the FastAPI Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive Swagger API documentation is available at:
`http://localhost:8000/docs`
