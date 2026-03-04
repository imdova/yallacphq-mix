"use client";

import { motion } from "motion/react";
import { Users, BookOpen, Award, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "5,000+", label: "Students Enrolled" },
  { icon: BookOpen, value: "15+", label: "Expert-Led Courses" },
  { icon: Award, value: "94%", label: "Pass Rate" },
  { icon: Globe, value: "40+", label: "Countries" },
];

export function StatsSection() {
  return (
    <section className="border-y border-zinc-200/80 bg-zinc-50 py-12 md:py-16" aria-label="Statistics">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 text-sm font-medium text-zinc-600">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
