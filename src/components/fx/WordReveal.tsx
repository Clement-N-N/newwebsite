"use client";

import { motion } from "motion/react";
import type { ElementType } from "react";

/**
 * Display headline that reads in word by word: 80ms apart, each with opacity, 4px blur and a
 * 12px rise. Screen readers get the sentence once, not word fragments.
 */
export function WordReveal({
  text,
  as = "h1",
  className = "",
  delay = 0,
  highlight = [],
  id,
  tabIndex,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Words (exact match, punctuation included) to paint in the accent colour. */
  highlight?: string[];
  id?: string;
  tabIndex?: number;
}) {
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className} id={id} tabIndex={tabIndex} data-slide-heading={tabIndex === -1 ? "" : undefined}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`}>
            <motion.span
              className={`inline-block ${highlight.includes(w) ? "text-brand-accent" : ""}`}
              variants={{
                hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
              }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
