import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { Users, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export const StudentRosterView: React.FC = () => {
  const { user, isTeacher } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user || !isTeacher) {
    return (
      <div className="p-6 text-center text-xs text-slate-500">
        Faculty access restricted. Please sign in with a faculty account.
      </div>
    );
  }

  const teacherClasses = dbService.getClassesForTeacher(user.id);
  const teacherClassIds = new Set(teacherClasses.map(c => c.id));
  const enrollments = dbService.getEnrollments().filter(e => teacherClassIds.has(e.classId));

  const handleStatusChange = (enrollmentId: string, status: 'active' | 'removed') => {
    dbService.updateEnrollmentStatus(enrollmentId, status);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Class Enrollment Roster & Access Control
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review student enrollment states across your classes. Revoking enrollment immediately blocks access to restricted course notes and RAG chunks.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Academic Email</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Enrollment Status</th>
                <th className="px-5 py-3">Enrolled Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {enrollments.map(enroll => {
                const cls = teacherClasses.find(c => c.id === enroll.classId);
                const isActive = enroll.status === 'active';
                const isRemoved = enroll.status === 'removed';

                return (
                  <tr key={enroll.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      {enroll.studentName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {enroll.studentEmail}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {cls?.name || 'Class'} <span className="text-[11px] text-slate-400">({cls?.subject})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isRemoved
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isActive && <ShieldCheck className="h-3 w-3" />}
                        {isRemoved && <ShieldAlert className="h-3 w-3" />}
                        <span className="capitalize">{enroll.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(enroll.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {isActive ? (
                        <button
                          onClick={() => handleStatusChange(enroll.id, 'removed')}
                          className="px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/60 rounded border border-red-200 dark:border-red-900/60 transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(enroll.id, 'active')}
                          className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-900/60 transition-colors"
                        >
                          Approve Enrollment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No student enrollment records found for your classes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
