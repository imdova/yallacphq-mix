"use client";

import * as React from "react";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import { CoursesHero } from "@/components/features/courses/CoursesHero";
import { CoursesFilters, type FilterState } from "@/components/features/courses/CoursesFilters";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { CoursesFooter } from "@/components/features/courses/CoursesFooter";
import { Button } from "@/components/ui/button";
import { getPublicCourses } from "@/lib/dal/courses";
import { getPublicStudentFieldOptions } from "@/lib/dal/settings";
import type { Course } from "@/types/course";

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 6;

const FALLBACK_CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "Exam Prep", label: "Exam Prep" },
  { id: "Quality Management", label: "Quality Management" },
  { id: "Patient Safety", label: "Patient Safety" },
  { id: "Free Resources", label: "Free Resources" },
];

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categoryOptions, setCategoryOptions] = React.useState<{ id: string; label: string }[]>(
    FALLBACK_CATEGORIES
  );
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort] = React.useState("newest");
  const [displayCount, setDisplayCount] = React.useState(INITIAL_COUNT);
  const [filters, setFilters] = React.useState<FilterState>({
    level: [],
    duration: [],
    certification: [],
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getPublicCourses();
        if (!cancelled) setCourses(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    getPublicStudentFieldOptions()
      .then((opts) => {
        if (cancelled) return;
        const list = opts.categories?.length
          ? [{ id: "all", label: "All Resources" }, ...opts.categories.map((c) => ({ id: c, label: c }))]
          : FALLBACK_CATEGORIES;
        setCategoryOptions(list);
      })
      .catch(() => {
        if (!cancelled) setCategoryOptions(FALLBACK_CATEGORIES);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    let list = [...courses];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructorName.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter((c) => c.tag === category);
    }
    if (filters.level.length > 0) {
      list = list.filter((c) => c.level && filters.level.includes(c.level));
    }
    if (filters.duration.length > 0) {
      list = list.filter((c) => {
        const h = c.durationHours;
        if (filters.duration.includes("0-2 Hours") && h <= 2) return true;
        if (filters.duration.includes("3-6 Hours") && h >= 3 && h <= 6) return true;
        if (filters.duration.includes("6+ Hours") && h > 6) return true;
        return false;
      });
    }
    if (filters.certification.length > 0) {
      list = list.filter((c) => c.certificationType && filters.certification.includes(c.certificationType));
    }
    if (sort === "newest") {
      list.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === "popular") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === "duration-asc") {
      list.sort((a, b) => a.durationHours - b.durationHours);
    } else if (sort === "duration-desc") {
      list.sort((a, b) => b.durationHours - a.durationHours);
    }
    return list;
  }, [courses, search, category, sort, filters]);

  const visible = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  const hasActiveFilters =
    filters.level.length > 0 || filters.duration.length > 0 || filters.certification.length > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-100">
      <CoursesHeader />
      <main>
        <CoursesHero
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categoryOptions={categoryOptions}
        />
        <div className="container px-4 py-6 sm:py-8 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <CoursesFilters value={filters} onChange={setFilters} hasActiveFilters={hasActiveFilters} />
              </div>
            </div>
            <div className="min-w-0">
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                    >
                      <div className="aspect-video animate-pulse bg-zinc-200" />
                      <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                        <div className="mt-4 flex gap-2">
                          <div className="h-9 flex-1 animate-pulse rounded-lg bg-zinc-100" />
                          <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 px-6 text-center">
                  <p className="text-lg font-medium text-zinc-900">No courses match your filters</p>
                  <p className="mt-2 max-w-sm text-sm text-zinc-500">
                    Try a different search term or clear some filters to see more results.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl border-zinc-200"
                    onClick={() => {
                      setCategory("all");
                      setFilters({ level: [], duration: [], certification: [] });
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-10 flex justify-center">
                      <Button
                        variant="outline"
                        className="rounded-xl border-gold px-8 py-6 font-semibold text-gold hover:bg-gold/10 hover:text-gold"
                        onClick={() => setDisplayCount((n) => n + LOAD_MORE_COUNT)}
                      >
                        Load more courses
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <CoursesFooter />
      </main>
    </div>
  );
}
