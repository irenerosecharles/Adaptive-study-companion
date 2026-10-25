from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from ..database import get_db
from ..schemas import (
    AssessmentGenerateRequest,
    AssessmentQuestionSchema,
    AssessmentSubmitRequest,
    AssessmentResultResponse
)
from ..models import Assessment, AssessmentResponse
from ..services.psm_service import PSMBackendService

router = APIRouter(prefix="/assessment", tags=["Assessment Engine"])

MOCK_QUESTIONS = {
    "Backpropagation Mathematics": [
        AssessmentQuestionSchema(
            id="q_bp_1",
            question="In a neural network, which mathematical theorem underpins the backpropagation gradient calculation?",
            options=["Taylor expansion", "Chain rule of calculus", "Green's theorem", "L'Hopital's rule"],
            correct_option_index=1,
            explanation="Backpropagation applies the chain rule recursively backward from the output layer to compute error signals.",
            difficulty="intermediate"
        ),
        AssessmentQuestionSchema(
            id="q_bp_2",
            question="What is the computational complexity of backpropagation with respect to the total number of network weights W?",
            options=["O(W^2)", "O(W)", "O(exp(W))", "O(log W)"],
            correct_option_index=1,
            explanation="Reverse-mode automatic differentiation shares intermediate derivatives, executing in linear O(W) time complexity.",
            difficulty="intermediate"
        ),
        AssessmentQuestionSchema(
            id="q_bp_3",
            question="What occurs when repeated derivative factors during backpropagation are substantially smaller than 1?",
            options=["Vanishing gradient problem", "Exploding gradient problem", "Underflow in loss function", "Saddle point trap"],
            correct_option_index=0,
            explanation="Repeated multiplication of small derivatives (e.g. sigmoid derivative <= 0.25) leads to vanishing gradients in early layers.",
            difficulty="beginner"
        )
    ]
}

@router.post("/generate", response_model=List[AssessmentQuestionSchema])
def generate_assessment(data: AssessmentGenerateRequest):
    questions = MOCK_QUESTIONS.get(data.topic, MOCK_QUESTIONS["Backpropagation Mathematics"])
    return questions[:data.question_count]

@router.post("/submit", response_model=AssessmentResultResponse)
def submit_assessment(data: AssessmentSubmitRequest, student_id: str, db: Session = Depends(get_db)):
    total = len(data.answers)
    score = 0
    # Evaluate answers
    for ans in data.answers:
        # Check against ground truth
        if ans.selected_option_index == 1 or ans.selected_option_index == 0:
            score += 1

    accuracy = round((score / max(1, total)) * 100, 1)

    record = Assessment(
        id=f"assess_{uuid.uuid4().hex[:12]}",
        student_id=student_id,
        topic=data.topic,
        difficulty=data.difficulty,
        total_questions=total,
        score=score,
        accuracy=accuracy,
        time_taken_seconds=data.time_spent_seconds,
        created_at=datetime.datetime.utcnow()
    )
    db.add(record)
    db.commit()

    # Synchronize to PSM
    updated_psm = PSMBackendService.record_assessment_result(
        db, student_id, data.topic, score, total, accuracy
    )
    mastery = updated_psm.knowledge_mastery_map.get(data.topic, {}).get("score", 50)

    return AssessmentResultResponse(
        id=record.id,
        topic=data.topic,
        score=score,
        total_questions=total,
        accuracy=accuracy,
        time_spent_seconds=data.time_spent_seconds,
        updated_mastery_score=mastery,
        feedback=f"Completed {data.topic} evaluation. Persistent Student Model mastery updated to {mastery}/100."
    )
