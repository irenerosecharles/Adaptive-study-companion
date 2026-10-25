import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { LearningMaterial, MaterialChunk } from '../../types';
import {
  FolderUp,
  FileText,
  File,
  Trash2,
  Eye,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const MaterialsManagerView: React.FC = () => {
  const { user, isTeacher } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | 'docx' | 'image'>('pdf');
  const [fileName, setFileName] = useState('');
  const [materialContent, setMaterialContent] = useState('');
  const [previewChunks, setPreviewChunks] = useState<MaterialChunk[] | null>(null);
  const [inspectingMaterial, setInspectingMaterial] = useState<LearningMaterial | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!user) return null;

  const teacherClasses = isTeacher ? dbService.getClassesForTeacher(user.id) : [];
  const materials = isTeacher
    ? dbService.getMaterials().filter(m => m.teacherId === user.id)
    : dbService.getMaterialsForStudent(user.id);

  // Set default class if not set
  if (!selectedClassId && teacherClasses.length > 0) {
    setSelectedClassId(teacherClasses[0].id);
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !materialContent.trim() || !selectedClassId) {
      setMessage('Please fill in title, select a class, and provide course material content.');
      return;
    }

    // Split content into clean chunks
    const paragraphs = materialContent
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 20);

    const chunks = paragraphs.length > 0 ? paragraphs : [materialContent.trim()];

    const uploaded = dbService.addMaterial(
      selectedClassId,
      user.id,
      title.trim(),
      description.trim() || `Lecture material covering ${title}`,
      fileName.trim() || `${title.replace(/\s+/g, '_')}.${fileType}`,
      fileType,
      Math.max(1024, materialContent.length * 4),
      chunks
    );

    setTitle('');
    setDescription('');
    setFileName('');
    setMaterialContent('');
    setMessage(`Successfully uploaded and indexed "${uploaded.title}" into ${chunks.length} FAISS chunks!`);
  };

  const handleDelete = (materialId: string) => {
    if (confirm('Are you sure you want to delete this material and all its vector chunks?')) {
      dbService.deleteMaterial(materialId, user.id);
      setMessage('Material and associated vector chunks removed.');
      if (inspectingMaterial?.id === materialId) {
        setInspectingMaterial(null);
      }
    }
  };

  const handleInspectChunks = (mat: LearningMaterial) => {
    const allChunks = dbService.getChunks().filter(c => c.materialId === mat.id);
    setInspectingMaterial(mat);
    setPreviewChunks(allChunks);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isTeacher ? 'Learning Materials Repository & Ingestion Pipeline' : 'Course Notes & Academic Documents'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Documents are automatically partitioned into chunks, assigned FAISS vector identifiers, and indexed for source-grounded RAG retrieval.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Teacher Ingestion Form */}
      {isTeacher && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <FolderUp className="h-4 w-4" />
            <span>Upload & Ingest Lecture Notes (PDF / PPTX / DOCX / Scanned OCR)</span>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Course
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {teacherClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.subject} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Convolutional Neural Networks"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Source File Format
                </label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="pdf">PDF Document (PyMuPDF)</option>
                  <option value="pptx">PowerPoint Presentation (python-pptx)</option>
                  <option value="docx">Word Document (python-docx)</option>
                  <option value="image">Scanned Diagram / OCR (Tesseract)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Extracted Text Content (Simulated Ingestion / Pasted Syllabus Chunks)
              </label>
              <textarea
                rows={4}
                required
                value={materialContent}
                onChange={e => setMaterialContent(e.target.value)}
                placeholder="Paste the extracted academic notes text here. Separate paragraphs with empty lines to create distinct RAG chunks with page numbers..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden font-mono"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                In local Python deployment, PyMuPDF / python-docx parses the file automatically. Each paragraph is transformed into a dense embedding and pushed to the FAISS index.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Chunk, Index in FAISS & Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Available Course Materials ({materials.length})
          </h2>
          <span className="text-xs text-slate-500">
            Protected by classroom enrollment boundaries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Format</th>
                <th className="px-5 py-3">Vector Chunks</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {materials.map(mat => (
                <tr key={mat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-white">{mat.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{mat.originalFilename}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {mat.className || 'Class'}
                  </td>
                  <td className="px-5 py-3.5 uppercase font-mono text-[11px] text-slate-500">
                    {mat.fileType}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {mat.chunkCount} Chunks
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>FAISS Indexed</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleInspectChunks(mat)}
                      className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60 rounded border border-indigo-200 dark:border-indigo-900/60 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect Chunks</span>
                    </button>
                    {isTeacher && (
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/60 rounded border border-red-200 dark:border-red-900/60 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {materials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No course materials uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chunk Inspector Drawer / Modal */}
      {inspectingMaterial && previewChunks && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                FAISS Vector Space Inspector
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Chunks for: {inspectingMaterial.title}
              </h3>
            </div>
            <button
              onClick={() => { setInspectingMaterial(null); setPreviewChunks(null); }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Close Inspector
            </button>
          </div>

          <div className="space-y-3">
            {previewChunks.map(chunk => (
              <div
                key={chunk.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono text-[10px] font-bold">
                      Chunk #{chunk.chunkIndex}
                    </span>
                    <span className="text-xs text-slate-500">
                      Page {chunk.pageNumber || 'N/A'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    FAISS Vector ID: {chunk.faissVectorId}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
