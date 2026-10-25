from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth, classrooms, knowledge, assessment, analytics, career, notes

# Create PostgreSQL / SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Adaptive AI Companion for Academic Learning and Career Readiness - Backend API with Persistent Student Model (PSM) and 4 AI Engines.",
    version="1.0.0"
)

# Enable CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register engine and feature routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(classrooms.router, prefix="/api/v1")
app.include_router(knowledge.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(career.router, prefix="/api/v1")
app.include_router(notes.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "psm_status": "hub_active",
        "engines": [
            "1. Knowledge Engine (RAG Grounding)",
            "2. Assessment Engine (Adaptive MCQs)",
            "3. Learning Analytics Engine (0-100 Mastery)",
            "4. Career Development Engine (Readiness & Roadmaps)"
        ],
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}
