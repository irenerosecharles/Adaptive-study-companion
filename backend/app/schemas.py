from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    institution: Optional[str] = None
    department: Optional[str] = None
    degree_program: Optional[str] = None
    semester: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Classroom Schemas ---
class ClassroomCreate(BaseModel):
    name: str
    subject: str
    description: Optional[str] = None

class ClassroomResponse(BaseModel):
    id: str
    name: str
    subject: str
    description: Optional[str] = None
    join_code: str
    teacher_id: str
    created_at: datetime
    student_count: Optional[int] = 0
    class Config:
        from_attributes = True

class JoinClassRequest(BaseModel):
    join_code: str

class EnrollmentResponse(BaseModel):
    id: str
    class_id: str
    student_id: str
    status: str
    enrolled_at: datetime
    class Config:
        from_attributes = True

# --- Knowledge Engine & Materials Schemas ---
class QueryRequest(BaseModel):
    query: str
    class_ids: Optional[List[str]] = None

class RetrievedCitation(BaseModel):
    chunk_id: str
    material_title: str
    page_number: Optional[int] = None
    excerpt: str
    similarity_score: float

class QueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[RetrievedCitation]
    has_grounded_match: bool

# --- Assessment Schemas ---
class AssessmentGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    question_count: int = 3
    class_id: Optional[str] = None

class MCQOption(BaseModel):
    index: int
    text: str

class AssessmentQuestionSchema(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    difficulty: str
    source_reference: Optional[str] = None

class StudentAnswerItem(BaseModel):
    question_id: str
    selected_option_index: int

class AssessmentSubmitRequest(BaseModel):
    topic: str
    difficulty: str
    time_spent_seconds: int
    answers: List[StudentAnswerItem]

class AssessmentResultResponse(BaseModel):
    id: str
    topic: str
    score: int
    total_questions: int
    accuracy: float
    time_spent_seconds: int
    updated_mastery_score: int
    feedback: str

# --- Career Schemas ---
class CareerRoleUpdate(BaseModel):
    role_id: str
    declared_skills: Optional[List[str]] = None

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    target_role_title: str

class InterviewEvaluateRequest(BaseModel):
    question_id: str
    student_answer: str

# --- Notes Schemas ---
class NoteCreate(BaseModel):
    type: str # text, key_point, flashcard, image
    title: str
    topic: str
    content: Dict[str, Any]
    tags: Optional[List[str]] = []
    class_id: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    student_id: str
    class_id: Optional[str]
    type: str
    title: str
    topic: str
    content: Dict[str, Any]
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Study Tasks ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "revision"
    scheduled_date: str
    scheduled_time: Optional[str] = None
    priority: str = "medium"

class TaskResponse(TaskCreate):
    id: str
    student_id: str
    completed: bool
    created_at: datetime
    class Config:
        from_attributes = True
