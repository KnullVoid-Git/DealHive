"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Star } from "lucide-react";

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

export default function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  const testimonials = [
    {
      quote:
        "DealHive cut my admin overhead in half. I can approve drafts, propose contract revisions, and receive bank transfers instantly.",
      name: "Marcus Chen",
      channel: "280K subscribers",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    },
    {
      quote:
        "The AI Niche Rate guidelines helped me realize I was charging 30% below industry standards. Secured my next deal at my full value.",
      name: "Sarah Jenkins",
      channel: "514K subscribers",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    {
      quote:
        "Finally, brands can't ghost me after delivery. The contract + escrow combo is a complete game changer.",
      name: "Priya Nair",
      channel: "95K subscribers",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    },
  ];

  return (
    <section className="bg-[#07080A] py-16 select-none relative z-10 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
        
        {/* Header */}
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight leading-tight">
            Creators love DealHive
          </h2>
        </div>

        {/* Staggered Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              custom={{ shouldReduceMotion, idx }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="bg-slate-950 border border-slate-900 rounded-2xl p-7 relative shadow-sm hover:shadow-brand/5 hover:border-brand/30 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden"
            >
              {/* Background Quote Mark */}
              <span className="absolute -top-3 -left-1 text-[72px] font-extrabold font-sora text-brand/10 leading-none select-none opacity-60 z-0">
                “
              </span>

              <div className="relative z-10 space-y-6">
                {/* Quote Text */}
                <p className="text-xs sm:text-sm font-sans italic text-slate-300 leading-relaxed font-normal">
                  {"\""}{item.quote}{"\""}
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 select-none leading-none">
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-900 flex-shrink-0"
                    />
                    <div className="flex flex-col leading-tight truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 truncate">
                        {item.channel}
                      </span>
                    </div>
                  </div>

                  {/* 5 Gold Stars */}
                  <div className="flex items-center space-x-0.5 text-amber-400 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
