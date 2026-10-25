import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { X, Lock, Mail, User, BookOpen, GraduationCap, AlertCircle, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('student');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regProgram, setRegProgram] = useState('');
  const [regSemester, setRegSemester] = useState('7th Semester');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role,
      department: regDept,
      degreeProgram: regProgram,
      semester: regSemester
    });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Adaptive AI Companion
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your course materials and Persistent Student Model.
          </p>
        </div>

        {/* Demo Fast-Login Section */}
        <div className="mb-5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
            One-Click Evaluator Demonstration Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemo('student');
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 text-xs font-medium hover:bg-indigo-50 transition-colors shadow-xs"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Alex Chen (Student)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsDemo('teacher');
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 text-xs font-medium hover:bg-amber-50 transition-colors shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dr. Vance (Teacher)</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 mr-6 transition-colors ${
              tab === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    role === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    role === 'teacher'
                      ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Teacher / Faculty
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Academic Email
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="maya@student.edu"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {role === 'student' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Degree Program
                  </label>
                  <input
                    type="text"
                    value={regProgram}
                    onChange={e => setRegProgram(e.target.value)}
                    placeholder="B.Tech CSE (AI)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={regSemester}
                    onChange={e => setRegSemester(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="1st Semester">1st Sem</option>
                    <option value="3rd Semester">3rd Sem</option>
                    <option value="5th Semester">5th Sem</option>
                    <option value="7th Semester">7th Sem</option>
                    <option value="8th Semester">8th Sem</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
