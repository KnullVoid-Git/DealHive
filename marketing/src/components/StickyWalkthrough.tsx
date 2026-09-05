"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Send, 
  FileText,
  Clock
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  desc: string;
  label: string;
}

const steps: Step[] = [
  {
    id: 0,
    label: "STEP 1: RECEIVE PITCHES",
    title: "Receive Structured Briefs",
    desc: "Brands discover your verified media kit and send structured campaign briefs directly into your inbox. No more cold DMs or back-and-forth email chaos.",
  },
  {
    id: 1,
    label: "STEP 2: NEGOTIATE TERMS",
    title: "Dedicated Deal Rooms",
    desc: "Agree on rates, lock in delivery timelines, and negotiate exclusivity premiums directly in a collaborative, focused room with complete term sheet logs.",
  },
  {
    id: 2,
    label: "STEP 3: SIGN CONTRACTS",
    title: "E-Sign Contracts in Seconds",
    desc: "DealHive automatically compiles your agreed term sheet variables into standard, legally binding PDF agreements. E-signed inside the Deal Room.",
  },
  {
    id: 3,
    label: "STEP 4: DELIVER & REVIEW",
    title: "Frictionless Draft Approvals",
    desc: "Upload draft deliverables directly for campaign compliance checking. Brands mark revisions or click approve inline without digging through email attachment chains.",
  },
  {
    id: 4,
    label: "STEP 5: GET PAID",
    title: "Automated Payments & Payouts",
    desc: "Invoices generate automatically upon draft approval. DealHive collects and clears payments via secure escrow, routing payouts to your bank via Stripe Connect.",
  },
];

export default function StickyWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // IntersectionObserver to detect active steps based on scrolling scroll slots
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -45% 0px", // Focus on viewport center
      threshold: 0.25,
    };

    const observers = steps.map((_, index) => {
      const el = document.getElementById(`walkthrough-step-${index}`);
      if (!el) return null;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        });
      }, observerOptions);

      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="bg-[#07080A] py-16 select-none relative z-10 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Headers */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="font-sans font-bold text-[11px] text-brand uppercase tracking-[0.12em]">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold text-white font-sora leading-tight tracking-tight">
            One platform. The whole deal.
          </h2>
          <p className="text-base sm:text-lg font-sans text-slate-400 leading-relaxed max-w-lg mx-auto">
            Every step from pitch to payment, without switching tabs or chasing threads.
          </p>
        </div>

        {/* Sticky scroll split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative pt-12">
          
          {/* Left Column - Scrolling Step Sections (40%) */}
          <div className="lg:col-span-5 flex flex-col">
            {steps.map((step, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={step.id}
                  id={`walkthrough-step-${idx}`}
                  className="min-h-[60vh] flex items-center py-12 first:pt-4 last:pb-12"
                >
                  <div
                    className={`pl-6 border-l-3 transition-all duration-300 ${
                      isActive ? "border-brand" : "border-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4 select-none">
                      {/* Step Number Badge */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                          isActive ? "bg-brand text-white" : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[9.5px] font-bold tracking-wider transition-colors ${
                          isActive ? "text-brand" : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    <h3
                      className={`text-lg sm:text-[22px] font-bold font-sora transition-colors duration-300 leading-tight ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`mt-3 text-xs sm:text-sm font-sans transition-colors duration-300 leading-relaxed ${
                        isActive ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Sticky Browser UI Screen Showcase (60%) */}
          <div className="hidden lg:block lg:col-span-7 sticky top-24 select-none">
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-md">
              
              {/* Browser Chrome Header */}
              <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>

                <div className="w-[300px] h-6 bg-slate-800 rounded-md border border-slate-700/50 flex items-center justify-center">
                  <span className="font-mono text-[9.5px] font-semibold text-slate-400/90 tracking-wide select-none leading-none">
                    app.dealhive.io/{steps[activeIndex].label.toLowerCase().split(": ")[1].replace(/\s+/g, "-")}
                  </span>
                </div>

                <div className="w-12" />
              </div>

              {/* Dynamic Vectors Screen Mockups inside browser frame */}
              <div className="bg-slate-950 p-6 min-h-[420px] relative flex flex-col justify-between select-none text-left leading-none font-sans">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex-1 flex flex-col space-y-4"
                  >
                    
                    {/* SCREEN 1: RECEIVE PITCHES (INBOX UI) */}
                    {activeIndex === 0 && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold font-sora text-white">Sponsorship Pitches Inbox</span>
                          <span className="px-2 py-0.5 bg-brand/10 text-brand text-[8px] font-bold rounded">3 Unread</span>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-start">
                          {/* Inbox Pitch left column list */}
                          <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md divide-y divide-slate-800/60">
                            <div className="p-2.5 bg-brand/10 border-l-2 border-brand flex items-center space-x-2">
                              <img src="https://logo.clearbit.com/samsung.com" alt="Samsung" className="w-5.5 h-5.5 rounded-full border border-slate-800 object-contain" />
                              <div className="flex flex-col truncate leading-tight">
                                <span className="text-[10px] font-bold text-white truncate">Samsung Global</span>
                                <span className="text-[8px] text-slate-500 truncate">Galaxy S26 Launch</span>
                              </div>
                            </div>
                            <div className="p-2.5 flex items-center space-x-2 opacity-40">
                              <img src="https://logo.clearbit.com/nordvpn.com" alt="NordVPN" className="w-5.5 h-5.5 rounded-full border border-slate-800 object-contain" />
                              <div className="flex flex-col truncate leading-tight">
                                <span className="text-[10px] font-bold text-white">NordVPN Protect</span>
                                <span className="text-[8px] text-slate-500">Cybersecurity Dedicated</span>
                              </div>
                            </div>
                          </div>

                          {/* Inbox Pitch right detail panel */}
                          <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md space-y-3">
                            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                              <img src="https://logo.clearbit.com/samsung.com" alt="Samsung" className="w-7 h-7 rounded-full border border-slate-800 object-contain" />
                              <div className="flex flex-col leading-tight">
                                <span className="text-[10.5px] font-bold text-white leading-tight">Samsung Mobile Group</span>
                                <span className="text-[8.5px] text-slate-500 mt-0.5">Campaign Proposal BRIEF</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[9.5px]">
                                <span className="text-slate-500 font-medium">Proposed Budget:</span>
                                <span className="font-mono font-bold text-emerald-400">$4,200 (Integration)</span>
                              </div>
                              <div className="p-2 bg-slate-950 border border-slate-800/80 rounded-md text-[8.5px] text-slate-400 leading-relaxed font-sans">
                                {"\"We want to sponsor a 60-second video integration introducing the Galaxy S26 Ultra's new AI camera capabilities.\""}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-1 text-[8.5px] font-bold">
                              <button className="flex-1 py-1.5 border border-white/[0.08] text-slate-400 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-all text-center">
                                Counter Offer
                              </button>
                              <button className="flex-1 py-1.5 bg-gradient-to-b from-brand to-brand-dark text-white rounded shadow-[0_0_12px_rgba(108,99,255,0.35)] transition-all text-center">
                                Accept Pitch Brief
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCREEN 2: NEGOTIATE TERMS (DEAL ROOM CHAT & TERM SHEET) */}
                    {activeIndex === 1 && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold font-sora text-white">Samsung × Sarah Jenkins · Deal Room</span>
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-bold rounded">Negotiating</span>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-start">
                          {/* Messages thread left (7/12) */}
                          <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-3 flex flex-col min-h-[220px] justify-between">
                            <div className="space-y-2.5 overflow-y-auto max-h-[160px] no-scrollbar">
                              <div className="flex items-start space-x-2 text-[9px] leading-relaxed">
                                <img src="https://logo.clearbit.com/samsung.com" alt="Samsung" className="w-5 h-5 rounded-full object-contain border border-slate-800" />
                                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2 max-w-[80%] text-slate-300">
                                  Hey Sarah! Our team loved your pitch. What integration rates works best for your schedule?
                                </div>
                              </div>
                              <div className="flex items-start space-x-2 text-[9px] leading-relaxed justify-end">
                                <div className="bg-brand/10 border border-brand/10 rounded-xl p-2 max-w-[80%] text-indigo-300 font-medium">
                                  Hi Samsung! I propose $4,200 which includes the integration plus custom YouTube Shorts cross-posts cuts.
                                </div>
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="Sarah" className="w-5 h-5 rounded-full object-cover border border-slate-800" />
                              </div>
                            </div>

                            {/* Chat input block */}
                            <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/60 text-[8px]">
                              <input type="text" placeholder="Type deal room reply..." className="flex-1 h-7 bg-slate-950 border border-slate-800 text-white rounded px-2 outline-none focus:border-brand" disabled />
                              <button className="w-7 h-7 bg-brand hover:bg-brand-dark text-white flex items-center justify-center rounded shadow-sm flex-shrink-0">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Term sheet right (5/12) */}
                          <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2 text-[9px]">
                            <span className="font-bold text-white block border-b border-slate-800 pb-1.5 font-sora">Campaign Term Sheet</span>
                            
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Deal Type:</span>
                                <span className="font-bold text-slate-200">Integration</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Agreed Rate:</span>
                                <span className="font-mono font-bold text-indigo-400">$4,200</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Timeline:</span>
                                <span className="font-bold text-slate-200">Net 30</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Exclusivity:</span>
                                <span className="font-bold text-amber-400">15 Days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCREEN 3: SIGN CONTRACTS (PDF VIEW) */}
                    {activeIndex === 2 && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold font-sora text-white">Escrow Sponsorship Agreement</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">Fully Signed</span>
                        </div>

                        {/* Contract PDF Paper Illustration */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md min-h-[220px] flex flex-col justify-between">
                          <div className="space-y-3.5 select-none text-left">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-5.5 h-5.5 text-brand" />
                              <div className="flex flex-col leading-tight">
                                <span className="text-[11px] font-bold text-white">Sponsorship_Agreement_Samsung_Sarah.pdf</span>
                                <span className="text-[8.5px] text-slate-500 mt-0.5">Escrow-backed platform agreement</span>
                              </div>
                            </div>

                            {/* Lines of mock legal paragraphs */}
                            <div className="space-y-1.5 py-1">
                              <div className="h-1.5 bg-slate-950 rounded-full w-full" />
                              <div className="h-1.5 bg-slate-950 rounded-full w-[90%]" />
                              <div className="h-1.5 bg-slate-950 rounded-full w-[80%]" />
                              <div className="h-1.5 bg-slate-950 rounded-full w-[95%]" />
                            </div>
                          </div>

                          {/* Signatures ledger footer */}
                          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3 select-none text-[8.5px]">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-4.5 h-4.5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[2px]" />
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-white">Sarah Jenkins</span>
                                <span className="text-[7.5px] text-slate-500 mt-0.5">Signed · May 31, 2026</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 border-l border-slate-800/80 pl-3">
                              <div className="w-4.5 h-4.5 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[2px]" />
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-white">Samsung Ltd</span>
                                <span className="text-[7.5px] text-slate-500 mt-0.5">Signed · May 31, 2026</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SCREEN 4: DELIVER & GET APPROVED (MILESTONES & DISCUSSIONS) */}
                    {activeIndex === 3 && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold font-sora text-white">Deliverables Review Pipeline</span>
                          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold rounded">1 Pending Approval</span>
                        </div>

                        {/* Deliverables rows lists */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md space-y-4">
                          
                          {/* Row 1: Script */}
                          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 select-none text-[9.5px]">
                            <div className="flex items-center space-x-2">
                              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 stroke-[2.5px]" />
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-white">Milestone 1: Video Script Outline</span>
                                <span className="text-[8px] text-slate-500 mt-0.5 font-medium font-mono">Approved · Round 1</span>
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Video Draft (active review) */}
                          <div className="space-y-3 text-[9.5px]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-4.5 h-4.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                  <Clock className="w-3 h-3 stroke-[2px]" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                  <span className="font-bold text-white">Milestone 2: Video Integration Draft</span>
                                  <span className="text-[8px] text-purple-400 mt-0.5 font-semibold font-mono">Under Review · Round 2</span>
                                </div>
                              </div>
                            </div>

                            {/* Embedded File and comment box */}
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl grid grid-cols-12 gap-3 items-center">
                              <div className="col-span-5 bg-slate-900/60 h-14 rounded-lg flex items-center justify-center text-[8px] text-white/50 border border-slate-800 relative overflow-hidden select-none font-bold">
                                📹 video_draft_r2.mp4
                              </div>
                              <div className="col-span-7 flex flex-col leading-tight font-sans">
                                <span className="text-[8px] font-bold text-slate-500">BRAND MANAGER FEEDBACK:</span>
                                <span className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                                  {"\"The camera hook looks super sharp! Can you just adjust the script to mention the Nightography feature specifically?\""}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* SCREEN 5: GET PAID (FINANCIAL LEDGER) */}
                    {activeIndex === 4 && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold font-sora text-white">Escrow Payments Ledger</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded flex items-center space-x-0.5">
                            <span>●</span> <span>Stripe Online</span>
                          </span>
                        </div>

                        {/* Financial Ledger grid */}
                        <div className="grid grid-cols-12 gap-3 pt-1 select-none text-left leading-none font-sans">
                          {/* Paid card */}
                          <div className="col-span-6 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md leading-none flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 stroke-[2.5px]" />
                            </div>
                            <div className="flex flex-col">
                              <span data-type="number" className="font-mono text-[10.5px] font-bold text-white">$11,700</span>
                              <span className="text-[8.5px] text-slate-500 font-medium mt-1">Paid this month</span>
                            </div>
                          </div>

                          {/* Outstanding card */}
                          <div className="col-span-6 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md leading-none flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span data-type="number" className="font-mono text-[10.5px] font-bold text-white">$4,200</span>
                              <span className="text-[8.5px] text-slate-500 font-medium mt-1">Pending Invoice</span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Invoice Rows */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-3 select-none text-[9.5px]">
                          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px]">Ledger Invoices Logs</span>
                          
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                            <div className="flex items-center space-x-2">
                              <img src="https://logo.clearbit.com/samsung.com" alt="Samsung" className="w-4.5 h-4.5 rounded-full object-contain" />
                              <span className="font-bold text-white">Samsung Ltd (#INV-042)</span>
                            </div>
                            <span data-type="number" className="font-mono font-bold text-emerald-400">$4,200 PAID</span>
                          </div>

                          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 opacity-60">
                            <div className="flex items-center space-x-2">
                              <img src="https://logo.clearbit.com/nordvpn.com" alt="NordVPN" className="w-4.5 h-4.5 rounded-full object-contain" />
                              <span className="font-bold text-white">NordVPN (#INV-041)</span>
                            </div>
                            <span data-type="number" className="font-mono font-bold text-emerald-400">$7,500 PAID</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
