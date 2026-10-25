import {
  PersistentStudentModel,
  TopicMastery,
  WeakTopicDetail,
  StrongTopicDetail,
  AssessmentRecord,
  RecommendedAction,
  SkillGapAnalysis
} from '../types';
import { dbService, CAREER_ROLES } from './storage';

/**
 * PERSISTENT STUDENT MODEL (PSM) SERVICE
 * Central Personalization & Knowledge State Hub
 * All 4 AI Engines interact with the student state via this service.
 */
export class PSMService {
  private static instance: PSMService;

  public static getInstance(): PSMService {
    if (!PSMService.instance) {
      PSMService.instance = new PSMService();
    }
    return PSMService.instance;
  }

  /**
   * Retrieves the current Persistent Student Model
   */
  public getPSM(studentId: string): PersistentStudentModel {
    return dbService.getPSM(studentId);
  }

  /**
   * Logs an activity event into the PSM audit trail
   */
  public logActivity(
    studentId: string,
    engine: 'Knowledge' | 'Assessment' | 'Analytics' | 'Career' | 'Classroom' | 'Notes',
    action: string,
    details: string
  ): PersistentStudentModel {
    const psm = this.getPSM(studentId);
    psm.engineActivityLogs.unshift({
      timestamp: new Date().toISOString(),
      engine,
      action,
      details
    });

    // Retain up to 50 recent audit records
    if (psm.engineActivityLogs.length > 50) {
      psm.engineActivityLogs = psm.engineActivityLogs.slice(0, 50);
    }

    dbService.savePSM(psm);
    return psm;
  }

  /**
   * KNOWLEDGE ENGINE -> PSM Write Hook:
   * Logs that a student explored/queried a specific academic topic.
   * Note: As strictly required, this does NOT falsely inflate mastery scores,
   * but records engagement and identifies topics being actively studied.
   */
  public recordKnowledgeQuery(
    studentId: string,
    topic: string,
    query: string,
    retrievedSourceCount: number
  ): PersistentStudentModel {
    const psm = this.getPSM(studentId);

    this.logActivity(
      studentId,
      'Knowledge',
      `Queried Topic: ${topic}`,
      `Query: "${query.substring(0, 50)}..." retrieved ${retrievedSourceCount} grounded sources.`
    );

    // If the topic exists in mastery map, update last studied without cheating mastery
    if (psm.masteryMap[topic]) {
      psm.masteryMap[topic].lastAssessedDate = new Date().toISOString();
    }

    dbService.savePSM(psm);
    return psm;
  }

  /**
   * ASSESSMENT ENGINE -> PSM Write Hook:
   * Updates topic mastery (0-100), records attempt, updates accuracy,
   * recomputes Weak Topics and Strong Topics using transparent evidence.
   */
  public recordAssessmentCompletion(
    studentId: string,
    assessment: AssessmentRecord
  ): PersistentStudentModel {
    const psm = this.getPSM(studentId);
    const { topic, accuracy, score, totalQuestions, completedAt } = assessment;

    // 1. Update or create Topic Mastery in PSM
    const existingMastery = psm.masteryMap[topic] || {
      topic,
      subject: assessment.className || 'Core AI',
      score: 50,
      totalAttempts: 0,
      accuracyRate: 50,
      lastAssessedDate: completedAt,
      status: 'progressing'
    };

    // Exponential moving average for topic mastery score
    // New score weight: 60%, prior score weight: 40%
    const updatedScore = Math.round((existingMastery.score * 0.4) + (accuracy * 0.6));
    const newTotalAttempts = existingMastery.totalAttempts + 1;
    const newAccuracyRate = Math.round(
      ((existingMastery.accuracyRate * existingMastery.totalAttempts) + accuracy) / newTotalAttempts
    );

    let status: 'mastered' | 'progressing' | 'needs_revision' = 'progressing';
    if (updatedScore >= 80) status = 'mastered';
    else if (updatedScore < 55) status = 'needs_revision';

    const updatedMastery: TopicMastery = {
      ...existingMastery,
      score: updatedScore,
      totalAttempts: newTotalAttempts,
      accuracyRate: newAccuracyRate,
      lastAssessedDate: completedAt,
      status
    };

    psm.masteryMap[topic] = updatedMastery;

    // 2. Update Global Assessment Stats
    psm.assessmentStats.totalAssessmentsCompleted += 1;
    psm.assessmentStats.totalQuestionsAnswered += totalQuestions;
    psm.assessmentStats.historicalTrend.push({
      date: new Date(completedAt).toISOString().split('T')[0],
      accuracy,
      topic
    });

    // Recompute overall accuracy
    const allAssessments = dbService.getAssessments(studentId);
    const totalAccSum = allAssessments.reduce((acc, a) => acc + a.accuracy, accuracy);
    psm.assessmentStats.averageAccuracy = Math.round(totalAccSum / (allAssessments.length + 1));
    psm.assessmentStats.averageScore = Math.round(
      allAssessments.reduce((sum, a) => sum + a.score, score) / (allAssessments.length + 1)
    );

    // 3. Recompute Weak & Strong Topics based on objective evidence
    this.recomputeStrengthsAndWeaknesses(psm);

    // 4. Update Inferred Skills in Career Profile
    if (updatedScore >= 75 && !psm.careerProfile.inferredSkills.includes(topic)) {
      psm.careerProfile.inferredSkills.push(topic);
    }

    // 5. Update Recommended Next Action
    this.recalculateNextAction(psm);

    // 6. Log activity
    psm.engineActivityLogs.unshift({
      timestamp: new Date().toISOString(),
      engine: 'Assessment',
      action: `Assessment Finished: ${topic}`,
      details: `Score: ${score}/${totalQuestions} (${accuracy}%). Topic mastery updated to ${updatedScore}/100.`
    });

    dbService.savePSM(psm);
    return psm;
  }

  /**
   * LEARNING ANALYTICS ENGINE -> PSM Helper:
   * Categorizes weak and strong topics with transparent Explainable AI rationales.
   */
  private recomputeStrengthsAndWeaknesses(psm: PersistentStudentModel): void {
    const weakList: WeakTopicDetail[] = [];
    const strongList: StrongTopicDetail[] = [];

    Object.values(psm.masteryMap).forEach(mastery => {
      if (mastery.score < 55 || mastery.accuracyRate < 50) {
        weakList.push({
          topic: mastery.topic,
          subject: mastery.subject,
          accuracy: mastery.accuracyRate,
          mistakeFrequency: mastery.totalAttempts,
          reason: `Accuracy rate (${mastery.accuracyRate}%) is below the 55% mastery threshold across ${mastery.totalAttempts} assessment attempts.`,
          recommendedAction: `Review lecture notes on ${mastery.topic} and complete a targeted adaptive practice test.`
        });
      } else if (mastery.score >= 80 && mastery.totalAttempts >= 2) {
        strongList.push({
          topic: mastery.topic,
          subject: mastery.subject,
          masteryScore: mastery.score,
          consistentScoreStreak: mastery.totalAttempts
        });
      }
    });

    psm.weakTopics = weakList;
    psm.strongTopics = strongList;
  }

  /**
   * Recalculates the student's Recommended Next Action based on current PSM state
   */
  public recalculateNextAction(psm: PersistentStudentModel): RecommendedAction {
    // Priority 1: Critical weak academic topic
    if (psm.weakTopics.length > 0) {
      const highestPriorityWeak = psm.weakTopics[0];
      const nextAction: RecommendedAction = {
        id: `rec_${Date.now()}`,
        title: `Reinforce ${highestPriorityWeak.topic}`,
        description: `Your recorded accuracy on ${highestPriorityWeak.topic} is currently ${highestPriorityWeak.accuracy}%. Review the core concepts to bring this up.`,
        actionType: 'revise_topic',
        priority: 'urgent',
        targetTopic: highestPriorityWeak.topic,
        sourceEngine: 'Assessment',
        evidenceExplanation: `Recommended because your recent assessment accuracy for "${highestPriorityWeak.topic}" dropped to ${highestPriorityWeak.accuracy}%.`
      };
      psm.recommendedNextAction = nextAction;
      return nextAction;
    }

    // Priority 2: Missing career critical skill gap
    if (psm.careerProfile.skillGap && psm.careerProfile.skillGap.priorityLearningSkills.length > 0) {
      const topSkill = psm.careerProfile.skillGap.priorityLearningSkills[0];
      const nextAction: RecommendedAction = {
        id: `rec_${Date.now()}`,
        title: `Learn ${topSkill.skill} for ${psm.careerProfile.targetRoleTitle}`,
        description: topSkill.reason,
        actionType: 'career_skill',
        priority: 'high',
        targetRole: psm.careerProfile.targetRoleTitle,
        sourceEngine: 'Career Development',
        evidenceExplanation: `Suggested because "${topSkill.skill}" is a core competency for ${psm.careerProfile.targetRoleTitle} that has not yet been demonstrated in your profile.`
      };
      psm.recommendedNextAction = nextAction;
      return nextAction;
    }

    // Default: Continue advancing strong concepts or take a challenge
    const nextAction: RecommendedAction = {
      id: `rec_${Date.now()}`,
      title: 'Attempt an Advanced Knowledge Assessment',
      description: 'Your current academic mastery is strong! Take an advanced 5-question test to test deep conceptual understanding.',
      actionType: 'take_assessment',
      priority: 'normal',
      sourceEngine: 'Learning Analytics',
      evidenceExplanation: 'Recommended because you have maintained consistently strong performance (>80% accuracy) across recent quizzes.'
    };
    psm.recommendedNextAction = nextAction;
    return nextAction;
  }

  /**
   * CAREER DEVELOPMENT ENGINE -> PSM Write Hook:
   * Sets target role, performs skill-gap analysis, generates structured roadmap.
   */
  public updateCareerTarget(
    studentId: string,
    roleId: string,
    declaredSkills: string[]
  ): PersistentStudentModel {
    const psm = this.getPSM(studentId);
    const targetRole = CAREER_ROLES.find(r => r.roleId === roleId) || CAREER_ROLES[0];

    psm.careerProfile.targetRoleId = targetRole.roleId;
    psm.careerProfile.targetRoleTitle = targetRole.title;
    psm.careerProfile.declaredSkills = Array.from(new Set([...psm.careerProfile.declaredSkills, ...declaredSkills]));

    // Compute skill gap
    const gapAnalysis = this.computeSkillGap(psm, targetRole);
    psm.careerProfile.skillGap = gapAnalysis;

    // Generate tailored 3-phase roadmap
    psm.careerProfile.roadmap = [
      {
        phaseNumber: 1,
        title: 'Core Prerequisites & Mathematical Foundations',
        duration: 'Month 1',
        topics: targetRole.primarySkills.slice(0, 3),
        actionItems: [
          `Review lecture notes on ${targetRole.primarySkills[0]}`,
          `Complete at least 3 practice assessments on fundamental algorithms`
        ],
        completed: false
      },
      {
        phaseNumber: 2,
        title: 'Applied Engineering & Hands-On Specialization',
        duration: 'Month 2',
        topics: targetRole.primarySkills.slice(3, 6),
        actionItems: [
          `Build reference project: "${targetRole.recommendedProjects[0] || 'Domain Project'}"`,
          `Demonstrate code competence and log repository in portfolio`
        ],
        completed: false
      },
      {
        phaseNumber: 3,
        title: 'Production Readiness & Technical Placement',
        duration: 'Month 3',
        topics: targetRole.secondarySkills.slice(0, 4),
        actionItems: [
          `Target certification: "${targetRole.certifications[0] || 'Professional Certification'}"`,
          `Complete technical mock interviews for ${targetRole.title}`
        ],
        completed: false
      }
    ];

    this.recalculateNextAction(psm);

    this.logActivity(
      studentId,
      'Career',
      `Target Role Updated: ${targetRole.title}`,
      `Computed skill gap: ${gapAnalysis.matchPercentage}% role alignment. ${gapAnalysis.missingSkills.length} skills identified for growth.`
    );

    dbService.savePSM(psm);
    return psm;
  }

  /**
   * Computes Skill Gap Analysis comparing student profile against role competency
   */
  public computeSkillGap(psm: PersistentStudentModel, role: typeof CAREER_ROLES[0]): SkillGapAnalysis {
    const allStudentSkills = new Set([
      ...psm.careerProfile.declaredSkills.map(s => s.toLowerCase().trim()),
      ...psm.careerProfile.inferredSkills.map(s => s.toLowerCase().trim())
    ]);

    const demonstrated: string[] = [];
    const missing: string[] = [];

    role.primarySkills.forEach(skill => {
      const clean = skill.toLowerCase().trim();
      const matched = Array.from(allStudentSkills).some(s => s.includes(clean) || clean.includes(s));
      if (matched) {
        demonstrated.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const matchPercentage = Math.round((demonstrated.length / role.primarySkills.length) * 100);

    const priorityLearningSkills = missing.map(skill => ({
      skill,
      importance: 'critical' as const,
      reason: `Required core competency for ${role.title} positions. Not yet found in your demonstrated or declared skills.`
    }));

    return {
      targetRole: role.title,
      declaredSkills: psm.careerProfile.declaredSkills,
      inferredSkills: psm.careerProfile.inferredSkills,
      demonstratedSkills: demonstrated,
      missingSkills: missing,
      matchPercentage,
      priorityLearningSkills
    };
  }
}

export const psmService = PSMService.getInstance();
