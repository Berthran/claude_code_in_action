"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addTaskToSession } from '../server-actions/taskActions';
import { X } from 'lucide-react';

interface TaskAllocation {
  id: number;
  name: string;
  allocated: number;
}

interface AllocationModalProps {
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskAllocation[];
  totalDuration: number; // minutes
  onConfirm: (allocations: TaskAllocation[]) => void;
}

export default function AllocationModal({
  isOpen,
  onClose,
  tasks,
  totalDuration,
  onConfirm,
  sessionId,
}: AllocationModalProps) {
  // default allocation: full time for a single task, equal split otherwise
  const getDefaultAllocations = (): TaskAllocation[] => {
    if (tasks.length === 1) {
      return tasks.map(t => ({ ...t, allocated: totalDuration }));
    }
    const split = Math.floor(totalDuration / tasks.length);
    const remainder = totalDuration % tasks.length;
    // Distribute the remainder (extra minutes) to the first few tasks
    return tasks.map((t, i) => ({
      ...t,
      allocated: split + (i < remainder ? 1 : 0),
    }));
  };

  const [allocations, setAllocations] = useState<TaskAllocation[]>(getDefaultAllocations());

  useEffect(() => {
    if (isOpen) {
      setAllocations(getDefaultAllocations());
    }
  }, [tasks, isOpen, totalDuration]);

  const remaining = totalDuration - allocations.reduce((sum, a) => sum + a.allocated, 0);

  const handleChange = (id: number, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setAllocations(prev =>
      prev.map(a => (a.id === id ? { ...a, allocated: num } : a))
    );
  };

  const handleConfirm = async () => {
    if (remaining === 0 && sessionId) {
      // Add each allocated task to the current session
      for (const task of allocations) {
        await addTaskToSession(task.id, sessionId);
      }
      onConfirm(allocations);
      onClose();
    }
  };

  // animation variants for staggered task list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-emerald-400">Allocate Time</h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-between items-center text-zinc-300 mb-2 text-sm">
              <span>Total session (min): {totalDuration}</span>
              <motion.span
                className={remaining < 0 ? 'text-red-500' : ''}
                animate={remaining < 0 ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                Remaining: {remaining}
              </motion.span>
            </div>
            {remaining > 0 && (
              <p className="text-yellow-400 mt-1">Warning: {remaining} minute(s) unallocated.</p>
            )}
            {/* List of selected tasks */}
            <h4 className="text-lg font-medium text-emerald-400 mb-2 mt-4">Selected Tasks</h4>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {allocations.map(task => (
                <motion.div key={task.id} variants={itemVariants} className="flex items-center mb-3">
                  <span className="flex-1 text-emerald-400">{task.name}</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={task.allocated}
                    onChange={(e) => handleChange(task.id, e.target.value)}
                    className="w-20 px-2 py-1 bg-zinc-800 border border-emerald-400 rounded text-white"
                  />
                  <span className="ml-2 text-zinc-400">min</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={remaining !== 0}
                className={`px-4 py-2 bg-emerald-500 text-black font-bold rounded ${remaining !== 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'} transition-colors`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
