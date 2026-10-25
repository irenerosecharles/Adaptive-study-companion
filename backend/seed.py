"""
Demonstration Data Seeder for Adaptive AI Companion
Seeds demonstration teacher (Dr. Evelyn Vance), student (Alex Chen), courses, syllabus chunks, and PSM.
"""

from app.database import SessionLocal, Base, engine
from app.models import User, Classroom, ClassEnrollment, LearningMaterial, MaterialChunk, PersistentStudentModel
import datetime

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.id == "user_student_1").first():
            print("Database already contains seed records.")
            return

        print("Seeding demonstration records for B.Tech AI Project...")

        # 1. Faculty Member
        teacher = User(
            id="user_teacher_1",
            name="Dr. Evelyn Vance",
            email="dr.vance@university.edu",
            password_hash="hashed_faculty_demo",
            role="teacher",
            institution="Apex Institute of Technology",
            department="Computer Science and Engineering",
            created_at=datetime.datetime.utcnow()
        )
        db.add(teacher)

        # 2. Student Member
        student = User(
            id="user_student_1",
            name="Alex Chen",
            email="alex.chen@student.edu",
            password_hash="hashed_student_demo",
            role="student",
            institution="Apex Institute of Technology",
            department="CSE (Artificial Intelligence)",
            degree_program="B.Tech CSE (AI & ML)",
            semester="7th Semester",
            created_at=datetime.datetime.utcnow()
        )
        db.add(student)

        # 3. Classrooms
        cls1 = Classroom(
            id="class_dl_401",
            name="Deep Learning & Neural Architectures",
            subject="CS401",
            description="Multi-layer perceptrons, backpropagation, and momentum optimizers.",
            join_code="DL4017A",
            teacher_id=teacher.id,
            created_at=datetime.datetime.utcnow()
        )
        cls2 = Classroom(
            id="class_nlp_402",
            name="Natural Language Processing & RAG Systems",
            subject="CS402",
            description="Transformers, self-attention, tokenization, and vector search.",
            join_code="NLP402B",
            teacher_id=teacher.id,
            created_at=datetime.datetime.utcnow()
        )
        db.add(cls1)
        db.add(cls2)

        # 4. Enrollments
        enr1 = ClassEnrollment(
            id="enroll_1",
            class_id=cls1.id,
            student_id=student.id,
            status="active",
            enrolled_at=datetime.datetime.utcnow()
        )
        enr2 = ClassEnrollment(
            id="enroll_2",
            class_id=cls2.id,
            student_id=student.id,
            status="active",
            enrolled_at=datetime.datetime.utcnow()
        )
        db.add(enr1)
        db.add(enr2)

        # 5. Course Material & Chunks
        mat = LearningMaterial(
            id="mat_dl_1",
            class_id=cls1.id,
            teacher_id=teacher.id,
            title="Unit 1: Backpropagation & Optimization Dynamics",
            description="Derivation of chain rule and error propagation.",
            original_filename="Lecture_01_Backprop.pdf",
            file_type="pdf",
            file_size=3400000,
            processing_status="processed",
            uploaded_at=datetime.datetime.utcnow()
        )
        db.add(mat)

        chunk1 = MaterialChunk(
            id="chunk_dl_1",
            material_id=mat.id,
            class_id=cls1.id,
            chunk_index=0,
            page_number=4,
            content="Backpropagation calculates the gradient of the loss function with respect to weights using the chain rule.",
            faiss_vector_id=101,
            created_at=datetime.datetime.utcnow()
        )
        db.add(chunk1)

        # 6. Persistent Student Model (PSM)
        psm = PersistentStudentModel(
            id="psm_user_student_1",
            student_id=student.id,
            academic_program=student.degree_program,
            semester=student.semester,
            knowledge_mastery_map={
                "Backpropagation Mathematics": {
                    "topic": "Backpropagation Mathematics",
                    "score": 42,
                    "accuracyRate": 40,
                    "totalAttempts": 3,
                    "status": "needs_revision"
                },
                "Transformer Self-Attention": {
                    "topic": "Transformer Self-Attention",
                    "score": 82,
                    "accuracyRate": 85,
                    "totalAttempts": 2,
                    "status": "mastered"
                }
            },
            weak_topics=[{
                "topic": "Backpropagation Mathematics",
                "accuracy": 40,
                "mistakeFrequency": 3,
                "reason": "Accuracy dropped below 50% across 3 attempts.",
                "recommendedAction": "Review Unit 1 derivation."
            }],
            strong_topics=[{
                "topic": "Transformer Self-Attention",
                "masteryScore": 82,
                "consistentScoreStreak": 2
            }],
            assessment_stats={
                "totalAssessmentsCompleted": 4,
                "totalQuestionsAnswered": 20,
                "averageScore": 72,
                "averageAccuracy": 72.5,
                "historicalTrend": []
            },
            learning_preferences={
                "preferredPace": "steady",
                "preferredDifficulty": "intermediate",
                "dailyGoalMinutes": 45
            },
            career_profile={
                "targetRoleId": "ai_engineer",
                "targetRoleTitle": "AI Engineer / LLM Application Developer",
                "declaredSkills": ["Python", "FastAPI", "PyTorch"],
                "inferredSkills": ["Transformer Self-Attention"],
                "projects": [],
                "roadmap": []
            },
            recommended_next_action={
                "id": "rec_seed_1",
                "title": "Revise Backpropagation Vector Derivation",
                "description": "Reinforce error propagation across non-linear layers.",
                "actionType": "revise_topic",
                "priority": "urgent",
                "sourceEngine": "Assessment",
                "evidenceExplanation": "Recent assessment accuracy was 40%."
            },
            engine_activity_logs=[{
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "engine": "Analytics",
                "action": "PSM Initialized",
                "details": "Demonstration seed loaded."
            }]
        )
        db.add(psm)

        db.commit()
        print("Demonstration seed data successfully inserted!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
