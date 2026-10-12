"use client";

import { motion } from "motion/react";
import { BarChart3, Briefcase, Code2, FlaskConical, Megaphone, Users, type LucideIcon } from "lucide-react";

// HIP's hero uses portrait tiles: an orange gradient band over a light grey field. Without
// licensed photography, these tiles carry kinds of experience instead of faces.
const TILES: { icon: LucideIcon; label: string }[] = [
  { icon: Briefcase, label: "Operations" },
  { icon: BarChart3, label: "Finance" },
  { icon: Code2, label: "Engineering" },
  { icon: FlaskConical, label: "Research" },
  { icon: Users, label: "People" },
  { icon: Megaphone, label: "Communications" },
];

export function HeroTiles() {
  return (
    <motion.ul
      aria-label="Kinds of experience that transfer to high-impact work"
      className="grid grid-cols-3 gap-3 xl:gap-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
    >
      {TILES.map(({ icon: Icon, label }) => (
        <motion.li
          key={label}
          variants={{
            hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
          }}
          whileHover={{ y: -4 }}
          className="relative aspect-square overflow-hidden rounded-[2px] bg-tile-grey shadow-[var(--shadow-lifted)]"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-[38%] bg-accent-gradient" />
          <span className="relative flex h-full flex-col items-center justify-end gap-2 p-3 pb-4 text-brand-primary-deep">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-background shadow-[var(--shadow-soft)] xl:h-16 xl:w-16">
              <Icon size={26} strokeWidth={1.75} absoluteStrokeWidth aria-hidden />
            </span>
            <span className="font-display text-sm font-bold xl:text-[0.9375rem]">{label}</span>
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
