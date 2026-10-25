from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import random
import string
import datetime

from ..database import get_db
from ..models import Classroom, ClassEnrollment, User
from ..schemas import ClassroomCreate, ClassroomResponse, JoinClassRequest, EnrollmentResponse

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])

def generate_join_code() -> str:
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(chars) for _ in range(7))

@router.get("/", response_model=List[ClassroomResponse])
def get_classes(db: Session = Depends(get_db)):
    return db.query(Classroom).all()

@router.post("/", response_model=ClassroomResponse)
def create_class(data: ClassroomCreate, teacher_id: str, db: Session = Depends(get_db)):
    join_code = generate_join_code()
    while db.query(Classroom).filter(Classroom.join_code == join_code).first():
        join_code = generate_join_code()

    cls = Classroom(
        id=f"class_{uuid.uuid4().hex[:12]}",
        name=data.name,
        subject=data.subject,
        description=data.description,
        join_code=join_code,
        teacher_id=teacher_id,
        created_at=datetime.datetime.utcnow()
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls

@router.post("/join", response_model=EnrollmentResponse)
def join_classroom(data: JoinClassRequest, student_id: str, db: Session = Depends(get_db)):
    cls = db.query(Classroom).filter(Classroom.join_code == data.join_code.upper()).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Invalid 7-character joining code.")

    existing = db.query(ClassEnrollment).filter(
        ClassEnrollment.class_id == cls.id,
        ClassEnrollment.student_id == student_id
    ).first()

    if existing:
        if existing.status == "active":
            raise HTTPException(status_code=400, detail="Already actively enrolled in this course.")
        existing.status = "active"
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    enrollment = ClassEnrollment(
        id=f"enroll_{uuid.uuid4().hex[:12]}",
        class_id=cls.id,
        student_id=student_id,
        status="active",
        enrolled_at=datetime.datetime.utcnow()
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment
