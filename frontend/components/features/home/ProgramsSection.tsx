"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const programs = [
  {
    id: "cphq",
    title: "CPHQ Preparation",
    description:
      "Comprehensive preparation for the CPHQ certification exam with practice questions and study materials.",
    price: "$499",
    icon: BookOpen,
    iconBg: "bg-white ring-2 ring-emerald-500/50",
    iconLabel: "CPHQ",
  },
  {
    id: "tools",
    title: "Quality Tools",
    description:
      "Master essential quality improvement tools and techniques used in healthcare settings.",
    price: "$349",
    icon: Wrench,
    iconBg: "bg-teal",
    iconLabel: null,
  },
  {
    id: "improvement",
    title: "Quality Improvement",
    description: "Learn to design, implement, and sustain quality improvement initiatives.",
    price: "$449",
    icon: TrendingUp,
    iconBg: "bg-zinc-800",
    iconLabel: null,
  },
];

export function ProgramsSection() {
  return (
    <section id="programs" className="bg-white py-16 md:py-24" aria-labelledby="programs-heading">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <h2 id="programs-heading" className="text-3xl font-semibold tracking-tight md:text-4xl">
              Top Professional <span className="font-serif text-gold">Programs</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-zinc-500 lg:max-w-sm">
            Industry-aligned programs to advance your career in healthcare quality.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="h-full border-zinc-200 transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="relative mb-4 inline-flex">
                    <span
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full text-white",
                        program.iconBg
                      )}
                    >
                      <program.icon className="h-6 w-6" />
                    </span>
                    {program.iconLabel && (
                      <span className="absolute -right-1 -top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gold-foreground">
                        {program.iconLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900">{program.title}</h3>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-zinc-500">{program.description}</p>
                  <p className="text-xl font-semibold text-zinc-900">{program.price}</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="#catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline"
          >
            Browse All Catalog
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
