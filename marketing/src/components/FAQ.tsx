"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the dynamic 3D Deal Room operate?",
      answer:
        "Every sponsorship deal is assigned a secure, private, realtime digital Deal Room. Inside, creators and brand sponsors can chat directly, upload files, e-sign legal agreements, track checklists, and trigger payment escrow milestones without leaving the page.",
    },
    {
      question: "What is the live Supabase database sync fallback?",
      answer:
        "DealHive features an automatic environment sensor. If live Supabase credentials exist inside the project configuration, the system securely routes all deal pipelines, e-signs, and chats through actual cloud postgres databases. Otherwise, it fallbacks to a high-fidelity local browser simulator automatically.",
    },
    {
      question: "How is creator rate card benchmarking calculated?",
      answer:
        "We collect category niches, demographic indicators, and subscriber counts from active creators. Our algorithms analyze these datasets against tier benchmarks (Tech, Lifestyle, Gadgets) to suggest integration, dedicated, and shorts baseline pricing cards automatically.",
    },
    {
      question: "Can I manage team roles and departmental budget caps?",
      answer:
        "Yes! Under the brand's Team Management suite, campaign owners can provision PR coordinators, accountants, or editors with custom access permissions, customize department budgets, and review live security audits logs seamlessly.",
    },
    {
      question: "Is there a failsafe fallback if a logo fails to resolve?",
      answer:
        "Absolutely. If Clearbit or external branding domains fail to serve past partner logos, our reactive components trap the image error and instantly compile a high-end DealHive-themed violet initials fallback badge (e.g. SA for Samsung) to maintain visual polish.",
    },
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-16 bg-[#07080A] overflow-hidden select-none border-t border-slate-900">
      {/* Decorative background grid blur */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs font-semibold text-indigo-200 font-sora shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-slate-400 font-sans text-sm sm:text-base"
          >
            Everything you need to know about the sponsorships operating system.
          </motion.p>
        </div>

        {/* FAQ Accordion Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? "bg-slate-950 border-brand ring-2 ring-brand/5 shadow-[0_10px_30px_rgba(108,99,255,0.06)]"
                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                }`}
              >
                {/* Accordion Trigger header */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                >
                  <span className="text-[13.5px] sm:text-[14.5px] font-bold text-white font-sora leading-snug pr-4 select-none">
                    {faq.question}
                  </span>
                  
                  {/* Rotating Chevron indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "bg-brand text-white rotate-180" : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Accordion Expandable panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-[12.5px] sm:text-[13.5px] text-slate-300 leading-relaxed font-sans border-t border-slate-900">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Inline Support Callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 p-6 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white font-sora">Still have a question?</h4>
              <p className="text-[11.5px] text-slate-400 font-sans mt-0.5">{"We're here to help you get the most out of DealHive."}</p>
            </div>
          </div>
          <a
            href="/demo"
            className="px-5 py-2.5 text-[13px] font-bold text-slate-300 bg-white/[0.04] border border-white/[0.08] rounded-lg transition-all duration-300 ease-spring hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white hover:-translate-y-0.5 active:scale-[0.97] flex-shrink-0"
          >
            Get in touch
          </a>
        </motion.div>

      </div>
    </section>
  );
}
