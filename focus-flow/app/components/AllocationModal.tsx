"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TaskAllocation {
  id: number;
  name: string;
  allocated: number;
}

interface AllocationModalProps {
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
}: AllocationModalProps) {
  const [allocations, setAllocations] = useState<TaskAllocation[]>(
    tasks.map(t => ({ ...t, allocated: 0 }))
  );

  const remaining = totalDuration - allocations.reduce((sum, a) => sum + a.allocated, 0);

  const handleChange = (id: number, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setAllocations(prev =>
      prev.map(a => (a.id === id ? { ...a, allocated: num } : a))
    );
  };

  const handleConfirm = () => {
    if (remaining === 0) {
      onConfirm(allocations);
      onClose();
    }
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
            <p className="text-zinc-300 mb-2">
              Total session minutes: {totalDuration}. Remaining: {remaining}.
            </p>
            {allocations.map(task => (
              <div key={task.id} className="flex items-center mb-3">
                <span className="flex-1 text-emerald-400">{task.name}</span>
                <input
                  type="number"
                  min="0"
                  value={task.allocated}
                  onChange={(e) => handleChange(task.id, e.target.value)}
                  className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-white"
                />
                <span className="ml-2 text-zinc-400">min</span>
              </div>
            ))}
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
