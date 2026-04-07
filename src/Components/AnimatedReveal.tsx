"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function AnimatedReveal({ children, className, delay = 0 }: Readonly<AnimatedRevealProps>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
