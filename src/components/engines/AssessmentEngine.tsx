import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { aiService } from '../../services/aiService';
import { psmService } from '../../services/psmService';
import { AssessmentQuestion, AssessmentRecord, AssessmentResponse } from '../../types';
import {
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

export const AssessmentEngine: React.FC = () => {
  const { user } = useAuth();
  const [stage, setStage] = useState<'configure' | 'testing' | 'results'>('configure');

  // Configuration options
  const [selectedTopic, setSelectedTopic] = useState('Backpropagation Mathematics');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Active Test State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Result State
  const [lastRecord, setLastRecord] = useState<AssessmentRecord | null>(null);

  if (!user) return null;

  const psm = psmService.getPSM(user.id);
  const availableTopics = [
    'Backpropagation Mathematics',
    'Transformer Self-Attention',
    'FAISS & Vector Similarity',
    'Optimization & Adam Algorithm'
  ];

  const handleStartAssessment = () => {
    const generated = aiService.generateMCQs(selectedTopic, difficulty, questionCount);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStartTime(Date.now());
    setStage('testing');
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleSubmitAssessment = () => {
    const elapsed = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    setTimeSpentSeconds(elapsed);

    let score = 0;
    const responses: AssessmentResponse[] = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) score += 1;

      return {
        questionId: q.id,
        question: q.question,
        selectedOptionIndex: selected,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const accuracy = Math.round((score / questions.length) * 100);

    const record: AssessmentRecord = {
      id: `assess_${Date.now()}`,
      studentId: user.id,
      topic: selectedTopic,
      difficulty,
      totalQuestions: questions.length,
      score,
      accuracy,
      timeSpentSeconds: elapsed,
      completedAt: new Date().toISOString(),
      responses
    };

    // Save to Database
    dbService.saveAssessment(record);

    // CRITICAL: Hub-and-Spoke write to Persistent Student Model
    psmService.recordAssessmentCompletion(user.id, record);

    setLastRecord(record);
    setStage('results');
  };

  return (
    <div className="space-y-6">
      {/* Engine Header */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            AI Engine 2 of 4
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Assessment Engine (Adaptive Evaluations)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generates diagnostic questions based on lecture content and updates your Persistent Student Model mastery scores.
        </p>
      </div>

      {/* Stage 1: Configure Test */}
      {stage === 'configure' && (
        <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Configure Practice Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select topic and difficulty. Questions are synthesized directly from verified curriculum materials.
            </p>
          </div>

          {/* PSM Recommended Weak Topic Alert if available */}
          {psm.weakTopics.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>PSM Recommended Practice Focus</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                Your Persistent Student Model flagged <strong className="underline">{psm.weakTopics[0].topic}</strong> (Accuracy: {psm.weakTopics[0].accuracy}%). Practicing this topic now will improve your mastery score.
              </p>
              <button
                type="button"
                onClick={() => setSelectedTopic(psm.weakTopics[0].topic)}
                className="mt-2 text-xs font-semibold text-amber-900 dark:text-amber-200 underline"
              >
                Select {psm.weakTopics[0].topic}
              </button>
            </div>
          )}

          {/* Topic Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Curriculum Topic
            </label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden font-medium"
            >
              {availableTopics.map(t => {
                const isWeak = psm.weakTopics.some(w => w.topic === t);
                const currentMastery = psm.masteryMap[t]?.score;
                return (
                  <option key={t} value={t}>
                    {t} {currentMastery !== undefined ? `(Mastery: ${currentMastery}%)` : ''} {isWeak ? '⚠️ Needs Revision' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border text-center transition-colors ${
                      difficulty === d
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 10].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      questionCount === cnt
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleStartAssessment}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Testing Runner */}
      {stage === 'testing' && questions.length > 0 && (
        <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedTopic}
              </span>
              <p className="text-xs text-slate-400">
                Question {currentIndex + 1} of {questions.length} · Difficulty: <span className="capitalize">{difficulty}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Assessment Active</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentIndex].question}
            </h3>

            {/* Options */}
            <div className="space-y-2">
              {questions[currentIndex].options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Submit & Grade Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stage 3: Results & Feedback */}
      {stage === 'results' && lastRecord && (
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Score Summary Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Assessment Completed: {lastRecord.topic}
            </h2>
            <div className="mt-3 flex items-center justify-center gap-6">
              <div>
                <p className="text-xs text-slate-400">Score</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {lastRecord.score} / {lastRecord.totalQuestions}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-xs text-slate-400">Accuracy</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {lastRecord.accuracy}%
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <p className="text-xs text-slate-400">Time Spent</p>
                <p className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
                  {lastRecord.timeSpentSeconds}s
                </p>
              </div>
            </div>

            {/* PSM Sync Confirmation */}
            <div className="mt-5 rounded-lg bg-indigo-50/70 p-3 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center gap-2">
              <Layers className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>
                <strong>Persistent Student Model Synchronized:</strong> Updated concept mastery map & recalculated learning recommendations.
              </span>
            </div>

            <button
              onClick={() => setStage('configure')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 rounded-lg inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Take Another Practice Assessment</span>
            </button>
          </div>

          {/* Detailed Question Review & Pedagogical Explanations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Question Analysis & Pedagogical Feedback
            </h3>

            {lastRecord.responses.map((resp, i) => (
              <div
                key={resp.questionId}
                className={`rounded-xl border p-4 shadow-xs ${
                  resp.isCorrect
                    ? 'border-emerald-200 bg-white dark:border-emerald-950/60 dark:bg-slate-900'
                    : 'border-red-200 bg-white dark:border-red-950/60 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {i + 1}. {resp.question}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    resp.isCorrect
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {resp.isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>

                <div className="mt-2 text-xs space-y-1">
                  <p className="text-slate-600 dark:text-slate-400">
                    Your choice: <strong className={resp.isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                      {resp.selectedOptionIndex >= 0 ? `Option ${String.fromCharCode(65 + resp.selectedOptionIndex)}` : 'Unanswered'}
                    </strong>
                  </p>
                  {!resp.isCorrect && (
                    <p className="text-slate-600 dark:text-slate-400">
                      Correct choice: <strong className="text-emerald-600">Option {String.fromCharCode(65 + resp.correctOptionIndex)}</strong>
                    </p>
                  )}
                </div>

                {/* Explanation Box */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  <strong className="font-sans font-semibold text-slate-900 dark:text-white">Explanation: </strong>
                  {resp.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
