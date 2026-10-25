import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/storage';
import { psmService } from '../../services/psmService';
import { StudyTask } from '../../types';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    return user ? dbService.getStudyTasks(user.id) : [];
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'revision' | 'assignment' | 'exam_prep' | 'career_practice'>('revision');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  if (!user) return null;

  const psm = psmService.getPSM(user.id);

  const handleToggleTask = (task: StudyTask) => {
    const updated = { ...task, completed: !task.completed };
    dbService.saveStudyTask(updated);
    setTasks(dbService.getStudyTasks(user.id));
  };

  const handleDeleteTask = (taskId: string) => {
    dbService.deleteStudyTask(taskId, user.id);
    setTasks(dbService.getStudyTasks(user.id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: StudyTask = {
      id: `task_${Date.now()}`,
      studentId: user.id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      scheduledDate,
      scheduledTime,
      completed: false,
      priority,
      createdAt: new Date().toISOString()
    };

    dbService.saveStudyTask(newTask);
    setTasks(dbService.getStudyTasks(user.id));
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  const handleAddPSMRecommendation = () => {
    const rec = psm.recommendedNextAction;
    const newTask: StudyTask = {
      id: `task_${Date.now()}`,
      studentId: user.id,
      title: rec.title,
      description: `${rec.description} (Evidence: ${rec.evidenceExplanation})`,
      category: 'revision',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '16:00',
      completed: false,
      priority: rec.priority === 'urgent' ? 'high' : 'medium',
      createdAt: new Date().toISOString()
    };

    dbService.saveStudyTask(newTask);
    setTasks(dbService.getStudyTasks(user.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Calendar & Adaptive Study Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan exam prep, assignment milestones, and schedule personalized revision tasks recommended by your Persistent Student Model.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddPSMRecommendation}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Add PSM Recommendation</span>
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Task Creation Form */}
      {isAdding && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Schedule Study Task
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Backpropagation Derivation Practice"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="revision">Revision Session</option>
                  <option value="assignment">Assignment Milestone</option>
                  <option value="exam_prep">Exam Preparation</option>
                  <option value="career_practice">Career Interview Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description / Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Specific pages, topics, or formulas to focus on..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-4 flex items-start justify-between gap-4 transition-colors ${
              task.completed ? 'bg-slate-50/60 dark:bg-slate-950/40 opacity-70' : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleTask(task)}
                className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              <div>
                <h4 className={`text-xs font-semibold text-slate-900 dark:text-white ${
                  task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                  <span className="capitalize">{task.category.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>Due {new Date(task.scheduledDate).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className={`font-medium capitalize ${
                    task.priority === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No study tasks scheduled. Add a task or import a recommendation from the PSM.
          </div>
        )}
      </div>
    </div>
  );
};
