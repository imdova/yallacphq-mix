"use client";

import { motion } from "motion/react";
import { BookOpen, Lightbulb, Network } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Updated Curriculum",
    description:
      "Content aligned with the latest CPHQ exam blueprint and healthcare quality standards.",
  },
  {
    icon: Lightbulb,
    title: "Worked Learning",
    description: "Practical examples and case studies so you can apply concepts in real settings.",
  },
  {
    icon: Network,
    title: "Global Network",
    description:
      "Join a community of quality professionals and access ongoing support and resources.",
  },
];

const fadedText = "PROFESSIONAL LEARNING SAFE IMPACT";

export function ElevatingSection() {
  return (
    <section id="about" className="bg-black py-16 md:py-24" aria-labelledby="elevating-heading">
      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div
              className="absolute inset-0 select-none font-serif text-5xl font-bold uppercase leading-tight text-white/5 md:text-6xl lg:text-7xl"
              aria-hidden
            >
              {fadedText}
            </div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10 mt-8 inline-block rounded border border-gold/40 bg-gold/10 px-6 py-4"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gold">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 0010.5-4.065M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Global Standard CPHQ Certified
              </span>
            </motion.div>
          </div>
          <div>
            <h2
              id="elevating-heading"
              className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
            >
              Elevating Healthcare <span className="font-serif text-gold">Quality Leaders</span>
            </h2>
            <ul className="mt-10 space-y-8">
              {items.map((item, i) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold uppercase tracking-wide text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
