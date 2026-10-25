from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import QueryRequest, QueryResponse, RetrievedCitation
from ..services.rag_service import RAGBackendService
from ..services.psm_service import PSMBackendService
from ..models import ClassEnrollment

router = APIRouter(prefix="/knowledge", tags=["Knowledge Engine"])

@router.post("/query", response_model=QueryResponse)
def query_course_materials(data: QueryRequest, student_id: str, db: Session = Depends(get_db)):
    # Verify enrollment boundaries
    enrollments = db.query(ClassEnrollment).filter(
        ClassEnrollment.student_id == student_id,
        ClassEnrollment.status == "active"
    ).all()
    enrolled_class_ids = [e.class_id for e in enrollments]

    if not enrolled_class_ids:
        return QueryResponse(
            query=data.query,
            answer="The requested information was not found in your available course materials. Please ensure you are enrolled in active courses.",
            citations=[],
            has_grounded_match=False
        )

    # Filter by user-selected class_ids if specified
    search_class_ids = enrolled_class_ids
    if data.class_ids:
        search_class_ids = [cid for cid in data.class_ids if cid in enrolled_class_ids]

    results = RAGBackendService.search_authorized_chunks(db, data.query, search_class_ids, top_k=3)

    if not results:
        return QueryResponse(
            query=data.query,
            answer="The requested information was not found in your available course materials.",
            citations=[],
            has_grounded_match=False
        )

    citations = []
    for chunk, score in results:
        citations.append(RetrievedCitation(
            chunk_id=chunk.id,
            material_title=chunk.material.title if chunk.material else "Course Note",
            page_number=chunk.page_number,
            excerpt=chunk.content[:220] + "..." if len(chunk.content) > 220 else chunk.content,
            similarity_score=score
        ))

    top_chunk, top_score = results[0]
    grounded_answer = (
        f"Based on your course materials in '{top_chunk.material.title if top_chunk.material else 'Lecture Note'}' "
        f"(Page {top_chunk.page_number or 1}):\n\n{top_chunk.content}\n\n"
        f"[Source: {top_chunk.material.title if top_chunk.material else 'Lecture Note'}, Page {top_chunk.page_number or 1}]"
    )

    # Log interaction to PSM
    PSMBackendService.log_activity(
        db,
        student_id,
        "Knowledge",
        "RAG Academic Query",
        f"Queried: '{data.query[:40]}...'. Retrieved {len(citations)} source citations."
    )

    return QueryResponse(
        query=data.query,
        answer=grounded_answer,
        citations=citations,
        has_grounded_match=True
    )
