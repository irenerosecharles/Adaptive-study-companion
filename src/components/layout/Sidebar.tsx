import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Compass,
  FileText,
  Calendar,
  Layers,
  Settings,
  PlusCircle,
  FolderUp,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  desc?: string;
}

interface NavSeparator {
  separator: true;
  label: string;
}

type NavEntry = NavItem | NavSeparator;

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  mobileOpen,
  onCloseMobile
}) => {
  const { user, isTeacher } = useAuth();

  const studentNavigation: NavEntry[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'My Classes', icon: GraduationCap },
    { separator: true, label: 'AI Engines' },
    { 
      id: 'knowledge', 
      label: 'Knowledge Engine', 
      icon: BookOpen, 
      badge: 'RAG', 
      desc: 'Source-grounded queries' 
    },
    { 
      id: 'assessment', 
      label: 'Assessment Engine', 
      icon: CheckCircle2, 
      badge: 'Adaptive', 
      desc: 'Smart practice & tests' 
    },
    { 
      id: 'analytics', 
      label: 'Learning Analytics', 
      icon: BarChart3, 
      badge: 'Mastery', 
      desc: '0-100 concept metrics' 
    },
    { 
      id: 'career', 
      label: 'Career Development', 
      icon: Compass, 
      badge: 'Readiness', 
      desc: 'Roadmaps & interviews' 
    },
    { separator: true, label: 'Workspace' },
    { id: 'notes', label: 'My Notes', icon: FileText, desc: '4 note formats' },
    { id: 'planner', label: 'Study Planner', icon: Calendar, desc: 'Calendar & tasks' },
    { id: 'psm', label: 'PSM Hub State', icon: Layers, desc: 'Student Model' },
    { separator: true, label: 'Account' },
    { id: 'settings', label: 'Profile & Settings', icon: Settings }
  ];

  const teacherNavigation: NavEntry[] = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Manage Classes', icon: GraduationCap },
    { id: 'create_class', label: 'Create Class', icon: PlusCircle },
    { separator: true, label: 'Curriculum' },
    { id: 'materials', label: 'Learning Materials', icon: FolderUp, desc: 'Upload & chunking' },
    { id: 'roster', label: 'Student Roster', icon: Users, desc: 'Approvals & enrollments' },
    { id: 'analytics', label: 'Class Performance', icon: BarChart3, desc: 'Curriculum analytics' },
    { separator: true, label: 'Account' },
    { id: 'settings', label: 'Faculty Profile', icon: Settings }
  ];

  const navItems = isTeacher ? teacherNavigation : studentNavigation;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item, idx) => {
            if ('separator' in item) {
              return (
                <div key={`sep-${idx}`} className="pt-4 pb-1 px-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {item.label}
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Guest User'}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {user?.role === 'teacher' ? 'Faculty Member' : user?.degreeProgram || 'Student'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
