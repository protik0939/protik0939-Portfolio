"use client";

import { motion } from "motion/react";

export default function AnimatedBackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-[120px]"
        animate={{ x: [0, 80, -20, 0], y: [0, 50, -10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-[140px]"
        animate={{ x: [0, -70, 20, 0], y: [0, -45, 25, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-8%] left-[15%] h-80 w-80 rounded-full bg-tertiary/20 blur-[120px]"
        animate={{ x: [0, 30, -40, 0], y: [0, -30, 10, 0], scale: [1, 1.1, 0.92, 1] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[20%] bottom-[12%] h-72 w-72 rounded-full bg-primary-container/20 blur-[110px]"
        animate={{ x: [0, -25, 45, 0], y: [0, 35, -25, 0], scale: [1, 0.9, 1.08, 1] }}
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}
