import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, UserCheck, LogOut, Sparkles, Layers } from 'lucide-react';

interface TopBarProps {
  activeView: string;
  onOpenPSMInspector: () => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onOpenPSMInspector,
  onOpenAuthModal
}) => {
  const { user, isTeacher, logout, loginAsDemo } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="#dashboard" className="text-base font-semibold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          <span>Adaptive Companion</span>
        </a>
        <span className="hidden sm:inline-block text-xs font-normal text-slate-400 dark:text-slate-500">
          Academic & Career AI Platform
        </span>
      </div>

      {/* Zone 2: Active Context & Quick Role Indicator */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
          <span className="text-slate-400 dark:text-slate-500">Active View:</span>
          <span className="capitalize">{activeView.replace('_', ' ')}</span>
        </div>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        {user ? (
          <div className="flex items-center gap-2">
            <span>Signed in as <strong className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</strong></span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              isTeacher 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
            }`}>
              {isTeacher ? 'Faculty / Teacher' : 'Student (AI & ML)'}
            </span>
          </div>
        ) : (
          <span>Not authenticated</span>
        )}
      </div>

      {/* Zone 3: Actions - Theme Switcher, PSM Hub Inspector, User controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* PSM Hub Inspector Trigger (For Student) */}
        {!isTeacher && user && (
          <button
            onClick={onOpenPSMInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors whitespace-nowrap shrink-0"
            title="Inspect Live Persistent Student Model (PSM) State"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PSM Hub Inspector</span>
          </button>
        )}

        {/* Quick Demo Role Switcher for Project Evaluators */}
        <div className="hidden lg:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => loginAsDemo('student')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              !isTeacher && user 
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Student Demo
          </button>
          <button
            onClick={() => loginAsDemo('teacher')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              isTeacher 
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white' 
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Teacher Demo
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700' : 'hover:text-slate-900'}`}
            title="Light Theme"
          >
            <Sun className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700' : 'hover:text-slate-900'}`}
            title="Dark Theme"
          >
            <Moon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700' : 'hover:text-slate-900'}`}
            title="System Theme"
          >
            <Laptop className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Auth / Account */}
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
