"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Zap, DollarSign, BarChart2 } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.0, 0.0, 0.2, 1],
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: { shouldReduceMotion: boolean; idx: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.0, 0.0, 0.2, 1],
      delay: custom.shouldReduceMotion ? 0 : custom.idx * 0.08,
    },
  }),
};

export default function Problem() {
  const shouldReduceMotion = useReducedMotion();

  const painPoints = [
    {
      icon: <Zap className="w-5 h-5 text-brand" />,
      title: "Deals lost in email scattered loops",
      desc: "Negotiations scattered across 4 different apps. Missing feedback loops, files, and no single source of truth.",
    },
    {
      icon: <DollarSign className="w-5 h-5 text-brand" />,
      title: "Payments that ghost you after drafts",
      desc: "Brands disappear after draft delivery. No legal escrow leverage, no contract transparency, weeks chasing outstanding invoices.",
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-brand" />,
      title: "No idea what rates benchmark to charge",
      desc: "You're leaving money on the table with every campaign you accept, unaware of category niche rates benchmarks.",
    },
  ];

  return (
    <section id="features" className="bg-[#0B0C12] py-16 select-none relative z-10 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
        
        {/* Title and Subtitle block */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="space-y-4 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-[44px] font-extrabold text-white font-sora leading-[1.15] tracking-tight">
            The average creator loses <span className="text-brand">6 hours</span> managing every brand deal.
          </h2>
          <p className="text-base sm:text-lg font-sans text-slate-400 leading-relaxed max-w-xl mx-auto">
            Email threads, PDF contracts, Google Drive folders, PayPal invoices.
            There has to be a better way.
          </p>
        </motion.div>

        {/* 3-column Pain Points Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {painPoints.map((item, idx) => (
            <motion.div
              key={idx}
              custom={{ shouldReduceMotion, idx }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="bg-slate-950 border border-slate-900 rounded-2xl p-8 text-left shadow-sm hover:shadow-brand/5 hover:border-brand/35 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Circle Icon wrapper */}
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20 flex-shrink-0">
                  {item.icon}
                </div>

                <div className="space-y-2 leading-none">
                  <h3 className="text-sm font-bold text-white font-sora leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
