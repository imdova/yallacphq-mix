"use client";

import * as React from "react";
import Link from "next/link";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { getFeaturedCourses } from "@/lib/dal/courses";
import type { Course } from "@/types/course";
import { ArrowRight } from "lucide-react";

const DISPLAY_COUNT = 12; // 4 per row × 3 rows

export function CoursesSection() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getFeaturedCourses(DISPLAY_COUNT);
        if (!cancelled) setCourses(data.slice(0, DISPLAY_COUNT));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="courses"
      className="scroll-mt-20 bg-white py-16 md:py-24"
      aria-labelledby="courses-heading"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Learning paths
            </p>
            <h2
              id="courses-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl"
            >
              Featured <span className="text-gold">Courses</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm text-zinc-600">
              World-class CPHQ exam prep, quality management, and healthcare excellence programs.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-4 shrink-0 rounded-xl border-gold font-medium text-gold hover:bg-gold/10 hover:text-gold sm:mt-0"
          >
            <Link href="/courses" className="inline-flex items-center gap-2">
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
              >
                <div className="aspect-video animate-pulse bg-zinc-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                  <div className="mt-4 flex gap-2">
                    <div className="h-9 flex-1 animate-pulse rounded-xl bg-zinc-100" />
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
