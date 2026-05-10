"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Pause, Play, RotateCw, CheckCircle2, Home } from 'lucide-react';
import { getTasks } from '../server-actions/taskActions';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDisplay {
  id: number;
  name: string;
  allocated: number;
}

export default function TimerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const taskIds = (searchParams.get('tasks') || '').split(',').filter(Boolean).map(Number);
  const allocations = (searchParams.get('allocations') || '').split(',').filter(Boolean).map(Number);

  const [tasks, setTasks] = useState<TaskDisplay[]>([]);
  
  // New streamlined state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Load task names from server and keep allocations from URL
  useEffect(() => {
    async function loadTasks() {
      const allTasks = await getTasks();
      const taskArray: TaskDisplay[] = allTasks
        .filter((t: any) => taskIds.includes(t.id)) // Ensure we only load selected tasks
        .map((t: any, idx: number) => ({
          id: t.id,
          name: t.name,
          allocated: allocations[idx] || 0,
        }));
      setTasks(taskArray);
    }
    loadTasks();
  }, []); // Only run on mount

  // Hydrate initial time once tasks load
  useEffect(() => {
    if (tasks.length > 0 && timeLeft === null) {
      setTimeLeft(tasks[0].allocated * 60);
    }
  }, [tasks, timeLeft]);

  // The Timer Engine
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft !== null) {
      if (timeLeft > 0) {
        // Standard countdown
        interval = setInterval(() => {
          setTimeLeft((prev) => (prev !== null ? prev - 1 : 0));
        }, 1000);
      } else if (timeLeft === 0) {
        // Task is finished, handle transition
        if (activeTaskIndex < tasks.length - 1) {
          const nextIndex = activeTaskIndex + 1;
          setActiveTaskIndex(nextIndex);
          setTimeLeft(tasks[nextIndex].allocated * 60);
          // isActive remains true, so the interval continues seamlessly
        } else {
          // All tasks finished
          setIsActive(false);
          setIsComplete(true);
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, activeTaskIndex, tasks]);

  const formatTime = (s: number | null) => {
    if (s === null) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setIsComplete(false);
    setActiveTaskIndex(0);
    if (tasks.length > 0) {
      setTimeLeft(tasks[0].allocated * 60);
    }
  };

  const handleCompleteEarly = () => {
    setIsActive(false);
    setIsComplete(true);
  };

  const activeTask = tasks[activeTaskIndex];
  // Modified to only show tasks *after* the current one (completed tasks disappear)
  const remainingTasks = useMemo(
    () => tasks.filter((_, i) => i > activeTaskIndex),
    [tasks, activeTaskIndex]
  );

  const totalTaskSeconds = activeTask ? activeTask.allocated * 60 : 0;
  const progressPercentage =
    totalTaskSeconds > 0 && timeLeft !== null
      ? ((totalTaskSeconds - timeLeft) / totalTaskSeconds) * 100
      : 0;

  // --- Animation Variants ---
  const focusCardVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  const glowVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.02, 1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const dimmedTaskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 0.3,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  // --- Success View ---
  if (isComplete) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-black">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-zinc-900 border border-emerald-500 rounded-3xl p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 size={120} className="text-emerald-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl text-emerald-400 mb-4 tracking-tight">Session Complete!</h1>
          <p className="text-zinc-400 mb-8 font-medium">You successfully focused through all your tasks.</p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
            >
              <Home size={20} /> Dashboard
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-full hover:bg-emerald-600 transition-colors"
            >
              <RotateCw size={20} /> Restart Session
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // --- Main Timer View ---
  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-black">
      <AnimatePresence mode="wait">
        {activeTask && (
          <motion.div
            key="focus-card"
            className="relative bg-zinc-900 rounded-3xl p-8 mb-8 w-full max-w-lg overflow-hidden"
            variants={focusCardVariants}
            initial="initial"
            animate="animate"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-3xl border-4 pointer-events-none"
                variants={glowVariants}
                animate="animate"
                style={{ borderColor: '#10b981', opacity: 0.6 }}
              />
            )}

            <motion.h2
              key={activeTask.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl text-emerald-400 mb-6 text-center font-bold tracking-wide"
            >
              {activeTask.name}
            </motion.h2>

            <motion.div className="flex justify-center">
              <span className="text-7xl md:text-9xl font-black text-white tabular-nums" aria-live="polite">
                {formatTime(timeLeft)}
              </span>
            </motion.div>

            <motion.div className="mt-6 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                role="progressbar"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-4 mb-12 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className={`p-6 rounded-full ${isActive ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-black'} transition-all`}
        >
          {isActive ? <Pause size={48} /> : <Play size={48} />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="p-6 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white"
        >
          <RotateCw size={48} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCompleteEarly}
          className="p-6 bg-emerald-500 rounded-full hover:bg-emerald-600 text-black"
        >
          <CheckCircle2 size={48} />
        </motion.button>
      </div>

      {/* Upcoming Tasks */}
      {remainingTasks.length > 0 && (
        <div className="w-full max-w-md space-y-4 mt-4">
          <h3 className="text-xl text-zinc-500 uppercase tracking-widest text-center">
            Upcoming Tasks
          </h3>
          <AnimatePresence>
            {remainingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                custom={index}
                variants={dimmedTaskVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-zinc-900 border-l-4 border-zinc-700 p-4 flex justify-between items-center rounded-lg"
              >
                <span className="text-lg text-zinc-400">{task.name}</span>
                <span className="bg-zinc-800 border border-zinc-700 text-emerald-400 px-3 py-1 rounded text-sm">
                  {task.allocated}m
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}