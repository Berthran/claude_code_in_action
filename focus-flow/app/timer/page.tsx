"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pause, Play, RotateCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskDisplay {
  id: number;
  name: string;
  allocated: number;
}

export default function TimerPage() {
  const searchParams = useSearchParams();
  const duration = parseInt(searchParams.get('duration') || '25');
  const taskIds = (searchParams.get('tasks') || '').split(',').filter(Boolean).map(Number);
  const allocations = (searchParams.get('allocations') || '').split(',').filter(Boolean).map(Number);

  const tasks: TaskDisplay[] = taskIds.map((id, idx) => ({
    id,
    name: `Task ${id}`,
    allocated: allocations[idx] || 0,
  }));

  const [seconds, setSeconds] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);

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
    const fullDuration = duration * 60;
    if (!isActive) {
      if (seconds === 0 || seconds === fullDuration) {
        setSeconds(fullDuration);
      }
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(duration * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    // In a real app, you'd update task session counts here
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center font-black">
      {/* Timer Display */}
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-6xl md:text-8xl mb-8 text-emerald-400 tracking-tighter"
      >
        {formatTime(seconds)}
      </motion.h1>

      {/* Controls */}
      <div className="flex gap-4 mb-12">
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
          <RotateCw size={48} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          className="p-6 bg-emerald-500 rounded-full hover:bg-emerald-600 text-black"
        >
          <CheckCircle2 size={48} />
        </motion.button>
      </div>

      {/* Task List with Allocations */}
      <div className="w-full max-w-md space-y-4">
        <h3 className="text-xl text-zinc-500 uppercase tracking-widest">
          Active Plan
        </h3>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border-l-8 border-emerald-500 p-4 flex justify-between items-center"
          >
            <span className="text-2xl">{task.name}</span>
            <span className="bg-emerald-500 text-black px-2 py-1 rounded text-sm">
              {task.allocated}M
            </span>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
