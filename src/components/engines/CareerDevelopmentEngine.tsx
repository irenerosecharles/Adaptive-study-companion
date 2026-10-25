import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService, CAREER_ROLES, INTERVIEW_QUESTIONS } from '../../services/storage';
import { psmService } from '../../services/psmService';
import { aiService } from '../../services/aiService';
import { ResumeAnalysisResult, InterviewFeedback } from '../../types';
import {
  Compass,
  Briefcase,
  Target,
  Sparkles,
  FileText,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  Layers,
  ChevronRight
} from 'lucide-react';

export const CareerDevelopmentEngine: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'resume' | 'interview'>('roadmap');

  if (!user) return null;

  const psm = psmService.getPSM(user.id);
  const currentRole = CAREER_ROLES.find(r => r.roleId === psm.careerProfile.targetRoleId) || CAREER_ROLES[0];

  // Skill Management
  const [newSkillInput, setNewSkillInput] = useState('');

  // Resume Analyzer
  const [resumeText, setResumeText] = useState(
    `Alex Chen\nB.Tech Computer Science and Engineering (Artificial Intelligence)\n\nSKILLS: Python, PyTorch, FastAPI, Git, RAG Architecture, Vector Search, SQL\n\nPROJECTS:\n- Adaptive Course Q&A Engine: Implemented source-grounded RAG with FAISS and FastAPI.\n- Transformer Text Summarizer: Fine-tuned T5 model on academic research papers.\n\nEDUCATION: Apex Institute of Technology, B.Tech CSE (AI & ML), Expected 2027`
  );
  const [resumeResult, setResumeResult] = useState<ResumeAnalysisResult | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // Interview Prep
  const [selectedQuestionId, setSelectedQuestionId] = useState(INTERVIEW_QUESTIONS[0].id);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null);

  const handleRoleChange = (roleId: string) => {
    psmService.updateCareerTarget(user.id, roleId, []);
  };

  const handleAddDeclaredSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    psmService.updateCareerTarget(user.id, currentRole.roleId, [newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return;
    setAnalyzingResume(true);
    setTimeout(() => {
      const res = aiService.analyzeResume(resumeText, currentRole.title);
      setResumeResult(res);
      psm.careerProfile.resumeAnalysis = res;
      dbService.savePSM(psm);
      setAnalyzingResume(false);
    }, 600);
  };

  const handleEvaluateInterview = () => {
    if (!interviewAnswer.trim()) return;
    const feedback = aiService.evaluateInterviewAnswer(selectedQuestionId, interviewAnswer);
    setInterviewFeedback(feedback);

    // Update average in PSM
    psm.careerProfile.interviewScoreAverage = feedback.score;
    psmService.logActivity(
      user.id,
      'Career',
      'Completed Technical Mock Interview',
      `Question: ${selectedQuestionId}. Scored ${feedback.score}/100. Feedback recorded in PSM.`
    );
    dbService.savePSM(psm);
  };

  const selectedQuestion = INTERVIEW_QUESTIONS.find(q => q.id === selectedQuestionId) || INTERVIEW_QUESTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            AI Engine 4 of 4
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Career Development & Placement Readiness
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aligns academic coursework with industry AI competencies, roadmap phases, resume auditing, and technical interviews.
            </p>
          </div>

          {/* Target Role Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Target Role:</span>
            <select
              value={currentRole.roleId}
              onChange={e => handleRoleChange(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
            >
              {CAREER_ROLES.map(r => (
                <option key={r.roleId} value={r.roleId}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Role Profile Strip */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Selected Industry Competency Profile
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {currentRole.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            {currentRole.description}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
          <div>
            <span className="text-[11px] text-slate-400">Role Match</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {psm.careerProfile.skillGap?.matchPercentage || 65}%
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Industry Compensation</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {currentRole.salaryTier}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium space-x-6">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'roadmap'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Personalized Placement Roadmap
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'skills'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Skill Gap Analysis & Matrix
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'resume'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          AI Resume Alignment Analyzer
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'interview'
              ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          Technical Interview Practice
        </button>
      </div>

      {/* Tab 1: 3-Phase Placement Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentRole.recommendedProjects.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Recommended Portfolio Project #{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {proj}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Demonstrates core technical competencies expected by recruiters for {currentRole.title}.
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Phased Learning Milestones for {currentRole.title}
            </h3>

            {(psm.careerProfile.roadmap.length > 0 ? psm.careerProfile.roadmap : [
              {
                phaseNumber: 1,
                title: 'Core Prerequisites & Mathematical Foundations',
                duration: 'Month 1',
                topics: currentRole.primarySkills.slice(0, 3),
                actionItems: ['Complete Backpropagation derivations', 'Benchmark FAISS vectors'],
                completed: true
              },
              {
                phaseNumber: 2,
                title: 'Applied Engineering & Specialization Projects',
                duration: 'Month 2',
                topics: currentRole.primarySkills.slice(3, 6),
                actionItems: ['Build RAG citation engine', 'Implement cross-encoder reranking'],
                completed: false
              },
              {
                phaseNumber: 3,
                title: 'Placement Readiness & Production MLOps',
                duration: 'Month 3',
                topics: currentRole.secondarySkills.slice(0, 4),
                actionItems: ['Pass target mock technical interview', 'Dockerize microservices'],
                completed: false
              }
            ]).map(phase => (
              <div
                key={phase.phaseNumber}
                className={`rounded-xl border p-5 shadow-xs transition-colors ${
                  phase.completed
                    ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/60 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      phase.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {phase.phaseNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {phase.title}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{phase.duration}</span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Target Competencies:</span>
                    <p className="text-slate-500 mt-0.5">{phase.topics.join(' · ')}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Deliverables:</span>
                    <ul className="list-disc list-inside text-slate-500 mt-0.5 space-y-0.5">
                      {phase.actionItems.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Skill Gap Analysis */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Add Declared Skill to Profile
            </h3>
            <form onSubmit={handleAddDeclaredSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                placeholder="e.g. Docker, LangChain, Kubernetes, OpenCV..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
              >
                Add Skill
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demonstrated / Inferred Skills */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Verified Academic & Inferred Skills
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically inferred when assessment mastery &gt;= 75%
              </p>
              <div className="mt-3 space-y-1.5">
                {psm.careerProfile.inferredSkills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{s}</span>
                  </div>
                ))}
                {psm.careerProfile.inferredSkills.length === 0 && (
                  <p className="text-xs text-slate-400 py-2">No inferred skills yet.</p>
                )}
              </div>
            </div>

            {/* Declared Skills */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Student Declared Skills
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reported by student through profile or resume
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {psm.careerProfile.declaredSkills.map((s, i) => (
                  <span key={i} className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300">
                    {s}
                  </span>
                ))}
                {psm.careerProfile.declaredSkills.length === 0 && (
                  <p className="text-xs text-slate-400 py-2">No declared skills recorded.</p>
                )}
              </div>
            </div>

            {/* Missing Skill Gaps */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Identified Skill Gaps for {currentRole.title}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Core competencies required by industry benchmarks
              </p>
              <div className="mt-3 space-y-1.5">
                {(psm.careerProfile.skillGap?.missingSkills || currentRole.primarySkills.slice(3)).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40 p-2 rounded border border-amber-100 dark:border-amber-900/40">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Resume Analyzer */}
      {activeTab === 'resume' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Resume Content Evaluator
              </h3>
              <p className="text-xs text-slate-500">
                Paste your resume text or draft. Evaluates alignment against <strong className="text-purple-600">{currentRole.title}</strong> expectations.
              </p>
            </div>

            <textarea
              rows={6}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-hidden"
            />

            <div className="flex justify-end">
              <button
                onClick={handleAnalyzeResume}
                disabled={analyzingResume}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
              >
                {analyzingResume ? 'Analyzing Resume Alignment...' : 'Analyze Resume Alignment'}
              </button>
            </div>
          </div>

          {/* Results */}
          {resumeResult && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400">Target Role Alignment</span>
                  <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {resumeResult.overallAlignmentScore}% Match
                  </h3>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {resumeResult.extractedEducation}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Strengths */}
                <div className="rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Detected Strengths:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                    {resumeResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="rounded-lg bg-amber-50/40 dark:bg-amber-950/20 p-4 border border-amber-100 dark:border-amber-900/50">
                  <span className="font-bold text-amber-800 dark:text-amber-300">Actionable Placement Improvements:</span>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                    {resumeResult.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Technical Mock Interview Practice */}
      {activeTab === 'interview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Question Selector List */}
            <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Interview Question
              </span>
              <div className="space-y-1.5 mt-2">
                {INTERVIEW_QUESTIONS.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionId(q.id);
                      setInterviewFeedback(null);
                      setInterviewAnswer('');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedQuestionId === q.id
                        ? 'bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="line-clamp-2">{q.question}</p>
                    <span className="text-[10px] text-slate-400 uppercase mt-1 block">
                      Category: {q.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Interview Answer Box */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Question Prompt
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-relaxed">
                  {selectedQuestion.question}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Technical Answer
                </label>
                <textarea
                  rows={6}
                  value={interviewAnswer}
                  onChange={e => setInterviewAnswer(e.target.value)}
                  placeholder="Explain your approach, mathematical reasoning, edge cases, and engineering trade-offs..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluateInterview}
                  disabled={!interviewAnswer.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
                >
                  Submit for AI Rubric Evaluation
                </button>
              </div>

              {/* Feedback Result */}
              {interviewFeedback && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      AI Rubric Score: <span className="font-mono text-purple-600">{interviewFeedback.score}/100</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed bg-purple-50/30 dark:bg-purple-950/20 p-3 rounded border border-purple-100 dark:border-purple-900/40">
                    {interviewFeedback.pedagogicalFeedback}
                  </p>

                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-3 text-xs border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white font-semibold">Model Technical Reference Answer:</strong>
                    <p className="text-slate-600 dark:text-slate-400 font-serif mt-1 leading-relaxed">
                      {selectedQuestion.sampleAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
