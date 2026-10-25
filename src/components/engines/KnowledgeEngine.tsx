import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { aiService } from '../../services/aiService';
import { psmService } from '../../services/psmService';
import { KnowledgeEngineQuery } from '../../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface KnowledgeEngineProps {
  initialClassId?: string;
}

export const KnowledgeEngine: React.FC<KnowledgeEngineProps> = ({ initialClassId }) => {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || 'all');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<KnowledgeEngineQuery | null>(null);
  const [recentQueries, setRecentQueries] = useState<KnowledgeEngineQuery[]>([]);
  const [inspectedChunk, setInspectingChunk] = useState<{
    materialTitle: string;
    pageNumber?: number;
    excerpt: string;
  } | null>(null);

  if (!user) return null;

  const enrolledClasses = dbService.getClassesForStudent(user.id);
  const authorizedClassIds = selectedClassId === 'all'
    ? enrolledClasses.map(c => c.id)
    : [selectedClassId];

  const suggestedPrompts = [
    'How does backpropagation compute derivatives using the chain rule?',
    'Why does self-attention divide Q*K^T by sqrt(d_k)?',
    'What is the difference between FAISS IndexFlatL2 and IndexIVFFlat?',
    'Why does Adam optimizer require bias correction terms?'
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim() || authorizedClassIds.length === 0) return;

    setLoading(true);
    setCurrentResult(null);

    const result = await aiService.queryKnowledgeEngine(queryText, authorizedClassIds);

    const queryRecord: KnowledgeEngineQuery = {
      id: `query_${Date.now()}`,
      studentId: user.id,
      classId: selectedClassId === 'all' ? undefined : selectedClassId,
      query: queryText,
      answer: result.answer,
      retrievedChunks: result.retrievedChunks,
      timestamp: new Date().toISOString()
    };

    setCurrentResult(queryRecord);
    setRecentQueries(prev => [queryRecord, ...prev.slice(0, 4)]);

    // Write interaction hook to PSM (Hub-and-Spoke contract)
    // Extract topic estimate from query
    let topicName = 'Course Curriculum';
    if (queryText.toLowerCase().includes('backpropagation') || queryText.toLowerCase().includes('chain rule')) {
      topicName = 'Backpropagation Mathematics';
    } else if (queryText.toLowerCase().includes('attention') || queryText.toLowerCase().includes('transformer')) {
      topicName = 'Transformer Self-Attention';
    } else if (queryText.toLowerCase().includes('faiss') || queryText.toLowerCase().includes('vector')) {
      topicName = 'FAISS & Vector Similarity';
    } else if (queryText.toLowerCase().includes('adam') || queryText.toLowerCase().includes('optimizer')) {
      topicName = 'Optimization & Adam Algorithm';
    }

    psmService.recordKnowledgeQuery(user.id, topicName, queryText, result.retrievedChunks.length);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              AI Engine 1 of 4
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Knowledge Engine (RAG Grounding)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized academic Q&A grounded strictly in your enrolled course lecture notes with exact page citations.
          </p>
        </div>

        {/* Source Scope Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Source Scope:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden font-medium"
          >
            <option value="all">All Enrolled Courses ({enrolledClasses.length})</option>
            {enrolledClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.subject} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {enrolledClasses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            No enrolled courses available for retrieval
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Join a course with a 7-character code in "My Classes" to grant the Knowledge Engine access to lecture notes.
          </p>
        </div>
      ) : (
        <>
          {/* Query Bar */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSearch(queryInput);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  placeholder="Ask a question about lecture notes, mathematical derivations, or algorithms..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !queryInput.trim()}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs whitespace-nowrap"
              >
                {loading ? 'Retrieving Chunks...' : 'Query Material'}
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Suggested:</span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQueryInput(p);
                    handleSearch(p);
                  }}
                  className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active Result View */}
          {currentResult && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Academic Grounded Response
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(currentResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Grounded Answer Text */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans">
                  {currentResult.answer}
                </div>

                {/* Retrieved Source Citations */}
                {currentResult.retrievedChunks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Verifiable Source Citations ({currentResult.retrievedChunks.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {currentResult.retrievedChunks.map((chunk, i) => (
                        <div
                          key={chunk.chunkId}
                          onClick={() => setInspectingChunk(chunk)}
                          className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                              Citation #{i + 1}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {Math.round(chunk.similarityScore * 100)}% match
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {chunk.materialTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Page {chunk.pageNumber || 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 italic">
                            "{chunk.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Citation Inspector Modal / Callout */}
          {inspectedChunk && (
            <div className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Full Source Passage Excerpt ({inspectedChunk.materialTitle} · Page {inspectedChunk.pageNumber || 1})
                </span>
                <button
                  onClick={() => setInspectingChunk(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif bg-white dark:bg-slate-900 p-3 rounded border border-indigo-100 dark:border-indigo-900/50">
                {inspectedChunk.excerpt}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
