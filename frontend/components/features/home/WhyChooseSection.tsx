"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, Lightbulb, Users, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  {
    icon: BookOpen,
    title: "Updated curriculum",
    description:
      "Content aligned with the latest CPHQ exam blueprint and healthcare quality standards.",
  },
  {
    icon: Lightbulb,
    title: "Work-based learning",
    description: "Practical examples and case studies so you can apply concepts in real settings.",
  },
  {
    icon: Users,
    title: "Global network",
    description:
      "Join a community of quality professionals and access ongoing support and resources.",
  },
  {
    icon: FileCheck,
    title: "Certification ready",
    description:
      "Structured paths to CPHQ and micro-credentials with CME credits where applicable.",
  },
];

export function WhyChooseSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-zinc-900 py-16 md:py-24"
      aria-labelledby="why-choose-heading"
    >
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Why Yalla CPHQ
          </p>
          <h2
            id="why-choose-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            Built for <span className="font-serif text-gold">Healthcare Leaders</span>
          </h2>
          <p className="mt-4 text-zinc-400">
            Industry-aligned programs to advance your career in healthcare quality.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-zinc-700/50 bg-zinc-800/50 p-6 transition hover:border-gold/30 hover:bg-zinc-800/80"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>
            </motion.article>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-gold/50 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
          >
            <Link href="/courses" className="inline-flex items-center gap-2">
              Explore programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
