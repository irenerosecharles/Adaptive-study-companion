from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PersistentStudentModel
from ..services.psm_service import PSMBackendService

router = APIRouter(prefix="/analytics", tags=["Learning Analytics Engine"])

@router.get("/student/{student_id}")
def get_student_analytics(student_id: str, db: Session = Depends(get_db)):
    psm = PSMBackendService.get_or_create_psm(db, student_id)
    return {
        "student_id": student_id,
        "mastery_map": psm.knowledge_mastery_map,
        "weak_topics": psm.weak_topics,
        "strong_topics": psm.strong_topics,
        "assessment_stats": psm.assessment_stats,
        "recommended_next_action": psm.recommended_next_action,
        "last_updated": psm.last_updated
    }
