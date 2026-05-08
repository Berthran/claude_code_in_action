"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, Bell, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusApp() {
  const [seconds, setSeconds] = useState(900); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState<number | string>(15);

  // Focus Session Breakdown Example
  const subTasks = [
    { name: "Draft Mail", duration: 5 },
    { name: "Read Book", duration: 15 },
    { name: "Workout", duration: 5 },
  ];

  function triggerSleepCheck() {
    // Basic browser beep - Claude Code can help you replace with MP3 later
    const context = new AudioContext();
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.connect(context.destination);
    osc.start();
    setTimeout(() => osc.stop(), 500);
    console.log("SLEEP CHECK: Are you awake?");
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);

        // Sleep Check Trigger: Every 5 minutes (300 seconds)
        if (seconds !== 1500 && seconds % 300 === 0) {
          triggerSleepCheck();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-black">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-700 gap-4">
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
              className="w-20 text-emerald-400 text-4xl font-black text-center px-2 py-2 focus:outline-none"
            />
            <span className="text-zinc-400 text-sm">mins</span>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(current + 1);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronUp size={16} className="text-emerald-400" />
            </button>
            <button
              onClick={() => {
                const current = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) || 0 : sessionMinutes;
                setSessionMinutes(Math.max(current - 1, 1));
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500"
            >
              <ChevronDown size={16} className="text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-6xl md:text-8xl mb-8 text-emerald-400 tracking-tighter"
      >
        {formatTime(seconds)}
      </motion.h1>

      <div className="flex gap-4 mb-12">
        <button
          onClick={() => {
            let minutes: number;
            if (sessionMinutes === '') {
              minutes = 15;
            } else {
              const parsed = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) : sessionMinutes;
              minutes = isNaN(parsed) ? 15 : parsed;
            }
            const fullDuration = minutes * 60;
            if (!isActive) {
              if (seconds === 0 || seconds === fullDuration) {
                setSeconds(fullDuration);
              }
            }
            setIsActive(!isActive);
          }}
          className={`p-6 rounded-full ${
            isActive ? "bg-rose-600" : "bg-emerald-500"
          } transition-all hover:scale-110 text-black`}
        >
          {isActive ? <Pause size={48} /> : <Play size={48} />}
        </button>

        <button
          onClick={() => {
            setIsActive(false);
            let minutes: number;
            if (sessionMinutes === '') {
              minutes = 15;
            } else {
              const parsed = typeof sessionMinutes === 'string' ? parseInt(sessionMinutes) : sessionMinutes;
              minutes = isNaN(parsed) ? 15 : parsed;
            }
            setSeconds(minutes * 60);
          }}
          className="p-6 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white"
        >
          <RotateCw size={48} />
        </button>
      </div>

      <div className="w-full max-w-md space-y-4">
        <h3 className="text-xl text-zinc-500 uppercase tracking-widest">
          Active Plan
        </h3>
        {subTasks.map((task, i) => (
          <div
            key={i}
            className="bg-zinc-900 border-l-8 border-emerald-500 p-4 flex justify-between items-center"
          >
            <span className="text-2xl">{task.name}</span>
            <span className="bg-emerald-500 text-black px-2 py-1 rounded text-sm">
              {task.duration}M
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
