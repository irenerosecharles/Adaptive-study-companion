import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import {
  PersonalNote,
  NoteType,
  TextNote,
  KeyPointNote,
  FlashcardNote,
  ImageNote,
  ImageAnnotation
} from '../../types';
import {
  FileText,
  List,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const NotesWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteType, setNewNoteType] = useState<NoteType>('text');

  // Form Fields
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [classId, setClassId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Text Note field
  const [textContent, setTextContent] = useState('');

  // Key Point Note fields
  const [summary, setSummary] = useState('');
  const [pointsInput, setPointsInput] = useState('');
  const [takeawaysInput, setTakeawaysInput] = useState('');

  // Flashcard fields
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');

  // Image Note fields
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [annLabel, setAnnLabel] = useState('');
  const [annDesc, setAnnDesc] = useState('');

  // Flashcard Flip State
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const enrolledClasses = dbService.getClassesForStudent(user.id);
  const notes = dbService.getNotes(user.id);

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const toggleFlip = (noteId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      dbService.deleteNote(noteId, user.id);
      // Trigger re-render by local state refresh
      setFilterType(prev => prev);
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const baseNote = {
      id: `note_${Date.now()}`,
      studentId: user.id,
      classId: classId || undefined,
      className: enrolledClasses.find(c => c.id === classId)?.name,
      title: title.trim(),
      topic: topic.trim(),
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let createdNote: PersonalNote;

    if (newNoteType === 'text') {
      createdNote = {
        ...baseNote,
        type: 'text',
        content: textContent.trim()
      };
    } else if (newNoteType === 'key_point') {
      createdNote = {
        ...baseNote,
        type: 'key_point',
        summary: summary.trim(),
        points: pointsInput.split('\n').filter(p => p.trim()),
        takeaways: takeawaysInput.split('\n').filter(p => p.trim())
      };
    } else if (newNoteType === 'flashcard') {
      createdNote = {
        ...baseNote,
        type: 'flashcard',
        frontContent: frontContent.trim(),
        backContent: backContent.trim(),
        reviewCount: 0,
        mastered: false
      };
    } else {
      createdNote = {
        ...baseNote,
        type: 'image',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        caption: caption.trim(),
        annotations: annLabel ? [{ id: `ann_${Date.now()}`, xPercent: 50, yPercent: 50, label: annLabel, description: annDesc }] : []
      };
    }

    dbService.saveNote(createdNote);
    setIsCreating(false);

    // Reset Form
    setTitle('');
    setTopic('');
    setTagsInput('');
    setTextContent('');
    setSummary('');
    setPointsInput('');
    setTakeawaysInput('');
    setFrontContent('');
    setBackContent('');
    setImageUrl('');
    setCaption('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Learning Workspace & Notes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize study notes into 4 explicit formats: Markdown Text, Key Takeaways, Interactive Flashcards, and Annotated Diagrams.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All Formats ({notes.length})
          </button>
          <button
            onClick={() => setFilterType('text')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'text'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Text Notes
          </button>
          <button
            onClick={() => setFilterType('key_point')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'key_point'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Key-Point Notes
          </button>
          <button
            onClick={() => setFilterType('flashcard')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'flashcard'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterType === 'image'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Diagrams
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search title, topic, tags..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Create New Personal Note
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-4">
            {/* Note Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Note Format Structure (Select Type)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'text', label: 'Text Note', icon: FileText },
                  { id: 'key_point', label: 'Key-Point Note', icon: List },
                  { id: 'flashcard', label: 'Flashcard Note', icon: Layers },
                  { id: 'image', label: 'Diagram / Image', icon: ImageIcon }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewNoteType(item.id as NoteType)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                        newNoteType === item.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Common Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Backpropagation Derivation"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Subject Area
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Neural Networks"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Associated Course (Optional)
                </label>
                <select
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="">None / General</option>
                  {enrolledClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.subject} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type-Specific Fields */}
            {newNoteType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Note Content (Markdown & Formulas)
                </label>
                <textarea
                  rows={4}
                  required
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                  placeholder="Write detailed notes, formulas, code snippets..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            )}

            {newNoteType === 'key_point' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conceptual Summary
                  </label>
                  <input
                    type="text"
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="Brief 1-line high-level thesis"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Key Points (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={pointsInput}
                      onChange={e => setPointsInput(e.target.value)}
                      placeholder="Point 1&#10;Point 2&#10;Point 3"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Takeaways (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={takeawaysInput}
                      onChange={e => setTakeawaysInput(e.target.value)}
                      placeholder="Takeaway 1&#10;Takeaway 2"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {newNoteType === 'flashcard' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Front (Prompt / Term / Question)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={frontContent}
                    onChange={e => setFrontContent(e.target.value)}
                    placeholder="What is the time complexity of self-attention?"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Back (Answer / Explanation)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={backContent}
                    onChange={e => setBackContent(e.target.value)}
                    placeholder="O(N^2 * d) where N is sequence length and d is dimension."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {newNoteType === 'image' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Image URL or Diagram Reference
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Caption / Explanation
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Diagram showing loss curvature"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="exam-prep, formula, derivation"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => {
          return (
            <div
              key={note.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Note Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {note.type === 'text' && <FileText className="h-3.5 w-3.5 text-blue-500" />}
                    {note.type === 'key_point' && <List className="h-3.5 w-3.5 text-emerald-500" />}
                    {note.type === 'flashcard' && <Layers className="h-3.5 w-3.5 text-purple-500" />}
                    {note.type === 'image' && <ImageIcon className="h-3.5 w-3.5 text-amber-500" />}
                    <span>{note.type.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {note.title}
                </h3>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {note.topic} {note.className ? `· ${note.className}` : ''}
                </p>

                {/* Content according to type */}
                {note.type === 'text' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-line font-serif line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                )}

                {note.type === 'key_point' && (
                  <div className="mt-3 space-y-2 text-xs">
                    {note.summary && (
                      <p className="italic text-slate-600 dark:text-slate-300 font-serif">
                        "{note.summary}"
                      </p>
                    )}
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                      {note.points.slice(0, 3).map((p, i) => (
                        <li key={i} className="line-clamp-2">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.type === 'flashcard' && (
                  <div className="mt-3">
                    <div
                      onClick={() => toggleFlip(note.id)}
                      className={`cursor-pointer min-h-[110px] rounded-lg p-3.5 flex flex-col justify-between border transition-all text-xs font-medium ${
                        flippedCards[note.id]
                          ? 'border-purple-300 bg-purple-50/60 text-purple-950 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200'
                          : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {flippedCards[note.id] ? 'Back (Answer)' : 'Front (Prompt)'}
                        </span>
                        <p className="leading-snug">
                          {flippedCards[note.id] ? note.backContent : note.frontContent}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 block text-right">
                        Click card to flip ↺
                      </span>
                    </div>
                  </div>
                )}

                {note.type === 'image' && (
                  <div className="mt-3 space-y-2">
                    <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={note.imageUrl}
                        alt={note.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {note.caption && (
                      <p className="text-[11px] text-slate-500 italic">{note.caption}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tags and Date */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-medium text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              No personal notes found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first note using any of the 4 supported formats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
