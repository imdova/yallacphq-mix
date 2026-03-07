"use client";

import { motion } from "motion/react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The CPHQ Preparation course at Yalla was the defining factor in my career. The methodological rigor of the curriculum made complex statistics intuitive.",
    name: "Dr. Sarah Miller",
    role: "Healthcare Quality Director",
    credential: "CPHQ",
  },
  {
    quote:
      "Clear structure, expert instructors, and practice questions that mirror the real exam. I passed on my first attempt.",
    name: "Ahmed Hassan",
    role: "Quality Manager",
    credential: "CPHQ",
  },
  {
    quote:
      "Best investment in my professional development. The support and resources exceeded my expectations.",
    name: "Layla Al-Rashid",
    role: "Patient Safety Officer",
    credential: "CPHQ",
  },
];

export function TestimonialSection() {
  return (
    <section className="bg-zinc-50 py-16 md:py-24" aria-label="Testimonials">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Testimonials</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            What our <span className="font-serif text-gold">graduates</span> say
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <Quote className="h-8 w-8 text-gold/40" aria-hidden />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" aria-hidden />
                <div>
                  <p className="font-semibold text-zinc-900">
                    {t.name}, {t.credential}
                  </p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
