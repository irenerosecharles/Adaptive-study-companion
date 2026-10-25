/**
 * Domain types for Adaptive AI Companion for Academic Learning and Career Readiness
 */

export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  department?: string;
  degreeProgram?: string;
  semester?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  description: string;
  joinCode: string; // 7-character unique code e.g. "K9X2P4M"
  teacherId: string;
  teacherName: string;
  createdAt: string;
  studentCount?: number;
}

export type EnrollmentStatus = 'pending' | 'active' | 'removed';

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  updatedAt: string;
}

export type ProcessingStatus = 'uploaded' | 'processing' | 'processed' | 'failed';

export interface LearningMaterial {
  id: string;
  classId: string;
  className?: string;
  teacherId: string;
  title: string;
  description: string;
  originalFilename: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'image' | 'other';
  fileSize: number; // in bytes
  processingStatus: ProcessingStatus;
  uploadedAt: string;
  chunkCount: number;
}

export interface MaterialChunk {
  id: string;
  materialId: string;
  materialTitle: string;
  classId: string;
  chunkIndex: number;
  pageNumber?: number;
  content: string;
  faissVectorId: number;
  tags?: string[];
  createdAt: string;
}

export interface TopicMastery {
  topic: string;
  subject: string;
  score: number; // 0 - 100
  totalAttempts: number;
  accuracyRate: number; // 0 - 100%
  lastAssessedDate: string;
  status: 'mastered' | 'progressing' | 'needs_revision';
}

export interface WeakTopicDetail {
  topic: string;
  subject: string;
  accuracy: number;
  mistakeFrequency: number;
  reason: string; // Explainable AI reason
  recommendedAction: string;
}

export interface StrongTopicDetail {
  topic: string;
  subject: string;
  masteryScore: number;
  consistentScoreStreak: number;
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  classId?: string;
  className?: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  completedAt: string;
  responses: AssessmentResponse[];
}

export interface AssessmentQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sourceReference?: string;
}

export interface AssessmentResponse {
  questionId: string;
  question: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface CareerRoleCompetency {
  roleId: string;
  title: string;
  description: string;
  primarySkills: string[];
  secondarySkills: string[];
  recommendedProjects: string[];
  certifications: string[];
  salaryTier: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  declaredSkills: string[];
  inferredSkills: string[]; // inferred from student assessments and performance
  demonstratedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  priorityLearningSkills: {
    skill: string;
    importance: 'critical' | 'high' | 'recommended';
    reason: string;
  }[];
}

export interface CareerLearningRoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  topics: string[];
  actionItems: string[];
  completed: boolean;
}

export interface ResumeAnalysisResult {
  extractedName?: string;
  extractedSkills: string[];
  extractedProjects: string[];
  extractedEducation?: string;
  extractedCertifications: string[];
  matchedTargetRoleSkills: string[];
  missingTargetRoleSkills: string[];
  strengths: string[];
  improvements: string[];
  overallAlignmentScore: number; // 0 - 100
}

export interface InterviewQuestion {
  id: string;
  role: string;
  category: 'technical' | 'ai_ml' | 'programming' | 'system_design' | 'aptitude';
  question: string;
  sampleAnswer: string;
  evaluationRubric: string[];
}

export interface InterviewFeedback {
  questionId: string;
  studentAnswer: string;
  score: number; // 0 - 100
  strengths: string[];
  areasToImprove: string[];
  pedagogicalFeedback: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  actionType: 'revise_topic' | 'take_assessment' | 'explore_knowledge' | 'career_skill' | 'review_notes';
  priority: 'urgent' | 'high' | 'normal';
  targetTopic?: string;
  targetRole?: string;
  sourceEngine: 'Assessment' | 'Learning Analytics' | 'Career Development' | 'Knowledge Engine';
  evidenceExplanation: string; // Explainable AI justification
}

/**
 * THE PERSISTENT STUDENT MODEL (PSM)
 * Central Hub of the Hub-and-Spoke Architecture
 */
export interface PersistentStudentModel {
  id: string;
  studentId: string;
  studentName: string;
  academicProgram: string;
  semester: string;
  
  // Knowledge State
  masteryMap: Record<string, TopicMastery>;
  weakTopics: WeakTopicDetail[];
  strongTopics: StrongTopicDetail[];
  
  // Assessment History
  assessmentStats: {
    totalAssessmentsCompleted: number;
    totalQuestionsAnswered: number;
    averageScore: number;
    averageAccuracy: number;
    historicalTrend: { date: string; accuracy: number; topic: string }[];
  };
  
  // Learning Preferences
  learningPreferences: {
    preferredPace: 'steady' | 'accelerated' | 'revision_focused';
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    dailyGoalMinutes: number;
  };
  
  // Career Profile
  careerProfile: {
    targetRoleId: string;
    targetRoleTitle: string;
    declaredSkills: string[];
    inferredSkills: string[];
    projects: { title: string; techStack: string[]; description: string }[];
    certifications: string[];
    skillGap?: SkillGapAnalysis;
    roadmap: CareerLearningRoadmapPhase[];
    resumeAnalysis?: ResumeAnalysisResult;
    interviewScoreAverage?: number;
  };
  
  // Personalization & Next Action
  recommendedNextAction: RecommendedAction;
  
  // Audit & Activity Logs
  engineActivityLogs: {
    timestamp: string;
    engine: 'Knowledge' | 'Assessment' | 'Analytics' | 'Career' | 'Classroom' | 'Notes';
    action: string;
    details: string;
  }[];
  
  lastUpdated: string;
}

export type NoteType = 'text' | 'key_point' | 'flashcard' | 'image';

export interface BaseNote {
  id: string;
  studentId: string;
  classId?: string;
  className?: string;
  type: NoteType;
  title: string;
  topic: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TextNote extends BaseNote {
  type: 'text';
  content: string; // rich markdown / structured text
}

export interface KeyPointNote extends BaseNote {
  type: 'key_point';
  summary: string;
  points: string[];
  takeaways: string[];
}

export interface FlashcardNote extends BaseNote {
  type: 'flashcard';
  frontContent: string; // Prompt or question
  backContent: string; // Answer, formula or explanation
  reviewCount: number;
  lastReviewedAt?: string;
  mastered: boolean;
}

export interface ImageAnnotation {
  id: string;
  xPercent: number;
  yPercent: number;
  label: string;
  description: string;
}

export interface ImageNote extends BaseNote {
  type: 'image';
  imageUrl: string;
  caption: string;
  annotations: ImageAnnotation[];
}

export type PersonalNote = TextNote | KeyPointNote | FlashcardNote | ImageNote;

export interface StudyTask {
  id: string;
  studentId: string;
  classId?: string;
  className?: string;
  title: string;
  description?: string;
  category: 'revision' | 'assignment' | 'exam_prep' | 'career_practice' | 'reading';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface KnowledgeEngineQuery {
  id: string;
  studentId: string;
  classId?: string;
  query: string;
  answer: string;
  retrievedChunks: {
    chunkId: string;
    materialTitle: string;
    pageNumber?: number;
    excerpt: string;
    similarityScore: number;
  }[];
  timestamp: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
