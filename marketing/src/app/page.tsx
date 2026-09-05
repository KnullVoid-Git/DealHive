"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SocialProof from "../components/SocialProof";
import Problem from "../components/Problem";
import StickyWalkthrough from "../components/StickyWalkthrough";
import FeatureBento from "../components/FeatureBento";
import ForBrands from "../components/ForBrands";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#07080A] text-white antialiased selection:bg-brand/10 selection:text-brand select-none">
      {/* Sticky Global Navigation */}
      <Navbar />

      {/* Hero Visual Showcase */}
      <Hero />

      {/* Social Proof Marquee */}
      <SocialProof />

      {/* Problem & Pain Statement Card Deck */}
      <Problem />

      {/* Step-by-Step Interactive Workflow Walkthrough */}
      <StickyWalkthrough />

      {/* Feature Bento Grid System */}
      <FeatureBento />

      {/* High-Contrast Section Targeting Brand Sponsors */}
      <ForBrands />

      {/* Grid of Creators Testimonials */}
      <Testimonials />

      {/* Interactive Pricing Tier Panels */}
      <Pricing />

      {/* FAQ Dropdown Accordions Grid */}
      <FAQ />

      {/* Deep Dark Centered Final Call to Action */}
      <FinalCTA />

      {/* Multi-Column Global Footer */}
      <Footer />
    </div>
  );
}
