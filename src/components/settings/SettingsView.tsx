import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dbService } from '../../services/storage';
import { psmService } from '../../services/psmService';
import { ThemePreference } from '../../types';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Database,
  RotateCcw,
  CheckCircle2,
  User,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleResetData = () => {
    if (confirm('Reset database to clean seed state? This restores the B.Tech AI demonstration records.')) {
      dbService.resetToSeedData();
      setResetMessage('Database reset to demonstration state.');
      setTimeout(() => setResetMessage(null), 3000);
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (confirm('Clear all test data?')) {
      dbService.clearAllData();
      setResetMessage('All records cleared and re-initialized.');
      setTimeout(() => setResetMessage(null), 3000);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Preferences & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage user profile details, theme appearance, and database state.
        </p>
      </div>

      {resetMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email} · <span className="capitalize">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400">Institution:</span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{user.institution || 'Apex Institute of Technology'}</p>
          </div>
          <div>
            <span className="text-slate-400">Department:</span>
            <p className="font-medium text-slate-800 dark:text-slate-200">{user.department || 'Computer Science and Engineering'}</p>
          </div>
          {user.role === 'student' && (
            <>
              <div>
                <span className="text-slate-400">Degree Program:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{user.degreeProgram || 'B.Tech CSE (AI & ML)'}</p>
              </div>
              <div>
                <span className="text-slate-400">Current Semester:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{user.semester || '7th Semester'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Interface Appearance Theme
          </h3>
          <p className="text-xs text-slate-500">
            Select between Light, Dark, or System Default. Preference persists across sessions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System Default', icon: Laptop }
          ].map(opt => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as ThemePreference)}
                className={`p-3 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-2 transition-colors ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demonstration Database Control */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Database className="h-4 w-4" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Demonstration Database & State Reset
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reset local storage to reload the B.Tech CSE (AI) curriculum seed dataset, test enrollments, notes, and the pre-computed Persistent Student Model.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reload Demonstration Seed Data</span>
          </button>
          <button
            onClick={handleClearData}
            className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-lg transition-colors border border-red-200 dark:border-red-900"
          >
            Clear Local Database State
          </button>
        </div>
      </div>
    </div>
  );
};
