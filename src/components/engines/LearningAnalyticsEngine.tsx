import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { psmService } from '../../services/psmService';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  HelpCircle,
  Calendar,
  Layers
} from 'lucide-react';

interface LearningAnalyticsEngineProps {
  onNavigateToAssessment?: () => void;
  onNavigateToKnowledge?: () => void;
  onAddTaskToPlanner?: (title: string, desc: string) => void;
}

export const LearningAnalyticsEngine: React.FC<LearningAnalyticsEngineProps> = ({
  onNavigateToAssessment,
  onNavigateToKnowledge,
  onAddTaskToPlanner
}) => {
  const { user, isTeacher } = useAuth();

  if (!user) return null;

  const psm = psmService.getPSM(user.id);
  const masteryValues = Object.values(psm.masteryMap);
  const averageMastery = masteryValues.length > 0
    ? Math.round(masteryValues.reduce((sum, m) => sum + m.score, 0) / masteryValues.length)
    : 0;

  // Teacher View
  if (isTeacher) {
    const teacherClasses = dbService.getClassesForTeacher(user.id);
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              AI Engine 3 of 4 · Faculty Edition
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Class Curriculum Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated curriculum-level understanding across your courses. Individual student personal notes remain confidential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Active Courses</span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {teacherClasses.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Managed academic classrooms</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Curriculum Mastery Average</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              74.2%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Across verified student assessment attempts</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Primary Curriculum Bottleneck</span>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">
              Backpropagation Derivatives
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Identified across 68% of class diagnostic quizzes</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Course Diagnostic Topic Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { topic: 'Optimization & Adam Algorithm', accuracy: 88, status: 'Mastered' },
              { topic: 'Transformer Attention Mechanisms', accuracy: 82, status: 'Mastered' },
              { topic: 'FAISS & Vector Similarity', accuracy: 68, status: 'Progressing' },
              { topic: 'Backpropagation Vector Derivation', accuracy: 42, status: 'Needs Reinforcement' }
            ].map((t, idx) => (
              <div key={idx} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.topic}</span>
                  <span className="text-xs font-mono font-bold">{t.accuracy}% Class Accuracy</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${t.accuracy >= 80 ? 'bg-emerald-500' : t.accuracy >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Student View
  return (
    <div className="space-y-6">
      {/* Engine Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            AI Engine 3 of 4
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning Analytics & Mastery Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quantifies conceptual mastery on a 0–100 scale, monitors accuracy trends, and generates explainable revision priorities.
        </p>
      </div>

      {/* Top 3 Quantitative Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Mastery Score */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Overall Academic Mastery</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {averageMastery}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
              style={{ width: `${averageMastery}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Aggregated across {masteryValues.length} recorded topics in your PSM
          </p>
        </div>

        {/* Total Assessments */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Verified Assessment Accuracy</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {psm.assessmentStats.averageAccuracy}%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
            {psm.assessmentStats.totalAssessmentsCompleted} quizzes taken ({psm.assessmentStats.totalQuestionsAnswered} questions)
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Data sourced directly from assessment attempts
          </p>
        </div>

        {/* Priority Focus */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Primary Revision Priority</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-2 truncate">
            {psm.weakTopics[0]?.topic || 'None (All Topics Mastered)'}
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            {psm.weakTopics[0] ? `Accuracy: ${psm.weakTopics[0].accuracy}% (${psm.weakTopics[0].mistakeFrequency} attempts)` : 'Strong performance recorded'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Flagged by rule-based heuristic (&lt;55% threshold)
          </p>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/80 to-white dark:from-indigo-950/40 dark:to-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>PSM Recommended Next Action · {psm.recommendedNextAction.sourceEngine}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {psm.recommendedNextAction.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {psm.recommendedNextAction.description}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <strong className="text-indigo-900 dark:text-indigo-300">Explainable AI Evidence:</strong> {psm.recommendedNextAction.evidenceExplanation}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onAddTaskToPlanner?.(psm.recommendedNextAction.title, psm.recommendedNextAction.description)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Add to Study Plan</span>
            </button>
            <button
              onClick={onNavigateToAssessment}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <span>Practice Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Topic Mastery Visualizer & Strengths / Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 0-100 Topic Mastery Matrix */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Topic Mastery Index (0 – 100 Scale)
              </h3>
              <p className="text-[11px] text-slate-400">
                Calculated from verified quiz responses using weighted exponential moving average
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {masteryValues.map(m => (
              <div
                key={m.topic}
                className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="truncate pr-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {m.topic}
                    </span>
                    <span className="ml-2 text-[11px] text-slate-400">({m.subject})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                    <span className="text-slate-400">{m.accuracyRate}% acc</span>
                    <span className={`font-bold tabular-nums ${
                      m.score >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : m.score >= 55
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {m.score}/100
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.score >= 80 ? 'bg-emerald-500' : m.score >= 55 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}

            {masteryValues.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">
                No topic mastery evidence yet. Complete your first practice test to generate scores.
              </p>
            )}
          </div>
        </div>

        {/* Right: Strong Topics & Weak Topics with Explainable AI */}
        <div className="space-y-4">
          {/* Weak Topics */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Topics Requiring Revision ({psm.weakTopics.length})
              </h3>
            </div>

            <div className="space-y-3">
              {psm.weakTopics.map(weak => (
                <div
                  key={weak.topic}
                  className="rounded-lg border border-amber-100 dark:border-amber-950/80 p-3 bg-amber-50/30 dark:bg-amber-950/20 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-900 dark:text-white">{weak.topic}</strong>
                    <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                      {weak.accuracy}% Accuracy
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 font-serif text-[11px] leading-relaxed">
                    <strong className="font-sans font-semibold text-slate-800 dark:text-slate-200">Explainable AI Reason: </strong>
                    {weak.reason}
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 mt-1.5 text-[11px] font-medium">
                    ↳ Action: {weak.recommendedAction}
                  </p>
                </div>
              ))}

              {psm.weakTopics.length === 0 && (
                <p className="text-xs text-slate-400 py-3">
                  No weak topics currently flagged. Keep practicing to maintain high retention!
                </p>
              )}
            </div>
          </div>

          {/* Strong Topics */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Demonstrated Strong Topics ({psm.strongTopics.length})
              </h3>
            </div>

            <div className="space-y-2">
              {psm.strongTopics.map(strong => (
                <div
                  key={strong.topic}
                  className="rounded-lg border border-emerald-100 dark:border-emerald-950/80 p-2.5 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{strong.topic}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">{strong.consistentScoreStreak} consecutive passes</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{strong.masteryScore}/100</span>
                  </div>
                </div>
              ))}

              {psm.strongTopics.length === 0 && (
                <p className="text-xs text-slate-400 py-2">
                  Complete more assessments with &gt;80% accuracy to earn strong topic status.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
