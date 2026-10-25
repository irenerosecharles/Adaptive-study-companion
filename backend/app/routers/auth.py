from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import datetime
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, UserResponse, Token
from ..services.psm_service import PSMBackendService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this academic email already exists."
        )

    user = User(
        id=f"user_{uuid.uuid4().hex[:12]}",
        name=user_data.name,
        email=user_data.email,
        password_hash=f"hashed_{user_data.password}", # In production: passlib bcrypt hash
        role=user_data.role,
        institution=user_data.institution,
        department=user_data.department,
        degree_program=user_data.degree_program,
        semester=user_data.semester,
        created_at=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If student, initialize PSM
    if user.role == "student":
        PSMBackendService.get_or_create_psm(db, user.id)

    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Simplified password validation for prototype
    return Token(
        access_token=f"jwt_token_{user.id}_{int(datetime.datetime.utcnow().timestamp())}",
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )
