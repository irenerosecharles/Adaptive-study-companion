import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { psmService } from '../../services/psmService';
import {
  X,
  Layers,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Compass,
  Code,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

interface PSMInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PSMInspectorModal: React.FC<PSMInspectorModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hub' | 'mastery' | 'career' | 'audit' | 'raw_json'>('hub');

  if (!isOpen || !user) return null;

  const psm = psmService.getPSM(user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Persistent Student Model (PSM) Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Central Hub-and-Spoke state layer for {psm.studentName} ({psm.academicProgram})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('hub')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'hub'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Hub-and-Spoke Topology
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'mastery'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Knowledge State ({Object.keys(psm.masteryMap).length} Topics)
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'career'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Career Readiness State
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Engine Audit Trail ({psm.engineActivityLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('raw_json')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'raw_json'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            PostgreSQL JSONB View
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'hub' && (
            <div className="space-y-6">
              {/* Hub and Spoke Architecture Diagram */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-6">
                <div className="text-center mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Architectural Invariant
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    Hub-and-Spoke Coordination via Persistent Student Model
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-1">
                    The four engines never directly call each other. All interactions flow through the PSM database layer, eliminating tight coupling and preserving student continuity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Knowledge Engine Spoke */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Spoke 1: Knowledge Engine</span>
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <p><strong className="text-slate-800 dark:text-white">Reads from PSM:</strong> Student enrollments, class material access rights.</p>
                      <p><strong className="text-slate-800 dark:text-white">Writes to PSM:</strong> Topic exploration frequency and activity logs (never falsifies mastery).</p>
                    </div>
                  </div>

                  {/* Assessment Engine Spoke */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Spoke 2: Assessment Engine</span>
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <p><strong className="text-slate-800 dark:text-white">Reads from PSM:</strong> Weak topics, current mastery scores, difficulty preference.</p>
                      <p><strong className="text-slate-800 dark:text-white">Writes to PSM:</strong> Test scores, question attempts, recalculated 0-100 concept mastery.</p>
                    </div>
                  </div>

                  {/* Analytics Engine Spoke */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Spoke 3: Learning Analytics</span>
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <p><strong className="text-slate-800 dark:text-white">Reads from PSM:</strong> Full assessment history, mistake patterns, learning trends.</p>
                      <p><strong className="text-slate-800 dark:text-white">Writes to PSM:</strong> Weak vs strong categorizations, Recommended Next Action with explainable evidence.</p>
                    </div>
                  </div>

                  {/* Career Engine Spoke */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                      <Compass className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Spoke 4: Career Development</span>
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <p><strong className="text-slate-800 dark:text-white">Reads from PSM:</strong> Inferred academic skills, verified coursework, student preferences.</p>
                      <p><strong className="text-slate-800 dark:text-white">Writes to PSM:</strong> Target tech role, skill gaps, personalized 3-phase roadmap, interview feedback.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Recommended Next Action from PSM */}
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Current PSM Recommended Next Action
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    Source: {psm.recommendedNextAction.sourceEngine}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {psm.recommendedNextAction.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {psm.recommendedNextAction.description}
                </p>
                <div className="mt-2.5 rounded bg-white/80 dark:bg-slate-900/80 p-2.5 border border-indigo-100 dark:border-indigo-900/60">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300">
                    <strong className="text-indigo-700 dark:text-indigo-400">Explainable AI Evidence:</strong> {psm.recommendedNextAction.evidenceExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Knowledge Mastery Map (0 - 100 Scale)
                </h3>
                <span className="text-xs text-slate-500">
                  Calculated from verified assessment attempts
                </span>
              </div>

              <div className="space-y-3">
                {Object.values(psm.masteryMap).map(item => (
                  <div
                    key={item.topic}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.topic}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">({item.subject})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {item.totalAttempts} attempts · {item.accuracyRate}% accuracy
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                          {item.score}/100
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.score >= 80
                            ? 'bg-emerald-500'
                            : item.score >= 60
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Selected Career Target
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {psm.careerProfile.targetRoleTitle}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Declared Skills:</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {psm.careerProfile.declaredSkills.join(', ') || 'None declared yet'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Inferred Academic Skills:</span>
                    <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {psm.careerProfile.inferredSkills.join(', ') || 'Will be inferred from assessments'}
                    </p>
                  </div>
                </div>
              </div>

              {psm.careerProfile.roadmap && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active 3-Phase Placement Roadmap
                  </h4>
                  {psm.careerProfile.roadmap.map(phase => (
                    <div
                      key={phase.phaseNumber}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Phase {phase.phaseNumber}: {phase.title}
                        </span>
                        <span className="text-[11px] text-slate-400">{phase.duration}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Focus: {phase.topics.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Engine Synchronization Log
                </h3>
                <span className="text-xs text-slate-500">
                  Immutable audit trail of reads & writes
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {psm.engineActivityLogs.map((log, i) => (
                  <div key={i} className="p-3.5 flex items-start gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                      {log.engine}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {log.action}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw_json' && (
            <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 max-h-96">
              <pre>{JSON.stringify(psm, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last PSM Sync: {new Date(psm.lastUpdated).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
