import datetime
from sqlalchemy.orm import Session
from ..models import PersistentStudentModel, User, Assessment

class PSMBackendService:
    @staticmethod
    def get_or_create_psm(db: Session, student_id: str) -> PersistentStudentModel:
        psm = db.query(PersistentStudentModel).filter(PersistentStudentModel.student_id == student_id).first()
        if not psm:
            student = db.query(User).filter(User.id == student_id).first()
            psm = PersistentStudentModel(
                id=f"psm_{student_id}",
                student_id=student_id,
                academic_program=student.degree_program if student else "B.Tech CSE",
                semester=student.semester if student else "1st Semester",
                knowledge_mastery_map={},
                weak_topics=[],
                strong_topics=[],
                assessment_stats={
                    "totalAssessmentsCompleted": 0,
                    "totalQuestionsAnswered": 0,
                    "averageScore": 0,
                    "averageAccuracy": 0,
                    "historicalTrend": []
                },
                learning_preferences={
                    "preferredPace": "steady",
                    "preferredDifficulty": "intermediate",
                    "dailyGoalMinutes": 30
                },
                career_profile={
                    "targetRoleId": "ai_engineer",
                    "targetRoleTitle": "AI Engineer / LLM Application Developer",
                    "declaredSkills": [],
                    "inferredSkills": [],
                    "projects": [],
                    "certifications": [],
                    "roadmap": []
                },
                recommended_next_action={
                    "id": f"rec_{int(datetime.datetime.utcnow().timestamp())}",
                    "title": "Begin Diagnostic Course Practice",
                    "description": "Enroll in your registered academic courses and take a 3-question baseline quiz.",
                    "actionType": "take_assessment",
                    "priority": "normal",
                    "sourceEngine": "Assessment",
                    "evidenceExplanation": "Initial state: Practice assessments populate your Persistent Student Model."
                },
                engine_activity_logs=[{
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "engine": "Classroom",
                    "action": "PSM Initialized",
                    "details": "Persistent Student Model record created."
                }]
            )
            db.add(psm)
            db.commit()
            db.refresh(psm)
        return psm

    @staticmethod
    def log_activity(db: Session, student_id: str, engine: str, action: str, details: str):
        psm = PSMBackendService.get_or_create_psm(db, student_id)
        logs = list(psm.engine_activity_logs or [])
        logs.insert(0, {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "engine": engine,
            "action": action,
            "details": details
        })
        psm.engine_activity_logs = logs[:50]
        db.commit()

    @staticmethod
    def record_assessment_result(db: Session, student_id: str, topic: str, score: int, total_questions: int, accuracy: float):
        psm = PSMBackendService.get_or_create_psm(db, student_id)
        
        # 1. Update Mastery Map
        mastery_map = dict(psm.knowledge_mastery_map or {})
        existing = mastery_map.get(topic, {
            "topic": topic,
            "score": 50,
            "totalAttempts": 0,
            "accuracyRate": 50,
            "status": "progressing"
        })

        new_attempts = existing.get("totalAttempts", 0) + 1
        updated_score = round((existing.get("score", 50) * 0.4) + (accuracy * 0.6))
        new_accuracy_rate = round(
            ((existing.get("accuracyRate", 50) * existing.get("totalAttempts", 0)) + accuracy) / new_attempts
        )

        status = "progressing"
        if updated_score >= 80:
            status = "mastered"
        elif updated_score < 55:
            status = "needs_revision"

        mastery_map[topic] = {
            "topic": topic,
            "score": updated_score,
            "totalAttempts": new_attempts,
            "accuracyRate": new_accuracy_rate,
            "lastAssessedDate": datetime.datetime.utcnow().isoformat(),
            "status": status
        }
        psm.knowledge_mastery_map = mastery_map

        # 2. Recompute Weak & Strong Topics with Explainable AI reasoning
        weak = []
        strong = []
        for t_name, m_data in mastery_map.items():
            if m_data["score"] < 55 or m_data["accuracyRate"] < 50:
                weak.append({
                    "topic": t_name,
                    "accuracy": m_data["accuracyRate"],
                    "mistakeFrequency": m_data["totalAttempts"],
                    "reason": f"Accuracy rate ({m_data['accuracyRate']}%) is below 55% across {m_data['totalAttempts']} attempts.",
                    "recommendedAction": f"Review course lecture notes for {t_name}."
                })
            elif m_data["score"] >= 80 and m_data["totalAttempts"] >= 2:
                strong.append({
                    "topic": t_name,
                    "masteryScore": m_data["score"],
                    "consistentScoreStreak": m_data["totalAttempts"]
                })

        psm.weak_topics = weak
        psm.strong_topics = strong

        # 3. Update Next Action
        if weak:
            psm.recommended_next_action = {
                "id": f"rec_{int(datetime.datetime.utcnow().timestamp())}",
                "title": f"Revise {weak[0]['topic']}",
                "description": f"Accuracy dropped to {weak[0]['accuracy']}%. Review core derivations.",
                "actionType": "revise_topic",
                "priority": "urgent",
                "targetTopic": weak[0]["topic"],
                "sourceEngine": "Assessment",
                "evidenceExplanation": f"Assessment Engine identified low accuracy ({weak[0]['accuracy']}%) on recent quiz."
            }
        else:
            psm.recommended_next_action = {
                "id": f"rec_{int(datetime.datetime.utcnow().timestamp())}",
                "title": "Practice Next Curriculum Module",
                "description": "Consistent high scores recorded. Advance to higher difficulty assessment.",
                "actionType": "take_assessment",
                "priority": "normal",
                "sourceEngine": "Learning Analytics",
                "evidenceExplanation": "Performance is above 80% on all assessed concepts."
            }

        # 4. Inferred skills update
        career_profile = dict(psm.career_profile or {})
        inferred = list(career_profile.get("inferredSkills", []))
        if updated_score >= 75 and topic not in inferred:
            inferred.append(topic)
            career_profile["inferredSkills"] = inferred
            psm.career_profile = career_profile

        # 5. Log Activity
        PSMBackendService.log_activity(
            db,
            student_id,
            "Assessment",
            f"Finished Quiz: {topic}",
            f"Score: {score}/{total_questions} ({accuracy}%). PSM topic mastery: {updated_score}/100."
        )

        db.commit()
        db.refresh(psm)
        return psm
