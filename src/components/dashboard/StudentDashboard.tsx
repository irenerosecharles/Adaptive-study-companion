import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { psmService } from '../../services/psmService';
import {
  BookOpen,
  CheckCircle2,
  BarChart3,
  Compass,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onOpenPSMInspector: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenPSMInspector
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const psm = psmService.getPSM(user.id);
  const enrolledClasses = dbService.getClassesForStudent(user.id);
  const notes = dbService.getNotes(user.id);
  const tasks = dbService.getStudyTasks(user.id);

  const masteryItems = Object.values(psm.masteryMap);
  const avgMastery = masteryItems.length > 0
    ? Math.round(masteryItems.reduce((acc, m) => acc + m.score, 0) / masteryItems.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user.degreeProgram || 'B.Tech CSE (Artificial Intelligence)'} · {user.semester || '7th Semester'} · Persistent Student Model Active
          </p>
        </div>

        <button
          onClick={onOpenPSMInspector}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors shadow-xs shrink-0"
        >
          <Layers className="h-4 w-4" />
          <span>Inspect PSM State</span>
        </button>
      </div>

      {/* Recommended Next Action Hero Banner */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <span>PSM Adaptive Recommendation · {psm.recommendedNextAction.sourceEngine}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {psm.recommendedNextAction.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {psm.recommendedNextAction.description}
            </p>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <strong className="text-indigo-900 dark:text-indigo-300">Explainable AI Evidence: </strong>
              {psm.recommendedNextAction.evidenceExplanation}
            </div>
          </div>

          <button
            onClick={() => {
              if (psm.recommendedNextAction.actionType === 'revise_topic' || psm.recommendedNextAction.actionType === 'take_assessment') {
                onNavigate('assessment');
              } else if (psm.recommendedNextAction.actionType === 'career_skill') {
                onNavigate('career');
              } else {
                onNavigate('knowledge');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <span>Proceed with Action</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Navigation to 4 AI Engines */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Four Specialized AI Engines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Knowledge Engine */}
          <div
            onClick={() => onNavigate('knowledge')}
            className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-2.5">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Knowledge Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Source-grounded RAG assistance with verifiable lecture page citations.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-3 inline-flex items-center gap-1">
              <span>Query Materials</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Assessment Engine */}
          <div
            onClick={() => onNavigate('assessment')}
            className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-2.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Assessment Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Adaptive MCQs, instant evaluation, and automated PSM mastery updates.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 inline-flex items-center gap-1">
              <span>Practice MCQs</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Learning Analytics */}
          <div
            onClick={() => onNavigate('analytics')}
            className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2.5">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Learning Analytics</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                0-100 concept mastery matrix, accuracy trends, and revision insights.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-3 inline-flex items-center gap-1">
              <span>View Analytics</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Career Development */}
          <div
            onClick={() => onNavigate('career')}
            className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-2.5">
                <Compass className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Career Readiness</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Target AI roles, skill-gap analysis, resume auditing, and mock interviews.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-3 inline-flex items-center gap-1">
              <span>Explore Roles</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Learning State & Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Mastery & Weak Topics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Academic Concept Mastery
                </h3>
                <p className="text-[11px] text-slate-400">
                  Recorded in your Persistent Student Model
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Avg: {avgMastery}/100
              </span>
            </div>

            <div className="space-y-3">
              {masteryItems.slice(0, 4).map(m => (
                <div key={m.topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{m.topic}</span>
                    <span className="font-mono text-slate-500 font-bold">{m.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.score >= 80 ? 'bg-emerald-500' : m.score >= 55 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weak Topic Alert if present */}
            {psm.weakTopics.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900 dark:text-amber-300">
                    Needs Reinforcement: {psm.weakTopics[0].topic}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    {psm.weakTopics[0].reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Enrolled Classes Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                My Enrolled Courses ({enrolledClasses.length})
              </h3>
              <button
                onClick={() => onNavigate('classes')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Manage All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enrolledClasses.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => onNavigate('knowledge')}
                  className="cursor-pointer rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {cls.subject}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {cls.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Faculty: {cls.teacherName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Study Tasks & Recent Notes */}
        <div className="space-y-4">
          {/* Upcoming Study Tasks */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Study Tasks
              </h3>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Open Planner
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="text-xs p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40"
                >
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="capitalize">{task.category.replace('_', ' ')}</span>
                    <span>Due {new Date(task.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Notes ({notes.length})
              </h3>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                All Notes
              </button>
            </div>

            <div className="space-y-2">
              {notes.slice(0, 3).map(note => (
                <div
                  key={note.id}
                  onClick={() => onNavigate('notes')}
                  className="cursor-pointer text-xs p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {note.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {note.topic} · <span className="capitalize">{note.type.replace('_', ' ')}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
