"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "For Brands", href: "#for-brands" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
          scrolled
            ? "bg-slate-950/80 border-b border-slate-900/60 backdrop-blur-md py-4 shadow-lg shadow-black/20"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2.5 group">
            <div
              className="w-7.5 h-7.5 bg-brand flex items-center justify-center flex-shrink-0"
              style={{
                clipPath:
                  "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
              }}
            >
              <div
                className="w-5.5 h-5.5 bg-slate-950 transition-colors group-hover:bg-brand-dark/20"
                style={{
                  clipPath:
                    "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                }}
              />
            </div>
            <span className="text-lg font-bold text-white font-sora tracking-tight leading-none">
              DealHive
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-brand transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4 text-[13px] font-bold leading-none select-none">
            <a
              href="/login"
              className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors duration-300"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-5 py-3 bg-gradient-to-b from-brand to-brand-dark text-white rounded-xl overflow-hidden transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.4)] group-hover:shadow-[0_0_32px_rgba(108,99,255,0.6)] transition-shadow duration-500" />
              <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
              <span className="relative z-10">Get Started Free</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-white hover:text-brand transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 stroke-[1.5px]" />
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay Menu (Overhauled to Dark Theme) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-slate-950/95 z-[999] md:hidden flex flex-col justify-between p-6 select-none backdrop-blur-lg"
          >
            {/* Header row in mobile overlay */}
            <div className="flex items-center justify-between py-2">
              <a href="#" className="flex items-center space-x-2.5">
                <div
                  className="w-7.5 h-7.5 bg-brand flex items-center justify-center flex-shrink-0"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                  }}
                >
                  <div
                    className="w-5.5 h-5.5 bg-slate-950"
                    style={{
                      clipPath:
                        "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                    }}
                  />
                </div>
                <span className="text-lg font-bold text-white font-sora tracking-tight leading-none">
                  DealHive
                </span>
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white hover:text-brand transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 stroke-[1.5px]" />
              </button>
            </div>

            {/* Staggered mobile nav links */}
            <div className="flex flex-col space-y-6 text-xl font-bold font-sora text-slate-200 py-12">
              {navLinks.map((link, idx) => (
                <motion.a
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-brand transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* Mobile CTAs */}
            <div className="flex flex-col space-y-4 pt-6 border-t border-slate-900">
              <a
                href="/login"
                className="w-full py-4 text-center font-bold text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Log In
              </a>
              <a
                href="/signup"
                className="group relative w-full py-4 bg-gradient-to-b from-brand to-brand-dark text-white rounded-xl text-center font-bold text-sm overflow-hidden transition-all duration-300 ease-spring active:scale-[0.97]"
              >
                <span className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-shadow duration-500" />
                <span className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
                <span className="relative z-10">Get Started Free</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
