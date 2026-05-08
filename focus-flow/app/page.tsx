"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { createTask, addTaskToSession, resetSession, getSession, getTasks } from './server-actions/taskActions';

interface Task {
  id: number;
  name: string;
  createdAt: string;
  sessionCount: number;
}

export default function Dashboard() {
  const [seconds, setSeconds] = useState(1500); // 25 min
  const [isActive, setIsActive] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState<number | string>(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Fetch tasks and session on mount
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setSessionId(session.id);
        setSeconds(session.duration * 60);
      }
      const allTasks = await getTasks();
      setTasks(allTasks);
    }
    fetchData();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    let minutes: number;
    if (sessionMinutes === '') minutes = 25;
    else {
      const parsed = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) : sessionMinutes;
      minutes = isNaN(parsed) ? 25 : parsed;
    }
    const fullDuration = minutes * 60;
    if (!isActive) {
      if (seconds === 0 || seconds === fullDuration) {
        setSeconds(fullDuration);
      }
    }
    setIsActive(!isActive);
  };

  const handleReset = async () => {
    setIsActive(false);
    let minutes: number;
    if (sessionMinutes === '') minutes = 25;
    else {
      const parsed = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) : sessionMinutes;
      minutes = isNaN(parsed) ? 25 : parsed;
    }
    const session = await resetSession(minutes);
    setSessionId(session.id);
    setSeconds(minutes * 60);
  };

  const handleCreateTask = async () => {
    const name = prompt('Enter task name:');
    if (!name) return;
    await createTask(name);
    const updated = await getTasks();
    setTasks(updated);
  };

  const handleAddTask = async () => {
    if (!sessionId) {
      alert('No active session. Reset session first.');
      return;
    }
    for (const id of selectedTaskIds) {
      await addTaskToSession(id, sessionId);
    }
    setSelectedTaskIds(new Set());
    const updated = await getTasks();
    setTasks(updated);
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-black">
      {/* Session Timer Section */}
      <div className="mb-8 w-full max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-emerald-400 mb-4 text-center">
          {formatTime(seconds)}
        </h1>

        {/* Duration Input */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <input
              type="text"
              inputMode="numeric"
              value={sessionMinutes}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setSessionMinutes(val);
                }
              }}
              className="w-20 text-emerald-400 text-4xl font-black text-center px-2 py-2 focus:outline-none bg-zinc-900 rounded"
            />
            <span className="text-zinc-400 text-sm">mins</span>
          </div>
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(current + 1);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronUp size={16} className="text-emerald-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(Math.max(current - 1, 1));
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronDown size={16} className="text-emerald-400" />
            </motion.button>
          </div>
        </div>

        {/* Play / Reset Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className={`p-6 rounded-full ${isActive ? 'bg-rose-600' : 'bg-emerald-500'} transition-all text-black`}
          >
            {isActive ? <Pause size={48} /> : <Play size={48} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-6 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white"
          >
            <RotateCcw size={48} />
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateTask}
            className="px-6 py-3 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-600 transition-all"
          >
            <Plus size={20} className="inline mr-2" />
            Create Task
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-all"
          >
            Add Task to Session
          </motion.button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight text-emerald-400 mb-4">Task List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 uppercase text-sm">
                <th className="p-3 border-b border-zinc-700">Select</th>
                <th className="p-3 border-b border-zinc-700">Name</th>
                <th className="p-3 border-b border-zinc-700">Created</th>
                <th className="p-3 border-b border-zinc-700">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b border-zinc-800 hover:bg-zinc-900">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.has(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                  </td>
                  <td className="p-3 text-lg">{task.name}</td>
                  <td className="p-3 text-zinc-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">{task.sessionCount}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-zinc-500">
                    No tasks yet. Click Create Task to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
