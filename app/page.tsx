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
       setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, title, description, due_date: dueDate, topic, status } 
          : t
      ));
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
    // 1. Find the task
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    // 2. Send the update to the database
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskToUpdate, status: newStatus }),
    });

    // 3. Update the React state so the UI changes immediately
    if (response.ok) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
    } else {
      console.error("Failed to update status");
    }
  };

    const handleArchive = async (id: number) => {
    // 1. Safe search converting both sides to numbers
    const taskToArchive = tasks.find(t => Number(t.id) === Number(id));
    
    if (!taskToArchive) {
      console.error("Could not find task with ID:", id);
      return;
    }

    try {
      // 2. Send the update to the backend
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskToArchive, is_archived: 1 }), 
      });

      // 3. Mark as archived in React state
      if (response.ok) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            Number(task.id) === Number(id) ? { ...task, is_archived: 1 } : task
          )
        );
      } else {
        console.error("Failed to archive task on server");
      }
    } catch (error) {
      console.error("Network error while archiving:", error);
    }
  };

  const sortedTasks = [...tasks]
  .filter(task => showArchived ? true : Number(!task.is_archived) !== 1)
  .sort((a, b) => {
    if (sortBy === 'due_date') return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    if (sortBy === 'topic') return a.topic.localeCompare(b.topic);
    return a.status.localeCompare(b.status);
  });

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'Complete' && new Date(dueDate) < new Date(new Date().toDateString());
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans bg-white text-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Local-First To-Do App</h1>

      {/* Task Form (Creation & Editing) */}
      <form onSubmit={handleSubmit} className="bg-slate-100 p-4 rounded-lg mb-8 grid gap-4">
        <h2 className="text-xl font-semibold mb-2">
          {editingTask ? `Edit Task #${editingTask.id}` : 'Create New Task'}
        </h2>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="p-2 border rounded" />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="p-2 border rounded" />
        <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required className="p-2 border rounded" />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="p-2 border rounded">
          <option value="Todo">Todo</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Complete">Complete</option>
        </select>
        
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex-1">
            {editingTask ? 'Save Changes' : 'Add Task'}
          </button>
          {editingTask && (
            <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Sorting Control */}
          {/* Sorting Control */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Task List</h2>
          <button 
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-black font-medium"
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
        <div>
          <label className="mr-2 text-sm font-medium">Sort By:</label>
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
                    onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Complete">Complete</option>
                  </select>

                  {!task.is_archived && (
                    <>
                      <button onClick={() => startEdit(task)} className="text-sm text-blue-600 hover:underline text-right">
                        Edit
                      </button>
                      <button 
                        type = "button"
                        onClick={() => handleArchive(task.id)} 
                        className="text-sm text-red-600 hover:underline text-right"
                        >
                        Archive
                      </button>
                    </>
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