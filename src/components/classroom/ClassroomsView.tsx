import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { Classroom, ClassEnrollment } from '../../types';
import {
  GraduationCap,
  Plus,
  KeyRound,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface ClassroomsViewProps {
  onSelectClassForKnowledge?: (classId: string) => void;
  onOpenCreateClassModal?: () => void;
}

export const ClassroomsView: React.FC<ClassroomsViewProps> = ({
  onSelectClassForKnowledge,
  onOpenCreateClassModal
}) => {
  const { user, isTeacher } = useAuth();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!user) return null;

  const teacherClasses = isTeacher ? dbService.getClassesForTeacher(user.id) : [];
  const studentEnrollments = !isTeacher ? dbService.getEnrollmentsForStudent(user.id) : [];
  const allClasses = dbService.getClasses();

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const res = dbService.requestEnrollment(user, joinCodeInput.trim());
    setJoinStatus(res);
    if (res.success) {
      setJoinCodeInput('');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isTeacher ? 'Academic Classrooms & Course Management' : 'My Enrolled Courses'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isTeacher
              ? 'Distribute lecture materials, manage 7-character joining codes, and monitor enrollments.'
              : 'Access authorized course materials and ground the Knowledge Engine on lecture notes.'}
          </p>
        </div>

        {isTeacher ? (
          <button
            onClick={onOpenCreateClassModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Class</span>
          </button>
        ) : (
          <form onSubmit={handleJoinClass} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={7}
              value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter 7-Char Code (e.g. DL4017A)"
              className="w-48 uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              Join Class
            </button>
          </form>
        )}
      </div>

      {/* Join Status Alert */}
      {joinStatus && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-lg text-xs border ${
            joinStatus.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
          }`}
        >
          {joinStatus.success ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{joinStatus.message}</span>
        </div>
      )}

      {/* Teacher Class List */}
      {isTeacher ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherClasses.map(cls => (
            <div
              key={cls.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Subject: {cls.subject}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{cls.studentCount || 0} Students</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {cls.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Join Code:</span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{cls.joinCode}</span>
                    <button
                      onClick={() => handleCopyCode(cls.joinCode)}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy code"
                    >
                      {copiedCode === cls.joinCode ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  {dbService.getMaterialsForClass(cls.id).length} Materials Uploaded
                </span>
              </div>
            </div>
          ))}

          {teacherClasses.length === 0 && (
            <div className="col-span-2 py-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <GraduationCap className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                No classes created yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create your first class to generate a unique 7-character join code and upload lecture materials.
              </p>
              <button
                onClick={onOpenCreateClassModal}
                className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Create Class
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Student Enrolled Classes */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentEnrollments.map(enroll => {
            const cls = allClasses.find(c => c.id === enroll.classId);
            if (!cls) return null;
            const materials = dbService.getMaterialsForClass(cls.id);
            const isRemoved = enroll.status === 'removed';
            const isPending = enroll.status === 'pending';

            return (
              <div
                key={enroll.id}
                className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
                  isRemoved
                    ? 'border-red-200 bg-red-50/20 dark:border-red-900/40 dark:bg-red-950/20 opacity-75'
                    : isPending
                    ? 'border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {cls.subject} · {cls.teacherName}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      isRemoved
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {enroll.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {cls.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isRemoved ? 'Access Revoked' : `${materials.length} Materials Available`}
                  </span>

                  {!isRemoved && !isPending && (
                    <button
                      onClick={() => onSelectClassForKnowledge?.(cls.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <span>Ask Knowledge Engine</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {studentEnrollments.length === 0 && (
            <div className="col-span-2 py-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <GraduationCap className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                You are not enrolled in any courses yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ask your professor for the 7-character join code, or try joining demo course with code <code className="font-mono font-bold text-indigo-600">DL4017A</code> or <code className="font-mono font-bold text-indigo-600">NLP402B</code>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
