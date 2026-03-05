"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OFFERS_DROPDOWN_ITEMS } from "@/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getMyCourses } from "@/lib/dal/courses";
import type { Course } from "@/types/course";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&q=80";

type CourseCard = {
  id: string;
  title: string;
  instructor: string;
  nextLesson: string;
  progress: number;
  image: string;
  access: "free" | "paid";
};

export function MyCoursesView() {
  const [activeTab, setActiveTab] = React.useState<"all" | "free" | "paid">("all");
  const viewMode: "grid" | "list" = "grid";
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getMyCourses()
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentCourses = React.useMemo((): CourseCard[] => {
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      instructor: c.instructorName ?? "Instructor",
      nextLesson: "Continue learning",
      progress: 0,
      image: c.imageUrl ?? DEFAULT_IMAGE,
      access: (c.priceSale ?? c.priceRegular ?? 0) > 0 ? "paid" : "free",
    }));
  }, [courses]);

  const completedCourses = React.useMemo((): { id: string; title: string; image: string; access: "free" | "paid" }[] => {
    return [];
  }, []);

  const filteredCurrent = React.useMemo(() => {
    if (activeTab === "all") return currentCourses;
    return currentCourses.filter((c) => c.access === activeTab);
  }, [activeTab, currentCourses]);

  const filteredCompleted = React.useMemo(() => {
    if (activeTab === "all") return completedCourses;
    return completedCourses.filter((c) => c.access === activeTab);
  }, [activeTab, completedCourses]);

  const totalResults = filteredCurrent.length + filteredCompleted.length;

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Courses</h1>
          <p className="text-sm text-zinc-500">Loading your courses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-10">
      <div className="min-w-0 space-y-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Courses</h1>
              <TabsList className="w-full justify-start bg-white border border-zinc-200 sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
            </div>
            <div className="text-sm text-zinc-500">
              Showing{" "}
              <span className="font-medium text-zinc-900">{totalResults}</span>{" "}
              results
            </div>
          </div>

          <TabsContent value="all" className="mt-6 space-y-10">
            {filteredCurrent.length > 0 && (
              <CoursesSection
                title=""
                icon={null}
                viewMode={viewMode}
                courses={filteredCurrent}
              />
            )}
            {filteredCompleted.length > 0 && (
              <CompletedSection
                title=""
                icon={null}
                viewMode={viewMode}
                courses={filteredCompleted}
              />
            )}
            {totalResults === 0 && <EmptyState title="No courses found." />}
          </TabsContent>

          <TabsContent value="free" className="mt-6 space-y-10">
            {filteredCurrent.length > 0 && (
              <CoursesSection title="" icon={null} viewMode={viewMode} courses={filteredCurrent} />
            )}
            {filteredCompleted.length > 0 && (
              <CompletedSection title="" icon={null} viewMode={viewMode} courses={filteredCompleted} />
            )}
            {totalResults === 0 && <EmptyState title="No free courses found." />}
          </TabsContent>

          <TabsContent value="paid" className="mt-6 space-y-10">
            {filteredCurrent.length > 0 && (
              <CoursesSection title="" icon={null} viewMode={viewMode} courses={filteredCurrent} />
            )}
            {filteredCompleted.length > 0 && (
              <CompletedSection title="" icon={null} viewMode={viewMode} courses={filteredCompleted} />
            )}
            {totalResults === 0 && <EmptyState title="No paid courses found." />}
          </TabsContent>
        </Tabs>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Offers</CardTitle>
            <CardDescription>Resources to support your journey</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
                <Button
                  key={href}
                  asChild
                  variant="outline"
                  className="w-full justify-between rounded-xl border-zinc-200"
                >
                  <Link href={href}>
                    <span className="truncate">{label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500" />
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-gold" />
              Recommended
            </CardTitle>
            <CardDescription>Quick win for today</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                <BadgePercent className="mt-0.5 h-5 w-5 text-gold" />
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-900">Practice quizzes</div>
                  <div className="text-sm text-zinc-600">10 minutes/day to strengthen weak areas.</div>
                </div>
              </div>
              <Button asChild className="w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/dashboard/quizzes">Start practice</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Support</CardTitle>
            <CardDescription>Need help? We’re here.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" className="w-full rounded-xl border-zinc-200">
              <Link href="/dashboard/support">Contact support</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="rounded-2xl border-dashed border-zinc-200 bg-white shadow-none">
      <CardContent className="p-8 text-center">
        <p className="font-semibold text-zinc-900">{title}</p>
        {hint ? <p className="mt-1 text-sm text-zinc-600">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function CoursesSection({
  title,
  icon,
  viewMode,
  courses,
  emptyHint,
}: {
  title: string;
  icon: React.ReactNode;
  viewMode: "grid" | "list";
  courses: CourseCard[];
  emptyHint?: string;
}) {
  if (courses.length === 0) {
    return <EmptyState title="No courses found." hint={emptyHint} />;
  }

  return (
    <section>
      {title ? (
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          {icon}
          {title}
        </h2>
      ) : null}

      {viewMode === "grid" ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-200">
                <Image
                  src={course.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-900 shadow-sm">
                  {course.progress === 0 ? "New" : `${course.progress}%`}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 font-semibold text-zinc-900 transition-colors group-hover:text-gold">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">Instructor: {course.instructor}</p>
                {course.progress > 0 ? (
                  <p className="mt-1 text-sm text-zinc-600">Next: {course.nextLesson}</p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-600">Start with: {course.nextLesson}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">{course.progress}%</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 rounded-xl bg-gold font-medium text-gold-foreground hover:bg-gold/90"
                  >
                    <Link href={`/dashboard/courses/lesson?course=${course.id}`}>
                      {course.progress === 0 ? "Start" : "Continue"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <Link href="/courses">Browse</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative aspect-video h-16 w-28 overflow-hidden rounded-xl bg-zinc-200">
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="112px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-zinc-900 transition-colors group-hover:text-gold">
                          {course.title}
                        </h3>
                        <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                          {course.progress === 0 ? "New" : `${course.progress}%`}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-zinc-500">Instructor: {course.instructor}</p>
                      <p className="mt-0.5 text-sm text-zinc-600">
                        {course.progress === 0 ? "Start with" : "Next"}: {course.nextLesson}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <div className="hidden w-36 items-center gap-2 sm:flex" aria-label={`Progress ${course.progress}%`}>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${course.progress}%` }} />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">{course.progress}%</span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="gap-2 rounded-xl bg-gold font-medium text-gold-foreground hover:bg-gold/90"
                    >
                      <Link href={`/dashboard/courses/lesson?course=${course.id}`}>
                        {course.progress === 0 ? "Start" : "Continue"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function CompletedSection({
  title,
  icon,
  viewMode,
  courses,
  emptyHint,
}: {
  title: string;
  icon: React.ReactNode;
  viewMode: "grid" | "list";
  courses: { id: string; title: string; image: string; access: "free" | "paid" }[];
  emptyHint?: string;
}) {
  if (courses.length === 0) {
    return <EmptyState title="No completed courses found." hint={emptyHint} />;
  }

  return (
    <section>
      {title ? (
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          {icon}
          {title}
        </h2>
      ) : null}

      {viewMode === "grid" ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-200">
                <Image
                  src={course.image}
                  alt=""
                  fill
                  className="object-cover grayscale transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <CheckCircle2 className="h-14 w-14 text-white drop-shadow-lg" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 font-semibold text-zinc-900">{course.title}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 rounded-xl bg-gold font-medium text-gold-foreground hover:bg-gold/90"
                  >
                    <Link href={`/dashboard/courses/lesson?course=${course.id}`}>
                      Review
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <Link href="/dashboard/certifications">Certificate</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative aspect-video h-16 w-28 overflow-hidden rounded-xl bg-zinc-200">
                      <Image
                        src={course.image}
                        alt=""
                        fill
                        className="object-cover grayscale transition-transform duration-300 group-hover:scale-105"
                        sizes="112px"
                      />
                      <div className="absolute inset-0 bg-black/15" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-zinc-900">{course.title}</h3>
                      <p className="mt-0.5 text-sm text-zinc-600">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <Button
                      asChild
                      size="sm"
                      className="gap-2 rounded-xl bg-gold font-medium text-gold-foreground hover:bg-gold/90"
                    >
                      <Link href={`/dashboard/courses/lesson?course=${course.id}`}>
                        Review
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Link href="/dashboard/certifications">Certificate</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
