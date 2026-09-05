"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-brand z-[9999] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
