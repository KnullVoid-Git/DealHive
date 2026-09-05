"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Hexagon } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative bg-slate-950 py-20 overflow-hidden select-none border-t border-slate-900">
      
      {/* 3 large blurred glowing CSS hex-layers / radial backdrops */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] bg-brand/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[500px] h-[250px] bg-brand-dark/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hexagonal grid wireframe pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        {/* Floating animated sparkles indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-brand-light font-sora shadow-lg backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Unlock Your Sponsorship Potential</span>
        </motion.div>

        {/* H2 Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 text-3xl sm:text-5xl font-extrabold text-white font-sora leading-tight tracking-tight text-balance"
        >
          Stop losing hours to sponsor admin. <br />
          <span className="text-brand">Secure your payouts today.</span>
        </motion.h2>

        {/* Subtitle description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-[13.5px] sm:text-[15.5px] text-slate-400 font-sans max-w-[620px] mx-auto leading-relaxed"
        >
          Join thousands of YouTube creators and brand managers who use DealHive to automate pitch pipelines, secure contract signatures, and clear sponsor payments without the friction.
        </motion.p>

        {/* Button rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/signup"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-b from-brand to-brand-dark text-white font-bold text-[13px] tracking-wider uppercase rounded-xl overflow-hidden transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_rgba(108,99,255,0.5)] group-hover:shadow-[0_0_40px_rgba(108,99,255,0.7)] transition-shadow duration-500" />
            <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
            <span className="relative z-10">Start for Free</span>
          </a>
          <a
            href="/demo"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-bold tracking-wider uppercase text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm transition-all duration-300 ease-spring hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <span>Book a Demo</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Value pills list footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 select-none uppercase tracking-widest font-mono font-bold"
        >
          <div className="flex items-center space-x-1.5">
            <Hexagon className="w-3 h-3 text-brand/50 fill-brand/10" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Hexagon className="w-3 h-3 text-brand/50 fill-brand/10" />
            <span>Setup in 5 minutes</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Hexagon className="w-3 h-3 text-brand/50 fill-brand/10" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
