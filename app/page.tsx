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
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, due_date: dueDate, topic, status }),
    });
    setTitle('');
    setDescription('');
    setDueDate('');
    setTopic('');
    setStatus('Todo');
    fetchTasks();
  };

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    fetchTasks();
  };

  const handleArchive = async (task: Task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, is_archived: 1 }),
    });
    fetchTasks();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'due_date') return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    if (sortBy === 'topic') return a.topic.localeCompare(b.topic);
    return a.status.localeCompare(b.status);
  });

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'Complete' && new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Local-First To-Do App</h1>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="bg-slate-100 p-4 rounded-lg mb-8 grid grid-gap-4 gap-2">
        <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="p-2 border rounded" />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="p-2 border rounded" />
        <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="p-2 border rounded" />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="p-2 border rounded">
          <option value="Todo">Todo</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Complete">Complete</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Task</button>
      </form>

      {/* Sorting Control */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task List</h2>
        <div>
          <label className="mr-2 text-sm font-medium">Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="p-1 border rounded">
            <option value="due_date">Due Date</option>
            <option value="topic">Topic</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.map((task) => {
          const overdue = isOverdue(task.due_date, task.status);
          return (
            <div key={task.id} className={`p-4 border rounded-lg shadow-sm ${task.is_archived ? 'bg-gray-200 opacity-75' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">
                    {task.title} {task.is_archived ? '(Archived)' : ''}
                  </h3>
                  <p className="text-gray-600">{task.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Topic: <span className="font-semibold">{task.topic}</span></p>
                  <p className={`text-sm mt-1 ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    Due: {task.due_date} {overdue && '⚠️ OVERDUE'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <select 
                    value={task.status} 
                    disabled={task.is_archived === 1}
                    onChange={(e) => handleStatusChange(task, e.target.value as any)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                  {!task.is_archived && (
                    <button onClick={() => handleArchive(task)} className="text-sm text-red-600 hover:underline">
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}