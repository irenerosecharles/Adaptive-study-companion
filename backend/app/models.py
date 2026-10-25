import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="student") # "student" or "teacher"
    institution = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    degree_program = Column(String(255), nullable=True)
    semester = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    classes_taught = relationship("Classroom", back_populates="teacher")
    enrollments = relationship("ClassEnrollment", back_populates="student")
    psm = relationship("PersistentStudentModel", back_populates="student", uselist=False)
    notes = relationship("PersonalNote", back_populates="student")
    tasks = relationship("StudyTask", back_populates="student")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    join_code = Column(String(7), unique=True, index=True, nullable=False) # 7-character unique code
    teacher_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="classes_taught")
    enrollments = relationship("ClassEnrollment", back_populates="classroom", cascade="all, delete-orphan")
    materials = relationship("LearningMaterial", back_populates="classroom", cascade="all, delete-orphan")
    chunks = relationship("MaterialChunk", back_populates="classroom", cascade="all, delete-orphan")

class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"
    __table_args__ = (UniqueConstraint('class_id', 'student_id', name='uq_class_student_enrollment'),)

    id = Column(String(64), primary_key=True, index=True)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=False)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    status = Column(String(32), default="active", nullable=False) # "pending", "active", "removed"
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    classroom = relationship("Classroom", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments")

class LearningMaterial(Base):
    __tablename__ = "learning_materials"

    id = Column(String(64), primary_key=True, index=True)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=False)
    teacher_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False) # "pdf", "pptx", "docx", "image"
    file_size = Column(Integer, nullable=False)
    storage_reference = Column(String(512), nullable=True)
    processing_status = Column(String(32), default="processed", nullable=False) # "uploaded", "processing", "processed", "failed"
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    classroom = relationship("Classroom", back_populates="materials")
    chunks = relationship("MaterialChunk", back_populates="material", cascade="all, delete-orphan")

class MaterialChunk(Base):
    __tablename__ = "material_chunks"

    id = Column(String(64), primary_key=True, index=True)
    material_id = Column(String(64), ForeignKey("learning_materials.id"), nullable=False)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    faiss_vector_id = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    material = relationship("LearningMaterial", back_populates="chunks")
    classroom = relationship("Classroom", back_populates="chunks")

class PersistentStudentModel(Base):
    __tablename__ = "persistent_student_models"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    academic_program = Column(String(255), nullable=True)
    semester = Column(String(64), nullable=True)
    
    # Structured JSONB / JSON state representations
    knowledge_mastery_map = Column(JSON, default=dict)
    weak_topics = Column(JSON, default=list)
    strong_topics = Column(JSON, default=list)
    assessment_stats = Column(JSON, default=dict)
    learning_preferences = Column(JSON, default=dict)
    career_profile = Column(JSON, default=dict)
    recommended_next_action = Column(JSON, default=dict)
    engine_activity_logs = Column(JSON, default=list)
    
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("User", back_populates="psm")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=True)
    topic = Column(String(255), nullable=False)
    difficulty = Column(String(32), nullable=False) # "beginner", "intermediate", "advanced"
    total_questions = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    time_taken_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    responses = relationship("AssessmentResponse", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(String(64), primary_key=True, index=True)
    assessment_id = Column(String(64), ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    selected_option = Column(Integer, nullable=False)
    correct_option = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="responses")

class PersonalNote(Base):
    __tablename__ = "personal_notes"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=True)
    note_type = Column(String(32), nullable=False) # "text", "key_point", "flashcard", "image"
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("User", back_populates="notes")

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    class_id = Column(String(64), ForeignKey("classrooms.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), default="revision")
    scheduled_date = Column(String(32), nullable=False)
    scheduled_time = Column(String(32), nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String(32), default="medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="tasks")
