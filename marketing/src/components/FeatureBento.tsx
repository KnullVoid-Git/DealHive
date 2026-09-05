"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { MessageSquare, BarChart2, FileCheck, Search, CreditCard, Users, TrendingUp } from "lucide-react";

export default function FeatureBento() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.0, 0.0, 0.2, 1],
        delay: shouldReduceMotion ? 0 : custom * 0.06,
      },
    }),
  };

  return (
    <section id="features-grid" className="bg-[#08090D] py-16 select-none text-white relative z-10 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Headers */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="font-sans font-bold text-[11px] text-white/40 uppercase tracking-[0.12em]">
            EVERYTHING IN ONE PLACE
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold font-sora leading-tight tracking-tight">
            Built specifically for creator brand deals.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-6">
          
          {/* Bento 1: Real-time Deal Room (LARGE - 2/3 width on desktop) */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="lg:col-span-2 bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Real-time Deal Room</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Every deal gets a dedicated workspace. Negotiate terms, share assets, e-sign contracts, and check off milestone deliverables in one clear room.
              </p>
            </div>

            {/* Visual Vector illustration */}
            <div className="mt-8 bg-black/25 border border-white/[0.06] rounded-2xl p-4.5 space-y-3 max-w-md shadow-inner select-none text-[9px] font-sans">
              <div className="flex items-center space-x-2 border-b border-white/[0.04] pb-2">
                <div className="w-2 h-2 rounded-full bg-brand" />
                <span className="font-bold text-white/90">S26 Brand Campaign Deal Room</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4.5 h-4.5 bg-brand-light text-brand rounded-full flex items-center justify-center text-[9px] font-bold">S</div>
                <div className="bg-white/5 border border-white/[0.04] rounded-lg p-2 text-white/70 max-w-[85%] leading-normal">
                  {"\"Draft approved! I've triggered invoice compilation presets.\""}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento 2: Rate Benchmarking (SMALL - 1/3 width) */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Know Your Worth</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Access dynamic rate benchmarking datasets. Compare your offers instantly against industry averages for your tier and niche.
              </p>
            </div>

            {/* Visual Mini Chart vector illustration */}
            <div className="mt-8 bg-black/25 border border-white/[0.06] rounded-2xl p-4.5 shadow-inner flex flex-col space-y-2 select-none text-[8.5px]">
              <div className="flex justify-between items-center text-white/75">
                <span>Niche average pricing (Tech)</span>
                <span className="font-mono text-brand font-bold">$4,500</span>
              </div>
              
              <div className="space-y-2 pt-1 font-mono leading-none">
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-white/40">Your Rate</span>
                  <div className="flex-1 h-3.5 bg-brand/30 border border-brand/50 rounded-sm relative flex items-center pl-1.5 font-bold text-white text-[8px] max-w-[80%]">
                    $3,500
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-12 text-white/40">Median</span>
                  <div className="flex-1 h-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm relative flex items-center pl-1.5 font-bold text-emerald-400 text-[8px]">
                    $4,500
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento 3: E-Signature (SMALL - 1/3 width) */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Instant Contracts</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Auto-generate professional, legally binding PDF agreements directly from agreed terms in one click. E-signed within minutes.
              </p>
            </div>
            
            <div className="h-6" />
          </motion.div>

          {/* Bento 4: Brand Directory (LARGE - 2/3 width) */}
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="lg:col-span-2 bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Brands Come to You</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Your public media kit is discoverable in the advanced creator directory. Verified YouTube metrics automatically sync so brand campaigns managers invite you.
              </p>
            </div>

            {/* Visual Vector Creator Cards Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3.5 max-w-md select-none text-[8.5px]">
              <div className="bg-black/25 border border-white/[0.06] rounded-xl p-3 shadow-sm flex items-center space-x-2.5">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60" alt="avatar" className="w-7.5 h-7.5 rounded-full object-cover border border-white/10" />
                <div className="flex flex-col truncate leading-tight">
                  <span className="font-bold text-white/95 truncate">Sarah Jenkins</span>
                  <span className="text-[7.5px] text-white/40 mt-0.5 truncate">Tech & Lifestyle</span>
                </div>
              </div>
              
              <div className="bg-black/25 border border-white/[0.06] rounded-xl p-3 shadow-sm flex items-center space-x-2.5">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60" alt="avatar" className="w-7.5 h-7.5 rounded-full object-cover border border-white/10" />
                <div className="flex flex-col truncate leading-tight">
                  <span className="font-bold text-white/95 truncate">Marcus Chen</span>
                  <span className="text-[7.5px] text-white/40 mt-0.5 truncate">Gadgets & Tech</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento 5: Stripe Payments */}
          <motion.div
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Guaranteed Payouts</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Secure escrow payouts protect every deal. Invoices are auto-sent and outstanding balances cleared directly into your bank via Stripe Connect.
              </p>
            </div>
            
            <div className="h-6" />
          </motion.div>

          {/* Bento 6: Team Access */}
          <motion.div
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Built for Teams</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Invite your manager, virtual assistant (VA), or accountant with scoped, role-based permission settings ensuring database security.
              </p>
            </div>
            
            <div className="h-6" />
          </motion.div>

          {/* Bento 7: Deal Analytics */}
          <motion.div
            custom={6}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="bg-white/[0.04] border border-white/[0.08] hover:bg-brand/[0.12] hover:border-brand/30 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-sora">Track Everything</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Orchestrate deals via financial forecasting models, real-time pipelines velocity, and revenue reporting dashboards.
              </p>
            </div>
            
            <div className="h-6" />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
