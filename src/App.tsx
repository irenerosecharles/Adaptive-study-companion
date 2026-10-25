import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { PSMInspectorModal } from './components/psm/PSMInspectorModal';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ClassroomsView } from './components/classroom/ClassroomsView';
import { CreateClassModal } from './components/classroom/CreateClassModal';
import { StudentRosterView } from './components/classroom/StudentRosterView';
import { MaterialsManagerView } from './components/classroom/MaterialsManagerView';
import { KnowledgeEngine } from './components/engines/KnowledgeEngine';
import { AssessmentEngine } from './components/engines/AssessmentEngine';
import { LearningAnalyticsEngine } from './components/engines/LearningAnalyticsEngine';
import { CareerDevelopmentEngine } from './components/engines/CareerDevelopmentEngine';
import { NotesWorkspace } from './components/notes/NotesWorkspace';
import { StudyPlanner } from './components/planner/StudyPlanner';
import { SettingsView } from './components/settings/SettingsView';
import { Menu } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isTeacher, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [psmModalOpen, setPsmModalOpen] = useState(false);
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);

  // Cross-component navigation state
  const [targetClassForKnowledge, setTargetClassForKnowledge] = useState<string | undefined>(undefined);

  const handleSelectClassForKnowledge = (classId: string) => {
    setTargetClassForKnowledge(classId);
    setActiveView('knowledge');
  };

  const renderActiveView = () => {
    if (!isAuthenticated) {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
            AI
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Adaptive AI Companion
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please sign in to access your classroom, learning materials, and the Persistent Student Model.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            Sign In with Academic Account
          </button>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return isTeacher ? (
          <TeacherDashboard
            onNavigate={setActiveView}
            onOpenCreateClassModal={() => setCreateClassModalOpen(true)}
          />
        ) : (
          <StudentDashboard
            onNavigate={setActiveView}
            onOpenPSMInspector={() => setPsmModalOpen(true)}
          />
        );

      case 'classes':
        return (
          <ClassroomsView
            onSelectClassForKnowledge={handleSelectClassForKnowledge}
            onOpenCreateClassModal={() => setCreateClassModalOpen(true)}
          />
        );

      case 'create_class':
        return (
          <ClassroomsView
            onSelectClassForKnowledge={handleSelectClassForKnowledge}
            onOpenCreateClassModal={() => setCreateClassModalOpen(true)}
          />
        );

      case 'materials':
        return <MaterialsManagerView />;

      case 'roster':
        return <StudentRosterView />;

      case 'knowledge':
        return <KnowledgeEngine initialClassId={targetClassForKnowledge} />;

      case 'assessment':
        return <AssessmentEngine />;

      case 'analytics':
        return (
          <LearningAnalyticsEngine
            onNavigateToAssessment={() => setActiveView('assessment')}
            onNavigateToKnowledge={() => setActiveView('knowledge')}
            onAddTaskToPlanner={() => setActiveView('planner')}
          />
        );

      case 'career':
        return <CareerDevelopmentEngine />;

      case 'notes':
        return <NotesWorkspace />;

      case 'planner':
        return <StudyPlanner />;

      case 'psm':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Persistent Student Model (PSM) Architecture
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central Hub-and-Spoke coordination layer for real-time personalization across all 4 AI engines.
              </p>
            </div>
            <button
              onClick={() => setPsmModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Open Full-Screen PSM Inspector
            </button>
          </div>
        );

      case 'settings':
        return <SettingsView />;

      default:
        return isTeacher ? (
          <TeacherDashboard
            onNavigate={setActiveView}
            onOpenCreateClassModal={() => setCreateClassModalOpen(true)}
          />
        ) : (
          <StudentDashboard
            onNavigate={setActiveView}
            onOpenPSMInspector={() => setPsmModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Top Bar */}
      <TopBar
        activeView={activeView}
        onOpenPSMInspector={() => setPsmModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        {isAuthenticated && (
          <Sidebar
            activeView={activeView}
            onSelectView={setActiveView}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main
          className={`flex-1 transition-all duration-200 p-4 sm:p-6 lg:p-8 ${
            isAuthenticated ? 'lg:pl-72' : 'max-w-5xl mx-auto w-full'
          }`}
        >
          {/* Mobile hamburger toggle */}
          {isAuthenticated && (
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <Menu className="h-4 w-4" />
                <span>Navigation Menu</span>
              </button>
            </div>
          )}

          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PSMInspectorModal
        isOpen={psmModalOpen}
        onClose={() => setPsmModalOpen(false)}
      />

      <CreateClassModal
        isOpen={createClassModalOpen}
        onClose={() => setCreateClassModalOpen(false)}
        onClassCreated={() => setActiveView('classes')}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
