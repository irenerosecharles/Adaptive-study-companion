from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import CareerRoleUpdate, ResumeAnalyzeRequest, InterviewEvaluateRequest
from ..services.psm_service import PSMBackendService

router = APIRouter(prefix="/career", tags=["Career Development Engine"])

@router.post("/target-role")
def update_career_target(data: CareerRoleUpdate, student_id: str, db: Session = Depends(get_db)):
    psm = PSMBackendService.get_or_create_psm(db, student_id)
    profile = dict(psm.career_profile or {})
    profile["targetRoleId"] = data.role_id

    declared = list(profile.get("declaredSkills", []))
    if data.declared_skills:
        declared = list(set(declared + data.declared_skills))
    profile["declaredSkills"] = declared

    psm.career_profile = profile
    PSMBackendService.log_activity(
        db, student_id, "Career", "Target Role Updated", f"Selected role ID: {data.role_id}"
    )
    db.commit()
    db.refresh(psm)
    return psm.career_profile

@router.post("/resume/analyze")
def analyze_resume(data: ResumeAnalyzeRequest):
    text_lower = data.resume_text.lower()
    skills = [s for s in ["python", "pytorch", "fastapi", "docker", "rag", "sql"] if s in text_lower]
    return {
        "extracted_skills": [s.upper() for s in skills],
        "overall_alignment_score": min(95, max(40, len(skills) * 16)),
        "target_role": data.target_role_title,
        "recommendations": [
            f"Add explicit metrics demonstrating production latency benchmarks for {data.target_role_title}.",
            "Highlight published GitHub code repositories in your projects section."
        ]
    }
