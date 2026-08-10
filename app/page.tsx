'use client';

import { useState, useEffect } from 'react';

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: 'Todo' | 'In-Progress' | 'Complete';
  is_archived: number;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'Todo' | 'In-Progress' | 'Complete'>('Todo');
  const [sortBy, setSortBy] = useState<'due_date' | 'topic' | 'status'>('due_date');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingTask,
          title,
          description,
          due_date: dueDate,
          topic,
          status,
        }),
      });

      setTasks((prev) =>
        prev.map((t) =>
          Number(t.id) === Number(editingTask.id)
            ? { ...t, title, description, due_date: dueDate, topic, status }
            : t
        )
      );
      setEditingTask(null);
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate, topic, status }),
      });
    }

    setTitle('');
    setDescription('');
    setDueDate('');
    setTopic('');
    setStatus('Todo');
    fetchTasks();
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setTopic(task.topic);
    setStatus(task.status);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setTopic('');
    setStatus('Todo');
  };

  const handleStatusChange = async (id: number, newStatus: 'Todo' | 'In-Progress' | 'Complete') => {
    const taskToUpdate = tasks.find((t) => Number(t.id) === Number(id));
    if (!taskToUpdate) return;

    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskToUpdate, status: newStatus }),
    });

    if (response.ok) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) === Number(id) ? { ...task, status: newStatus } : task
        )
      );
    }
  };

  const handleArchive = async (id: number) => {
    const taskToArchive = tasks.find((t) => Number(t.id) === Number(id));
    if (!taskToArchive) return;

    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskToArchive, is_archived: 1 }),
    });

    if (response.ok) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) === Number(id) ? { ...task, is_archived: 1 } : task
        )
      );
    }
  };

  const sortedTasks = [...tasks]
    .filter((task) => (showArchived ? true : Number(task.is_archived) !== 1))
    .sort((a, b) => {
      if (sortBy === 'due_date') return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (sortBy === 'topic') return a.topic.localeCompare(b.topic);
      return a.status.localeCompare(b.status);
    });

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'Complete' && new Date(dueDate) < new Date(new Date().toDateString());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Todo':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'In-Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Complete':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 p-6 font-sans text-purple-950">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-purple-900 drop-shadow-sm">
            Local-First To-Do App
          </h1>
          <p className="text-purple-600/80 text-sm mt-1 font-medium">
            Organize your tasks with smooth pastel elegance
          </p>
        </header>

        {/* Task Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-purple-900/5 border border-white/60 mb-8 grid gap-4 transition-all"
        >
          <h2 className="text-lg font-bold text-purple-900">
            {editingTask ? `✨ Edit Task #${editingTask.id}` : '➕ Create New Task'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="p-3 border border-purple-200/80 rounded-xl bg-purple-50/40 text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
            />
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="p-3 border border-purple-200/80 rounded-xl bg-purple-50/40 text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 border border-purple-200/80 rounded-xl bg-purple-50/40 text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition resize-none h-20"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="p-3 border border-purple-200/80 rounded-xl bg-purple-50/40 text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="p-3 border border-purple-200/80 rounded-xl bg-purple-50/40 text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
            >
              <option value="Todo">Todo</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all flex-1"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-blue-100 text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-blue-200 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Task List Header & Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-purple-900">Task List</h2>
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs px-3 py-1.5 bg-purple-200/60 hover:bg-purple-200 text-purple-800 rounded-lg font-medium border border-purple-300/50 transition"
            >
              {showArchived ? '👁️ Hide Archived' : '📦 Show Archived'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-purple-200/80 rounded-xl bg-white/80 text-purple-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="due_date">Due Date</option>
              <option value="topic">Topic</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white/40 rounded-2xl border border-purple-100">
              <p className="text-purple-400 font-medium">No tasks found. Add one above!</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const overdue = isOverdue(task.due_date, task.status);
              const isArchived = Number(task.is_archived) === 1;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-md ${
                    isArchived
                      ? 'bg-purple-50/40 border-purple-100 opacity-60'
                      : 'bg-white/80 backdrop-blur-sm border-white/80 shadow-purple-900/5 hover:shadow-purple-900/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-lg font-bold ${isArchived ? 'line-through text-purple-400' : 'text-purple-950'}`}>
                          {task.title}
                        </h3>
                        {isArchived && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-700 font-medium">
                            Archived
                          </span>
                        )}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-purple-800/80 text-sm leading-relaxed">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-purple-600/80 pt-1">
                        <span>
                          🏷️ Topic: <strong className="text-purple-900">{task.topic}</strong>
                        </span>
                        <span className={overdue ? 'text-rose-600 font-bold' : ''}>
                          📅 Due: {task.due_date} {overdue && '⚠️ OVERDUE'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end">
                      <select
                        value={task.status}
                        disabled={isArchived}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                        className="p-1.5 border border-purple-200 rounded-lg text-xs bg-purple-50/50 text-purple-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Complete">Complete</option>
                      </select>

                      {!isArchived && (
                        <div className="flex gap-3 text-xs font-semibold pt-1">
                          <button
                            type="button"
                            onClick={() => startEdit(task)}
                            className="text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(task.id)}
                            className="text-rose-500 hover:text-rose-700 transition"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}