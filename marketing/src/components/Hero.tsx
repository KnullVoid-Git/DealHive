"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ThreeCanvas from "./ThreeCanvas";

export default function Hero() {
  const variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1], // Premium custom bezier
        delay: custom * 0.08,
      },
    }),
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center pt-28 pb-16 overflow-hidden bg-transparent select-none z-10">
      {/* 3D WebGL Honeycomb Hive dynamic background */}
      <ThreeCanvas />

      {/* Hero Content Wrapper - Split asymmetrical flow */}
      <div className="relative max-w-7xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-center z-10 select-none justify-between gap-12">
        
        {/* Left Column: Premium Pitch Copy */}
        <div className="flex flex-col items-center lg:items-start max-w-2xl lg:max-w-xl space-y-6">
          {/* Pill Trust Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="relative overflow-hidden px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[13px] font-medium text-indigo-200 font-sora shadow-sm"
          >
            {/* Shimmer Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-sweep bg-[length:50%_100%] bg-no-repeat" />
            <span className="relative z-10">⬡ Trusted by 2,400+ creators</span>
          </motion.div>

          {/* H1 Main Heading */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="text-4xl sm:text-[56px] font-extrabold text-white font-sora leading-[1.15] tracking-[-0.04em] text-balance text-center lg:text-left"
          >
            Your brand deals, <br />
            <span className="text-brand">finally</span> under control.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="text-base sm:text-lg font-sans text-slate-400 leading-[1.65] text-center lg:text-left"
          >
            From first pitch to final payment — DealHive handles contracts,
            deliverables, and invoicing so you can focus on creating.
          </motion.p>

          {/* CTA buttons row */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
          >
            <a
              href="/signup"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-b from-brand to-brand-dark text-white font-bold text-[13px] tracking-wider uppercase rounded-xl overflow-hidden transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97]"
            >
              {/* Animated glow ring */}
              <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_rgba(108,99,255,0.5)] group-hover:shadow-[0_0_40px_rgba(108,99,255,0.7)] transition-shadow duration-500" />
              {/* Inner highlight */}
              <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
              <span className="relative z-10">Start for Free</span>
            </a>
            <a
              href="#how-it-works"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-bold tracking-wider uppercase text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 ease-spring hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span>See how it works</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Details footer */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="text-xs text-slate-500 flex items-center gap-2 select-none"
          >
            <span>No credit card required</span>
            <span className="text-brand/35">•</span>
            <span>Setup in 5 minutes</span>
          </motion.div>
        </div>

        {/* Right Column Spacer: Reserves visual canvas space for the giant 3D Honeycomb Hive */}
        <div className="w-full lg:w-[48%] h-[300px] lg:h-[450px] pointer-events-none hidden lg:block" />

      </div>
    </div>
  );
}
