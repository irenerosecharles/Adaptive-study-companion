import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adaptive AI Companion for Academic Learning and Career Readiness"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "academic_super_secret_jwt_key_2026_btech")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # PostgreSQL Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/adaptive_companion_db"
    )

    # Gemini AI API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Storage paths for uploaded syllabus notes & FAISS index
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./data/uploads")
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "./data/faiss_index.bin")

    # Embeddings model
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
