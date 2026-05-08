"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import PremiumClock from './components/PremiumClock';
import { PromptModal, AlertModal } from './components/Modal';
import AllocationModal from './components/AllocationModal';
import { motion } from 'framer-motion';
import { createTask, addTaskToSession, getSession, getTasks } from './server-actions/taskActions';

interface Task {
  id: number;
  name: string;
  createdAt: Date;
  sessionCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [sessionMinutes, setSessionMinutes] = useState<number | string>(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAllocationOpen, setIsAllocationOpen] = useState(false);
  const [allocations, setAllocations] = useState<Array<{id:number; name:string}>>([]);

  // Fetch tasks and session on mount
  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      if (session) {
        setSessionId(session.id);
      }
      const allTasks = await getTasks();
      setTasks(allTasks as Task[]);
    }
    fetchData();
  }, []);

  const handleCreateTask = async (name: string) => {
    if (!name) return;
    await createTask(name);
    const updated = await getTasks();
    setTasks(updated as Task[]);
  };

  const handleAddTask = async () => {
    if (!sessionId) {
      setAlertMessage('No active session. Reset session first.');
      setIsAlertOpen(true);
      return;
    }
    for (const id of selectedTaskIds) {
      await addTaskToSession(id, sessionId);
    }
    setSelectedTaskIds(new Set());
    const updated = await getTasks();
    setTasks(updated as Task[]);
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartSession = () => {
    if (selectedTaskIds.size === 0) {
      setAlertMessage('Please select at least one task.');
      setIsAlertOpen(true);
      return;
    }
    const minutes = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes;
    // Prepare selected tasks for allocation modal
    const selectedTasks = Array.from(selectedTaskIds).map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? { id: task.id, name: task.name } : null;
    }).filter(Boolean) as {id:number; name:string}[];
    setAllocations(selectedTasks);
    setIsAllocationOpen(true);
  };

  const handleAllocationConfirm = (allocs: Array<{id:number; name:string; allocated:number}>) => {
    const minutes = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes;
    const taskIds = allocs.map(a => a.id).join(',');
    const allocatedMinutes = allocs.map(a => a.allocated).join(',');
    router.push(`/timer?duration=${minutes}&tasks=${taskIds}&allocations=${allocatedMinutes}`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-black">
      {/* Premium Clock Section */}
      <div className="mb-8 w-full max-w-2xl flex flex-col items-center">
        <PremiumClock />

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

        {/* Start Session Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartSession}
          className="p-6 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all text-black"
        >
          <Play size={48} />
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-12">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPromptOpen(true)}
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

      {/* Task List */}
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight text-emerald-400 mb-4">Task List</h2>
        <div className="space-y-3">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-zinc-900 border-l-4 border-emerald-500 p-4 rounded hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.has(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-lg">{task.name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                <span className="text-emerald-400 font-bold">{task.sessionCount} sessions</span>
              </div>
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-zinc-500 py-6">No tasks yet. Click Create Task to add one.</p>
          )}
        </div>
      </div>
      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        onSubmit={handleCreateTask}
        title="Create Task"
        placeholder="Task name"
      />
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        message={alertMessage}
      />
      <AllocationModal
        isOpen={isAllocationOpen}
        onClose={() => setIsAllocationOpen(false)}
        tasks={allocations.map(t => ({ id: t.id, name: t.name, allocated: 0 }))}
        totalDuration={typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 25 : sessionMinutes}
        onConfirm={handleAllocationConfirm}
      />
    </main>
  );
}
