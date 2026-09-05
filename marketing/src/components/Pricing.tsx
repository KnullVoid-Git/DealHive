"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Starter",
      description: "Perfect for emerging creators starting to secure their first sponsorships.",
      priceMonthly: 0,
      priceYearly: 0,
      limits: "Free Forever",
      features: [
        "1 active brand deal workspace",
        "Standard e-sign contracts ledger",
        "Direct Inbox chat pitches",
        "Stripe Payouts integration",
        "1.5% instant payout clearing fee",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/signup?plan=free",
      popular: false,
    },
    {
      name: "Creator Pro",
      description: "For active full-time creators running multiple concurrent sponsor campaigns.",
      priceMonthly: 29,
      priceYearly: 23,
      limits: "Recommended",
      features: [
        "Unlimited active brand deals",
        "AI Niche Rate Benchmarking insights",
        "Public Discoverable Media Kit subdomain",
        "Department VA/Accountant access",
        "Zapier & Developer API integrations",
        "0% instant payout clearing fee",
      ],
      ctaText: "Go Pro Now",
      ctaHref: "/signup?plan=pro",
      popular: true,
    },
    {
      name: "Business",
      description: "For elite multi-channel creators and PR management agencies.",
      priceMonthly: 89,
      priceYearly: 71,
      limits: "Enterprise Ready",
      features: [
        "Everything in Creator Pro",
        "Multi-channel stats dashboard",
        "Low-light LOW compliance scripts briefs",
        "Bulk invoice exports (1099 logs)",
        "Priority 24/7 dedicated support",
        "Dedicated onboarding PR manager",
      ],
      ctaText: "Scale Your Business",
      ctaHref: "/signup?plan=business",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-16 bg-[#07080A] overflow-hidden select-none border-t border-slate-900">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header section */}
        <div className="text-center max-w-[650px] mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs font-semibold text-indigo-200 font-sora shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-extrabold text-white font-sora leading-tight tracking-tight text-balance"
          >
            A plan designed to grow with your channel.
          </motion.h2>

          {/* Billing Switcher */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-white" : "text-slate-500"}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setBillingPeriod(prev => prev === "monthly" ? "yearly" : "monthly")}
              className="relative w-12 h-6 bg-slate-900 border border-slate-800 rounded-full p-1 transition-colors duration-300"
            >
              <div
                className={`w-4 h-4 bg-brand rounded-full transition-transform duration-300 ${
                  billingPeriod === "yearly" ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center ${billingPeriod === "yearly" ? "text-white" : "text-slate-500"}`}>
              <span>Yearly billing</span>
              <span className="ml-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const price = billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between p-8 rounded-2xl bg-slate-950 border shadow-sm transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-brand ring-2 ring-brand/10 md:-translate-y-4 scale-[1.02] shadow-[0_15px_40px_rgba(108,99,255,0.15)]"
                    : "border-slate-900"
                }`}
              >
                {/* Popular Glow Ring / Accent Badging */}
                {plan.popular && (
                  <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand text-white font-sora font-extrabold text-[10px] tracking-wider uppercase rounded-full shadow-md flex items-center space-x-1 shadow-brand/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold font-sora text-white">{plan.name}</h3>
                    {plan.limits && (
                      <span className="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded font-sans uppercase">
                        {plan.limits}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-400 font-sans text-xs min-h-[36px] leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Pricing terms details */}
                  <div className="flex items-baseline mb-6 leading-none select-none">
                    <span className="text-white font-sora text-4xl font-extrabold tracking-tight">
                      $
                    </span>
                    <span data-type="number" className="font-mono text-5xl font-black text-white tracking-tighter">
                      {price}
                    </span>
                    <span className="text-slate-400 font-sans text-xs font-semibold ml-2">
                      / month
                    </span>
                  </div>

                  {/* Features List Checklist */}
                  <div className="border-t border-slate-900 pt-6 space-y-4 mb-8">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {"What's Included"}
                    </span>
                    <ul className="space-y-3.5">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-2.5">
                          <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                          <span className="text-[12.5px] font-medium text-slate-300 font-sans leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Primary/Secondary Action Button */}
                <div className="mt-auto">
                  {plan.popular ? (
                    <a
                      href={plan.ctaHref}
                      className="group relative block w-full py-3.5 px-6 rounded-xl font-bold font-sans text-[13px] tracking-wider uppercase text-center overflow-hidden bg-gradient-to-b from-brand to-brand-dark text-white transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_rgba(108,99,255,0.5)] group-hover:shadow-[0_0_40px_rgba(108,99,255,0.7)] transition-shadow duration-500" />
                      <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
                      <span className="relative z-10">{plan.ctaText}</span>
                    </a>
                  ) : (
                    <a
                      href={plan.ctaHref}
                      className="block w-full py-3.5 px-6 rounded-xl font-bold font-sans text-[13px] tracking-wider uppercase text-center text-slate-300 bg-white/[0.04] border border-white/[0.08] transition-all duration-300 ease-spring hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      {plan.ctaText}
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
