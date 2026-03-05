"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "Exam Prep", label: "Exam Prep" },
  { id: "Quality Management", label: "Quality Management" },
  { id: "Patient Safety", label: "Patient Safety" },
  { id: "Free Resources", label: "Free Resources" },
];

export function CoursesHero({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categoryOptions = FALLBACK_CATEGORIES,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (id: string) => void;
  /** Dynamic categories from admin (first item should be "All Resources" with id "all"). */
  categoryOptions?: { id: string; label: string }[];
}) {
  return (
    <section
      className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black py-8 sm:py-12 md:py-14"
      aria-labelledby="courses-hero-title"
    >
      <div className="container max-w-4xl space-y-6 px-4 md:px-6">
        <div>
          <h1
            id="courses-hero-title"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            Professional Healthcare Excellence
          </h1>
          <p className="mt-2 text-zinc-300 sm:text-lg">
            Master the CPHQ exam with world-class resources and guidance.
          </p>
        </div>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search courses, topics, or instructors..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 rounded-xl border-zinc-600 bg-zinc-800/80 pl-11 text-base text-white placeholder:text-zinc-500 shadow-sm transition focus:border-gold focus:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Search courses"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map(({ id, label }) => (
            <Button
              key={id}
              variant={category === id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(id)}
              className={cn(
                "rounded-xl font-medium transition-all",
                category === id
                  ? "bg-gold text-gold-foreground shadow-sm hover:bg-gold/90"
                  : "border-zinc-600 bg-transparent text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
