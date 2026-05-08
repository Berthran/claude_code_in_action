"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumClock() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex items-center justify-center mb-8"
    >
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_40px_rgba(52,211,153,0.4)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer glow ring */}
        <circle cx="100" cy="100" r="95" stroke="rgba(52,211,153,0.2)" strokeWidth="8" />
        {/* Main clock face */}
        <circle cx="100" cy="100" r="90" stroke="#34d399" strokeWidth="4" fill="black" />
        {/* Inner subtle ring */}
        <circle cx="100" cy="100" r="85" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
        {/* Hour markers */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 70 * Math.sin(rad);
          const y1 = 100 - 70 * Math.cos(rad);
          const x2 = 100 + 75 * Math.sin(rad);
          const y2 = 100 - 75 * Math.cos(rad);
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#34d399"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        {/* Hour hand */}
        <line x1="100" y1="100" x2="100" y2="55" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
        {/* Minute hand */}
        <line x1="100" y1="100" x2="130" y2="100" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
        {/* Second hand (animated) */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="40"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        />
        {/* Center dot */}
        <circle cx="100" cy="100" r="6" fill="#34d399" />
        {/* Luxury glow pulse */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="#34d399"
          strokeWidth="4"
          fill="none"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
