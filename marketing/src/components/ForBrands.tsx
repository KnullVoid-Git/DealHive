"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, DollarSign, Users, TrendingUp } from "lucide-react";

export default function ForBrands() {
  const shouldReduceMotion = useReducedMotion();

  const brandFeatures = [
    "Advanced creator discovery with ROI estimator",
    "Campaign deliverables approval workflow",
    "Automated payment scheduling",
    "Team access with role permissions",
  ];

  return (
    <section
      id="for-brands"
      className="relative select-none overflow-hidden py-16 text-white z-10 border-b border-slate-900"
      style={{
        background: "linear-gradient(135deg, #07080A 0%, #0B0C12 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column content (60%) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="font-sans font-bold text-[11px] text-white/70 uppercase tracking-[0.12em]">
            FOR BRANDS
          </span>

          <h2 className="text-3xl sm:text-[44px] font-extrabold font-sora leading-tight tracking-tight">
            Run creator campaigns <br />
            without the chaos.
          </h2>

          <p className="text-base sm:text-lg font-sans text-white/85 leading-relaxed max-w-xl">
            One dashboard to manage every creator relationship, track
            deliverables, approve content drafts, and release escrow payments —
            no more spreadsheets or lost email threads.
          </p>

          {/* Bullet Feature checks */}
          <ul className="space-y-3.5 pt-2 select-none text-sm font-semibold">
            {brandFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3.5 leading-none">
                <div className="w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5px] text-white" />
                </div>
                <span className="text-white/95">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-b from-brand to-brand-dark text-white font-bold text-[13px] tracking-wider uppercase rounded-xl overflow-hidden transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_rgba(108,99,255,0.5)] group-hover:shadow-[0_0_40px_rgba(108,99,255,0.7)] transition-shadow duration-500" />
              <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
              <span className="relative z-10">Start a Campaign →</span>
            </a>
          </div>
        </div>

        {/* Right Column visual illustration mockup (40% - Overhauled to dark premium UI) */}
        <div className="lg:col-span-5 flex justify-center relative select-none">
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [-20, -28, -20],
                  }
            }
            transition={{
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="w-full max-w-[420px] bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Browser Chrome Header */}
            <div className="h-8.5 bg-slate-950 border-b border-slate-900 flex items-center px-4 justify-between">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-[8px] font-semibold text-slate-500 tracking-wide leading-none">
                app.dealhive.io/brand/dashboard
              </span>
              <div className="w-8" />
            </div>

            {/* Campaign control vector UI inside card mockup */}
            <div className="bg-slate-950 p-4.5 min-h-[300px] flex flex-col justify-between text-left space-y-4 select-none leading-none">
              
              {/* Campaign header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-900 leading-none">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white font-sora leading-tight">Samsung Q2 Campaign</span>
                  <span className="text-[8px] text-slate-500 mt-1 font-medium">PR Coordinator: Michael Chang</span>
                </div>
              </div>

              {/* Stats card */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 shadow-sm leading-none">
                  <div className="w-6.5 h-6.5 rounded-full bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span data-type="number" className="font-mono text-[10px] font-bold text-white">$45,000</span>
                    <span className="text-[7.5px] text-slate-500 font-medium mt-0.5">Budget Spent</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 shadow-sm leading-none">
                  <div className="w-6.5 h-6.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span data-type="number" className="font-mono text-[10px] font-bold text-white">12</span>
                    <span className="text-[7.5px] text-slate-500 font-medium mt-0.5">Creators</span>
                  </div>
                </div>
              </div>

              {/* Approval queue vector item */}
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl shadow-sm space-y-2 select-none text-[8.5px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[7.5px]">Action Required</span>
                <div className="flex justify-between items-center leading-none">
                  <div className="flex items-center space-x-2 truncate">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60" alt="Sarah" className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-bold text-white truncate">Sarah Jenkins (Integration)</span>
                  </div>
                  <button className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-[8px] font-bold shadow-sm transition-all active:scale-95 flex-shrink-0 font-sans">
                    Approve Draft ✓
                  </button>
                </div>
              </div>

              {/* Spent velocity graph vector */}
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl shadow-sm space-y-2 select-none text-[8.5px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[7.5px]">Campaign ROI Velocity</span>
                  <TrendingUp className="w-3 h-3 text-brand" />
                </div>
                <div className="h-10 flex items-end justify-between px-1 bg-slate-950 border border-slate-900 rounded-lg pt-1">
                  <div className="w-4.5 bg-slate-900 rounded-t-sm h-4" />
                  <div className="w-4.5 bg-slate-900 rounded-t-sm h-6" />
                  <div className="w-4.5 bg-slate-900 rounded-t-sm h-5" />
                  <div className="w-4.5 bg-slate-900 rounded-t-sm h-8" />
                  <div className="w-4.5 bg-brand rounded-t-sm h-9" />
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
