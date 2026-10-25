from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from ..database import get_db
from ..models import PersonalNote
from ..schemas import NoteCreate, NoteResponse

router = APIRouter(prefix="/notes", tags=["Personal Notes"])

@router.get("/student/{student_id}", response_model=List[NoteResponse])
def get_student_notes(student_id: str, db: Session = Depends(get_db)):
    notes = db.query(PersonalNote).filter(PersonalNote.student_id == student_id).all()
    return [
        NoteResponse(
            id=n.id,
            student_id=n.student_id,
            class_id=n.class_id,
            type=n.note_type,
            title=n.title,
            topic=n.topic,
            content=n.content_json or {},
            tags=n.tags or [],
            created_at=n.created_at,
            updated_at=n.updated_at
        )
        for n in notes
    ]

@router.post("/", response_model=NoteResponse)
def create_note(data: NoteCreate, student_id: str, db: Session = Depends(get_db)):
    note = PersonalNote(
        id=f"note_{uuid.uuid4().hex[:12]}",
        student_id=student_id,
        class_id=data.class_id,
        note_type=data.type,
        title=data.title,
        topic=data.topic,
        content_json=data.content,
        tags=data.tags or [],
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteResponse(
        id=note.id,
        student_id=note.student_id,
        class_id=note.class_id,
        type=note.note_type,
        title=note.title,
        topic=note.topic,
        content=note.content_json or {},
        tags=note.tags or [],
        created_at=note.created_at,
        updated_at=note.updated_at
    )
