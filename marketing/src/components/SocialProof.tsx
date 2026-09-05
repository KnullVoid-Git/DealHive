"use client";

import React from "react";

export default function SocialProof() {
  const marqueeItems = [
    { name: "Sarah Jenkins", detail: "514K subs", highlighted: true },
    { name: "Samsung", detail: "Enterprise Partner", highlighted: false },
    { name: "Marques K.", detail: "16M subs", highlighted: true },
    { name: "Lumen Health", detail: "Brand Partner", highlighted: false },
    { name: "Emma Chamberlain", detail: "12M subs", highlighted: true },
    { name: "Adobe", detail: "Enterprise Partner", highlighted: false },
    { name: "Marcus Chen", detail: "280K subs", highlighted: true },
    { name: "NordVPN", detail: "Brand Partner", highlighted: false },
    { name: "Priya Nair", detail: "95K subs", highlighted: true },
  ];

  // Duplicate list to achieve seamless infinite looping scroll
  const itemsList = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section className="bg-[#07080A] py-8 overflow-hidden select-none relative z-10">
      
      {/* Label above marquee */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-5">
        <h4 className="font-sans font-normal text-[11px] text-white/35 uppercase tracking-[0.12em]">
          Trusted by creators and brands worldwide
        </h4>
      </div>

      {/* Infinite scrolling marquee wrapper */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        
        {/* Left Mask Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07080A] to-transparent z-20 pointer-events-none" />
        
        {/* Right Mask Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07080A] to-transparent z-20 pointer-events-none" />

        {/* Scrolling Inner Container */}
        <div className="flex w-max gap-12 py-1 select-none animate-marquee hover:[animation-play-state:paused]">
          {itemsList.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4 flex-shrink-0 text-sm font-medium">
              {/* Hexagon Separator */}
              <div
                className="w-3.5 h-3.5 bg-brand flex items-center justify-center flex-shrink-0"
                style={{
                  clipPath:
                    "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                }}
              />
              
              <div className="flex items-baseline space-x-1.5 leading-none">
                <span className={item.highlighted ? "text-white font-bold" : "text-white/50 font-medium"}>
                  {item.name}
                </span>
                <span className="text-white/30 text-xs font-normal">·</span>
                <span className="text-white/40 text-xs font-normal">
                  {item.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
