import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import {
  GraduationCap,
  Plus,
  Users,
  FolderUp,
  BarChart3,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
  onOpenCreateClassModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onOpenCreateClassModal
}) => {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!user) return null;

  const teacherClasses = dbService.getClassesForTeacher(user.id);
  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const enrollments = dbService.getEnrollments().filter(e => teacherClassIds.has(e.classId));
  const activeStudents = enrollments.filter(e => e.status === 'active');
  const materials = dbService.getMaterials().filter(m => m.teacherId === user.id);
  const totalChunks = dbService.getChunks().filter(c => teacherClassIds.has(c.classId));

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Faculty Console · {user.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user.institution || 'Apex Institute of Technology'} · Department of Computer Science & Engineering
          </p>
        </div>

        <button
          onClick={onOpenCreateClassModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Active Classrooms</span>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {teacherClasses.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">With 7-character join codes</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Enrolled Students</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {activeStudents.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Active role-based access tokens</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Indexed RAG Chunks</span>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {totalChunks.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across {materials.length} uploaded syllabus documents</p>
        </div>
      </div>

      {/* Classes Overview with Join Codes */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course Catalog & Joining Codes
            </h3>
            <p className="text-[11px] text-slate-400">
              Share joining codes with students to grant authorized course material access.
            </p>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
          >
            Manage Classes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherClasses.map(cls => {
            const classMaterials = dbService.getMaterialsForClass(cls.id);
            return (
              <div
                key={cls.id}
                className="rounded-lg border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {cls.subject}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {cls.studentCount || 0} enrolled
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {cls.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cls.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Student Code:</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {cls.joinCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(cls.joinCode)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy code"
                    >
                      {copiedCode === cls.joinCode ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    {classMaterials.length} files
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('materials')}
          className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-indigo-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-2">
            <FolderUp className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Upload & Chunk Notes</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Publish PDFs, PPTs, and DOCX notes into the FAISS index.
          </p>
        </div>

        <div
          onClick={() => onNavigate('roster')}
          className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-2">
            <Users className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Manage Student Roster</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Approve enrollments and revoke classroom permissions.
          </p>
        </div>

        <div
          onClick={() => onNavigate('analytics')}
          className="cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Curriculum Analytics</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Review aggregated diagnostic concept mastery.
          </p>
        </div>
      </div>
    </div>
  );
};
