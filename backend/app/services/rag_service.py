import os
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ..models import MaterialChunk, LearningMaterial
from ..config import settings

class RAGBackendService:
    @staticmethod
    def chunk_document_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Splits document text into clean semantic chunks with sentence boundaries"""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += " " + para
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks if chunks else [text]

    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> str:
        """Extracts text using PyMuPDF (PDF), python-docx (DOCX), or python-pptx (PPTX)"""
        try:
            if file_type == "pdf":
                import fitz # PyMuPDF
                doc = fitz.open(file_path)
                full_text = []
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    full_text.append(f"--- Page {page_num + 1} ---\n" + page.get_text())
                return "\n\n".join(full_text)

            elif file_type == "docx":
                import docx
                doc = docx.Document(file_path)
                return "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])

            elif file_type == "pptx":
                from pptx import Presentation
                prs = Presentation(file_path)
                slide_texts = []
                for idx, slide in enumerate(prs.slides):
                    texts = [shape.text for shape in slide.shapes if hasattr(shape, "text")]
                    slide_texts.append(f"--- Slide {idx + 1} ---\n" + "\n".join(texts))
                return "\n\n".join(slide_texts)

        except Exception as e:
            print(f"Text extraction failed on {file_path}: {e}")

        # Fallback reading
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return ""

    @staticmethod
    def search_authorized_chunks(
        db: Session,
        query: str,
        authorized_class_ids: List[str],
        top_k: int = 3
    ) -> List[Tuple[MaterialChunk, float]]:
        """Semantic search over chunks belonging strictly to authorized class IDs"""
        if not authorized_class_ids or not query.strip():
            return []

        chunks = db.query(MaterialChunk).filter(MaterialChunk.class_id.in_(authorized_class_ids)).all()
        if not chunks:
            return []

        query_tokens = [w.lower() for w in re.findall(r'\b\w{3,}\b', query)]
        if not query_tokens:
            return []

        scored = []
        for ch in chunks:
            content_lower = ch.content.lower()
            matches = sum(1 for token in query_tokens if token in content_lower)
            if matches > 0:
                score = round(matches / len(query_tokens), 2)
                scored.append((ch, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
