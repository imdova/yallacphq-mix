"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Check,
  Star,
  Users,
  Clock,
  ChevronDown,
  Facebook,
  Youtube,
  Linkedin,
  Lightbulb,
  BadgeCheck,
  PlayCircle,
  Timer,
  Tag,
  BookOpen,
  FileQuestion,
  Globe,
  ImageIcon,
  Lock,
  Video,
  Settings,
} from "lucide-react";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import {
  enrollCourse,
  getMyCourses,
  getPublicCourse,
  getPublicCourses,
  getRelatedCourses,
} from "@/lib/dal/courses";
import { ROUTES } from "@/constants";
import type { Course, CourseCurriculumItem, CourseReviewMediaItem } from "@/types/course";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { getErrorMessage } from "@/lib/api/error";
import { getCourseCurriculumCounts } from "@/lib/course-learning";
import { getYouTubeThumbnailUrl, parseVideoSource } from "@/lib/video-source";
import { MediaVideoPlayer } from "@/components/shared/MediaVideoPlayer";

const FOOTER_PROGRAMS = [
  "CPHQ Preparation",
  "Patient Safety Report",
  "Healthcare Analysis",
  "Risk Management",
];
const FOOTER_COMPANY = ["About Us", "Instructors", "Success Stories", "Contact"];

function formatCurrency(amount: number, currency?: string) {
  if (amount === 0) return "Free";
  const cur = currency?.trim() || "USD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function splitBullets(input?: string): string[] {
  if (!input) return [];
  const normalized = input.replace(/\r\n/g, "\n").replace(/[•·]/g, "\n").replace(/\t/g, " ").trim();

  if (!normalized) return [];

  const parts = normalized
    .split("\n")
    .flatMap((line) => line.split(/;|\s*\|\s*/g))
    .map((s) => s.replace(/^\s*[-*]\s+/, "").trim())
    .flatMap((s) => s.split(/,(?!\d)/g).map((x) => x.trim()))
    .filter(Boolean);

  return Array.from(new Set(parts));
}

function splitKeywords(input?: string): string[] {
  if (!input) return [];
  const s = input.trim();
  if (!s) return [];
  const parts = s
    .split(/,|\||\n|;/g)
    .map((x) => x.trim())
    .filter(Boolean);
  return Array.from(new Set(parts)).slice(0, 10);
}

function splitSentences(input: string, max = 6): string[] {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?:\.\s+|\?\s+|!\s+)/g)
    .map((s) => s.replace(/[.!?]+$/, "").trim())
    .filter(Boolean);
  return parts.slice(0, max);
}

function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined") {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduce) {
        setShown(true);
        return;
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transform-gpu transition-[opacity,transform] duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  className = "",
  icon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <h2
      className={cn(
        "flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 sm:gap-3 sm:text-xl md:text-2xl",
        className
      )}
    >
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </span>
      ) : (
        <span className="h-1 w-12 shrink-0 rounded-full bg-gold" />
      )}
      {children}
    </h2>
  );
}

const RELATED_COUNT = 4;

export function CourseDetailsView() {
  const router = useRouter();
  const { user, status } = useAuth();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course");

  const [course, setCourse] = React.useState<Course | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [relatedCourses, setRelatedCourses] = React.useState<Course[]>([]);
  const [allPublicCourses, setAllPublicCourses] = React.useState<Course[]>([]);
  const [showAllLearn, setShowAllLearn] = React.useState(false);
  const [showInstructorMore, setShowInstructorMore] = React.useState(false);
  const [reviewMediaOpen, setReviewMediaOpen] = React.useState(false);
  const [activeReviewMedia, setActiveReviewMedia] = React.useState<CourseReviewMediaItem | null>(
    null
  );
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({});
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollError, setEnrollError] = React.useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = React.useState(false);
  const [isEnrolled, setIsEnrolled] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated" || !courseId) {
      setIsEnrolled(false);
      return;
    }
    let cancelled = false;
    getMyCourses()
      .then((items) => {
        if (!cancelled) setIsEnrolled(items.some((c) => c.id === courseId));
      })
      .catch(() => {
        if (!cancelled) setIsEnrolled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, courseId]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        if (!courseId) {
          if (!cancelled) {
            setCourse(null);
            setAllPublicCourses([]);
            setRelatedCourses([]);
          }
          return;
        }

        const [c, list, related] = await Promise.all([
          getPublicCourse(courseId),
          getPublicCourses(),
          getRelatedCourses(courseId, RELATED_COUNT),
        ]);

        if (!cancelled) {
          setCourse(c ?? null);
          setAllPublicCourses(list);
          setRelatedCourses(related.filter((item) => item.id !== courseId).slice(0, RELATED_COUNT));
        }
      } catch (e) {
        if (!cancelled) setLoadError(getErrorMessage(e, "Failed to load course"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  React.useEffect(() => {
    setShowAllLearn(false);
    setShowInstructorMore(false);
    setReviewMediaOpen(false);
    setActiveReviewMedia(null);
  }, [courseId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    const sections = course?.curriculumSections ?? [];
    if (!sections.length) {
      setExpandedModules({});
      return;
    }
    setExpandedModules((prev) => {
      const next: Record<string, boolean> = {};
      sections.forEach((section, index) => {
        next[section.id] = prev[section.id] ?? index === 0;
      });
      return next;
    });
  }, [course?.id, course?.curriculumSections]);

  const displayCourse = course ?? ({} as Partial<Course>);
  const title = displayCourse.title ?? "CPHQ Preparation Program";
  const tag = displayCourse.tag ?? "Exam Prep";
  const rating = displayCourse.rating ?? 4.9;
  const enrolledCount = displayCourse.enrolledCount ?? 2400;
  const reviewCount = displayCourse.reviewCount ?? 50;
  const instructorName = displayCourse.instructorName ?? "Dr Ahmed Habib";
  const instructorTitle = displayCourse.instructorTitle ?? "CPHQ, Healthcare Quality Director";
  const durationHours = displayCourse.durationHours ?? 12;
  const priceRegular = displayCourse.priceRegular ?? 0;
  const priceSale = displayCourse.priceSale;
  const hasSale = priceSale != null && priceSale > 0 && priceRegular > priceSale;
  const displayPrice = hasSale ? priceSale : priceRegular;
  const isFree = displayPrice === 0;
  const currency = displayCourse.currency ?? "USD";
  const description =
    displayCourse.description?.trim() ||
    "A modern, comprehensive guide to mastering Healthcare Quality Management — built for real-world practice and exam readiness.";
  const includesList = splitBullets(displayCourse.includes);
  const courseIncludes = includesList;
  const whoRaw = displayCourse.whoCanAttend?.trim() || "";
  const whoIsParagraph = whoRaw.length > 120 && /[.!?]/.test(whoRaw);
  const whoAttendList = whoIsParagraph ? [] : splitBullets(whoRaw);
  const whoDesignItems = whoAttendList.length
    ? whoAttendList
    : whoRaw
      ? (() => {
          const sentences = splitSentences(whoRaw, 6);
          return sentences.length >= 2 ? sentences : [whoRaw];
        })()
      : [];
  const heroBgUrl =
    displayCourse.imageUrl?.startsWith("http") || displayCourse.imageUrl?.startsWith("data:")
      ? displayCourse.imageUrl
      : null;
  const previewVideoSource = displayCourse.videoPreviewUrl?.trim() ?? "";
  const hasPreviewVideo = Boolean(previewVideoSource);
  const curriculumSections = displayCourse.curriculumSections ?? [];
  const totalModules = curriculumSections.length;
  const curriculumCounts = getCourseCurriculumCounts(displayCourse);
  const totalLessons = curriculumCounts.lessonCount;
  const totalQuizzes = curriculumCounts.quizCount;
  const levelLabel = displayCourse.level ?? "Intermediate";
  const certLabel = displayCourse.certificationType ?? "Certificate Included";
  const learningOutcomes = displayCourse.learningOutcomes?.filter(Boolean) ?? [];
  const learnPreviewCount = 4;
  const learnItemsVisible = showAllLearn
    ? learningOutcomes
    : learningOutcomes.slice(0, learnPreviewCount);
  const skillsTags = splitKeywords(displayCourse.seoKeywords);
  const enrollmentEnabled = displayCourse.enableEnrollment !== false;

  const instructorCourses = React.useMemo(() => {
    const name = instructorName.trim();
    if (!name) return [];
    return allPublicCourses.filter((c) => (c.instructorName ?? "").trim() === name);
  }, [allPublicCourses, instructorName]);

  const instructorCourseCount = instructorCourses.length || 1;
  const instructorLearners = React.useMemo(() => {
    const sum = instructorCourses.reduce((acc, c) => acc + (c.enrolledCount ?? 0), 0);
    return sum > 0 ? sum : enrolledCount;
  }, [enrolledCount, instructorCourses]);

  const instructorBio = displayCourse.whyYalla?.trim() || displayCourse.description?.trim() || "";

  const instructorAvatarUrl =
    displayCourse.instructorImageUrl?.startsWith("http") ||
    displayCourse.instructorImageUrl?.startsWith("data:")
      ? displayCourse.instructorImageUrl
      : undefined;

  const reviewMedia = displayCourse.reviewMedia ?? [];

  // rating kept for other UI sections

  const onEnroll = async () => {
    if (!courseId || !enrollmentEnabled) return;
    setEnrollError(null);
    setEnrollSuccess(false);

    if (status !== "authenticated" || !user) {
      if (isFree) {
        const next = `/course-details?course=${encodeURIComponent(courseId)}`;
        router.push(`/auth/login?next=${encodeURIComponent(next)}`);
        return;
      }
      router.push(`${ROUTES.CHECKOUT}?course=${encodeURIComponent(courseId)}`);
      return;
    }

    if (isFree) {
      setEnrolling(true);
      try {
        await enrollCourse(courseId, user.id);
        setEnrollSuccess(true);
        window.setTimeout(() => router.push("/dashboard/courses"), 600);
      } catch (e) {
        setEnrollError(getErrorMessage(e, "Failed to enroll"));
      } finally {
        setEnrolling(false);
      }
      return;
    }

    setEnrolling(true);
    router.push(`${ROUTES.CHECKOUT}?course=${encodeURIComponent(courseId)}`);
  };

  if (loading && !course && courseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!loading && loadError) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="container max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
            <p className="text-sm font-semibold text-rose-800">Couldn’t load this course</p>
            <p className="mt-1 text-sm text-rose-700">{loadError}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-xl border-rose-200">
                <Link href="/courses">Back to courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && courseId && !course) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="container max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Course not found</p>
            <p className="mt-1 text-sm text-zinc-600">
              The course you’re looking for doesn’t exist or is no longer published.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="rounded-xl border-zinc-200">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 font-home">
      <CoursesHeader variant="dark" />

      {enrollError ? (
        <div className="container max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {enrollError}
          </div>
        </div>
      ) : null}
      {enrollSuccess ? (
        <div className="container max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Enrolled successfully. Redirecting…
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-white/10 bg-zinc-950 pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-14"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(9,9,11,0.78), rgba(9,9,11,0.92)), url('/images/course-hero-bg-v3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.10),transparent)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%,rgba(0,0,0,0.12))]"
          aria-hidden
        />

        <div className="container relative max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Reveal>
              <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-white">
                {title}
              </h1>
            </Reveal>

            <Reveal delayMs={80}>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-200/90 sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <Video className="h-4 w-4 text-gold/80" />
                  Recorded Videos
                </span>

                <span className="inline-flex items-center gap-2">
                  {hasSale ? (
                    <>
                      <span className="text-zinc-400 line-through">
                        {formatCurrency(priceRegular, currency)}
                      </span>
                      <span className="font-semibold text-gold">
                        {formatCurrency(displayPrice, currency)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-gold">
                      {formatCurrency(displayPrice, currency)}
                    </span>
                  )}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold/80" />
                  {enrolledCount.toLocaleString()} Students
                </span>

                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold/80" />
                  {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-gold/80" />
                  {totalQuizzes} {totalQuizzes === 1 ? "Quiz" : "Quizzes"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-gold ring-1 ring-white/5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {reviewCount.toLocaleString()} reviews
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-white/5 sm:ml-auto">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                  {tag}
                </span>
              </div>
            </Reveal>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_324px] lg:items-stretch lg:gap-5">
            <div className="min-w-0">
              <div className="flex w-full min-w-0 justify-center lg:justify-start">
                <div className="w-full min-w-0 lg:w-[96%]">
                  <Reveal delayMs={140}>
                    {hasPreviewVideo ? (
                      <div className="rounded-3xl bg-gradient-to-r from-gold/80 via-gold to-gold/80 p-[3px] shadow-2xl shadow-gold/20">
                        <div className="w-full min-w-0 overflow-hidden rounded-2xl bg-black/30 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                          <div className="relative aspect-video min-h-0 w-full">
                            <MediaVideoPlayer
                              source={previewVideoSource}
                              title={title}
                              access="public"
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-gold/20 bg-black/25 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                        {heroBgUrl ? (
                          <Image
                            src={heroBgUrl}
                            alt={title}
                            fill
                            className="object-cover opacity-70"
                            unoptimized={heroBgUrl.startsWith("http")}
                          />
                        ) : null}
                        <div className="relative z-10 px-6 text-center text-white">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200/80">
                            Course Preview
                          </p>
                          <p className="mt-2 text-lg font-semibold">Preview video coming soon</p>
                        </div>
                      </div>
                    )}
                  </Reveal>
                </div>
              </div>
            </div>

            <div className="min-h-0 min-w-0 lg:flex lg:items-stretch lg:justify-end">
              {/* Mobile: CTA only */}
              <div className="mx-auto w-[70%] sm:hidden">
                <Reveal delayMs={220}>
                  <Button
                    type="button"
                    onClick={() => void onEnroll()}
                    disabled={enrolling || !enrollmentEnabled}
                    className={cn(
                      "w-full rounded-xl bg-gold px-3 py-3 text-[12px] font-extrabold font-serif tracking-normal text-gold-foreground shadow-lg shadow-gold/20 transition hover:bg-gold/90 hover:shadow-gold/30",
                      "whitespace-nowrap text-center",
                      "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    )}
                  >
                    {!enrollmentEnabled
                      ? "Enrollment closed"
                      : enrolling
                        ? "Loading…"
                        : "25% OFF - GET Full Access Now !"}
                  </Button>
                </Reveal>
              </div>

              {/* Desktop/tablet: full details card */}
              <div className="hidden h-full min-h-0 w-full min-w-0 max-w-full sm:block sm:max-w-lg lg:mx-0 lg:max-w-[324px]">
                <Reveal delayMs={220} className="h-full">
                  <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gold/10 bg-white/95 shadow-2xl shadow-black/15 ring-1 ring-white/5 backdrop-blur-sm">
                  <div className="relative h-20 w-full shrink-0 overflow-hidden sm:h-24">
                    {heroBgUrl ? (
                      <Image
                        src={heroBgUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        unoptimized={heroBgUrl.startsWith("http")}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-white" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/15 to-transparent" />
                  </div>

                  <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
                    <h3 className="text-sm font-bold tracking-tight text-zinc-900 sm:text-base">
                      Course Details:
                    </h3>

                    <div className="mt-3 flex min-h-0 flex-1 flex-col divide-y divide-zinc-100 overflow-auto">
                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <Users className="h-4 w-4 text-gold" />
                          Students
                        </span>
                        <span className="font-medium text-zinc-900">{enrolledCount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <BookOpen className="h-4 w-4 text-gold" />
                          Lessons
                        </span>
                        <span className="font-medium text-zinc-900">{totalLessons}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <FileQuestion className="h-4 w-4 text-gold" />
                          Quizzes
                        </span>
                        <span className="font-medium text-zinc-900">{totalQuizzes}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <Clock className="h-4 w-4 text-gold" />
                          Duration
                        </span>
                        <span className="font-medium text-zinc-900">{durationHours}h total</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <Video className="h-4 w-4 text-gold" />
                          Attendance
                        </span>
                        <span className="font-medium text-zinc-900">Recorded Videos</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <Globe className="h-4 w-4 text-gold" />
                          Language
                        </span>
                        <span className="font-medium text-zinc-900">EN · AR</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 text-zinc-600">
                          <Tag className="h-4 w-4 text-gold" />
                          Price
                        </span>
                        <div className="text-right leading-tight">
                          {hasSale ? (
                            <div className="text-xs text-zinc-400 line-through">
                              {formatCurrency(priceRegular, currency)}
                            </div>
                          ) : null}
                          <div
                            className={cn(
                              "font-semibold",
                              hasSale ? "text-gold" : isFree ? "text-emerald-700" : "text-zinc-900"
                            )}
                          >
                            {formatCurrency(displayPrice, currency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => void onEnroll()}
                      disabled={enrolling || !enrollmentEnabled}
                      className={cn(
                        "mt-4 w-full rounded-xl bg-gold px-4 py-3 text-sm md:text-base font-extrabold font-serif tracking-normal md:tracking-wide text-gold-foreground shadow-lg shadow-gold/20 transition hover:bg-gold/90 hover:shadow-gold/30",
                        "whitespace-nowrap text-center",
                        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                      )}
                    >
                      {!enrollmentEnabled
                        ? "Enrollment closed"
                        : enrolling
                          ? "Loading…"
                          : "25% OFF - GET Full Access Now !"}
                    </Button>
                    <p className="mt-2 text-center text-[11px] text-zinc-500">
                      {isFree ? "Instant access" : "Secure checkout · Instant access"}
                    </p>
                  </CardContent>
                </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-zinc-950">
        {/* Main: two columns */}
        <div className="container max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <div className="order-2 min-w-0 space-y-10 sm:space-y-16 lg:order-1">
              {description ? (
                <Reveal>
                  <section
                    className="relative overflow-hidden rounded-2xl border border-gold/15 bg-zinc-950 p-4 shadow-sm sm:p-6 md:p-8"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(9,9,11,0.40), rgba(9,9,11,0.80)), url('/images/course-overview-bg.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.10),transparent)]"
                      aria-hidden
                    />
                    <div className="relative">
                      <SectionTitle icon={Lightbulb} className="text-white">
                        Course Overview
                      </SectionTitle>
                      <div className="mt-4 max-w-none text-sm leading-relaxed text-zinc-100/90 sm:mt-6 sm:text-base">
                        {description}
                      </div>
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {courseIncludes.length > 0 ? (
                <Reveal delayMs={60}>
                  <section
                    className="relative overflow-hidden rounded-2xl border border-gold/15 bg-zinc-950 p-4 shadow-sm sm:p-6 md:p-8"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(9,9,11,0.55), rgba(9,9,11,0.85)), url('/images/course-includes-bg.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.10),transparent)]"
                      aria-hidden
                    />
                    <div className="relative">
                      <SectionTitle icon={BookOpen} className="text-white">
                        What This Course Includes
                      </SectionTitle>
                      <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-100/90 sm:text-base">
                        The CPHQ exam is offered in-person and online, with a live remote proctor.
                        The online and in-person testing environments for the CPHQ exam offer the
                        same level of rigor and security. The general policies are similar but there
                        is additional information you need to know for the proctored online exam
                        option.
                      </p>
                    </div>
                    <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                      {courseIncludes.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/20">
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-zinc-100/90">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {learningOutcomes.length > 0 ? (
                <Reveal delayMs={120}>
                  <section
                    className="relative overflow-hidden rounded-2xl border border-gold/15 bg-zinc-950 p-4 shadow-sm sm:p-6 md:p-8"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(9,9,11,0.62), rgba(9,9,11,0.92)), url('/images/course-learn-bg.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.12),transparent)]"
                      aria-hidden
                    />
                    <div className="relative">
                      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
                        What You&apos;ll Learn In This Course
                      </h2>
                      <ul className="mt-4 grid gap-x-8 gap-y-3 sm:mt-6 sm:grid-cols-2">
                        {learnItemsVisible.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/20">
                              <Check className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 text-sm text-zinc-100/90">{item}</span>
                          </li>
                        ))}
                      </ul>
                      {learningOutcomes.length > learnPreviewCount ? (
                        <button
                          type="button"
                          onClick={() => setShowAllLearn((v) => !v)}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold underline underline-offset-4 hover:text-gold/90"
                          aria-expanded={showAllLearn}
                          aria-controls="learn-outcomes"
                        >
                          {showAllLearn ? "Hide learning outcomes" : "View All Learning Outcomes"}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              showAllLearn && "rotate-180"
                            )}
                          />
                        </button>
                      ) : null}
                      <span id="learn-outcomes" className="sr-only" />
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {skillsTags.length > 0 ? (
                <Reveal delayMs={180}>
                  <section className="rounded-2xl bg-sky-50/80 p-4 shadow-sm sm:p-6 md:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-800 shadow-sm ring-1 ring-sky-100">
                          <Settings className="h-5 w-5" />
                        </span>
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                          Knowledge &amp; Skills You Will Learn
                        </h2>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {skillsTags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-sky-200 bg-white px-5 py-2 text-sm font-semibold text-sky-700 shadow-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {whoRaw ? (
                <Reveal delayMs={240}>
                  <section>
                    <Card className="overflow-hidden rounded-2xl border-white/10 bg-transparent shadow-none">
                      <CardContent className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
                          Who can attend this course?
                        </h2>
                        {whoIsParagraph ? (
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-200/80">
                            {whoRaw}
                          </p>
                        ) : null}

                        {whoDesignItems.length > 0 ? (
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {whoDesignItems.map((label) => (
                              <div
                                key={label}
                                className={cn(
                                  "group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-sm",
                                  "transition hover:border-gold/25 hover:bg-white/10 hover:shadow-md"
                                )}
                              >
                                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/25">
                                  <Check className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-zinc-100/90">
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </section>
                </Reveal>
              ) : null}

              {curriculumSections.length > 0 ? (
                <Reveal delayMs={300}>
                  <section id="curriculum" className="scroll-mt-24">
                    {(() => {
                    const safeHours = Math.round(durationHours * 10) / 10;
                    const allExpanded = curriculumSections.every(
                      (section) => expandedModules[section.id]
                    );
                    const shouldExpand = !allExpanded;

                    const toggleAll = () => {
                      setExpandedModules(
                        () =>
                          Object.fromEntries(
                            curriculumSections.map((section) => [section.id, shouldExpand])
                          ) as Record<string, boolean>
                      );
                    };

                      return (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="h-8 w-1.5 rounded-full bg-gold" aria-hidden />
                              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                                Smart Curriculum
                              </h2>
                            </div>
                            <p className="mt-1 text-sm text-zinc-600">
                              {totalModules} Modules • {totalLessons}{" "}
                              {totalLessons === 1 ? "Lesson" : "Lessons"} • {totalQuizzes}{" "}
                              {totalQuizzes === 1 ? "Quiz" : "Quizzes"} • {safeHours}h total length
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={toggleAll}
                            className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
                          >
                            {allExpanded ? "Collapse All" : "Expand All"}
                          </button>
                        </div>

                        <div className="mt-6 space-y-4">
                          {curriculumSections.map((section) => {
                            const open = expandedModules[section.id] ?? false;
                            const lectureCount =
                              section.items?.filter((item) => item.type === "lecture").length ?? 0;
                            const quizCount =
                              section.items?.filter((item) => item.type === "quiz").length ?? 0;

                            return (
                              <div
                                key={section.id}
                                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                              >
                                <button
                                  type="button"
                                  className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                                  onClick={() => toggleModule(section.id)}
                                  aria-expanded={open}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                                      <ChevronDown
                                        className={cn(
                                          "h-5 w-5 transition-transform",
                                          open ? "rotate-180" : "rotate-0"
                                        )}
                                      />
                                    </span>
                                    <div className="min-w-0">
                                      <span className="block min-w-0 break-words text-base font-semibold text-zinc-900">
                                        {section.title}
                                      </span>
                                      {section.description ? (
                                        <span className="mt-1 block text-sm text-zinc-500">
                                          {section.description}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 sm:justify-end">
                                    <span className="inline-flex items-center gap-2">
                                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                        <PlayCircle className="h-4 w-4" />
                                      </span>
                                      <span className="font-semibold text-zinc-900">
                                        {lectureCount}
                                      </span>
                                      <span className="text-zinc-500">Lectures</span>
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 text-gold">
                                        <BookOpen className="h-4 w-4" />
                                      </span>
                                      <span className="font-semibold text-zinc-900">
                                        {quizCount}
                                      </span>
                                      <span className="text-zinc-500">Quizzes</span>
                                    </span>
                                  </div>
                                </button>

                                {open ? (
                                  <div className="border-t border-zinc-200 bg-zinc-50/60">
                                    {section.items?.length ? (
                                      <div className="divide-y divide-zinc-200">
                                        {section.items.map((item: CourseCurriculumItem) => {
                                          const isLecture = item.type === "lecture";
                                          const videoSrc =
                                            isLecture ? (item.videoUrl?.trim() ?? "") : "";
                                          const canWatchLesson =
                                            isLecture &&
                                            videoSrc.length > 0 &&
                                            (Boolean(item.freeLecture) || isEnrolled);
                                          const vdoParsed =
                                            isLecture && videoSrc ? parseVideoSource(videoSrc) : null;

                                          return (
                                            <div key={item.id} className="px-4 py-3">
                                              <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
                                                    {item.type === "lecture" ? (
                                                      <PlayCircle className="h-4 w-4" />
                                                    ) : (
                                                      <BookOpen className="h-4 w-4" />
                                                    )}
                                                  </span>
                                                  <div className="min-w-0">
                                                    <span className="block min-w-0 text-sm text-zinc-700">
                                                      {item.title}
                                                    </span>
                                                    {item.type === "lecture" && item.materialUrl ? (
                                                      <a
                                                        href={item.materialUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-medium text-gold hover:underline"
                                                      >
                                                        Open material
                                                      </a>
                                                    ) : null}
                                                  </div>
                                                </div>
                                                {item.type === "lecture" && item.freeLecture ? (
                                                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    Free lesson
                                                  </span>
                                                ) : item.type === "quiz" ? (
                                                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                                                    Quiz
                                                  </span>
                                                ) : null}
                                              </div>
                                              {isLecture && videoSrc ? (
                                                canWatchLesson ? (
                                                  <div className="relative mt-3 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-black shadow-sm">
                                                    <MediaVideoPlayer
                                                      source={videoSrc}
                                                      title={item.title}
                                                      access={
                                                        vdoParsed?.kind === "vdocipher"
                                                          ? "course_lesson"
                                                          : "public"
                                                      }
                                                      courseId={
                                                        vdoParsed?.kind === "vdocipher" && course?.id
                                                          ? course.id
                                                          : undefined
                                                      }
                                                      lessonId={
                                                        vdoParsed?.kind === "vdocipher"
                                                          ? item.id
                                                          : undefined
                                                      }
                                                    />
                                                  </div>
                                                ) : (
                                                  <div className="mt-3 flex max-w-2xl items-start gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 shadow-sm">
                                                    <Lock
                                                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500"
                                                      aria-hidden
                                                    />
                                                    <span>
                                                      Purchase this course to watch. Lessons labeled
                                                      &quot;Free lesson&quot; can be watched here
                                                      without enrolling.
                                                    </span>
                                                  </div>
                                                )
                                              ) : null}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="px-4 py-4 text-sm text-zinc-600">
                                        Lessons list coming soon.
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                    })()}
                  </section>
                </Reveal>
              ) : null}

              {/* Instructor */}
              <Reveal delayMs={360}>
              <section>
                <Card
                  className="relative mt-6 overflow-hidden border border-gold/15 bg-zinc-950 shadow-sm"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(9,9,11,0.78), rgba(9,9,11,0.92)), url('/images/publisher-bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.12),transparent)]"
                    aria-hidden
                  />
                  <CardContent className="relative p-4 sm:p-6">
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      About Your Course Publisher
                    </h2>

                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                      <div className="flex shrink-0 items-center justify-center">
                        <div
                          className={cn(
                            "h-24 w-24 rounded-full border-4 border-gold/25 bg-white/10 shadow-sm ring-1 ring-white/10",
                            "grid place-items-center overflow-hidden"
                          )}
                          aria-hidden
                        >
                          {instructorAvatarUrl ? (
                            <Image
                              src={instructorAvatarUrl}
                              alt={instructorName}
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
                              unoptimized={instructorAvatarUrl.startsWith("http")}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/80">
                              {instructorName
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((s) => s[0]!.toUpperCase())
                                .join("")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <button
                            type="button"
                            className="max-w-full text-left"
                            onClick={() => setShowInstructorMore(true)}
                          >
                            <span className="break-words text-lg font-bold text-gold underline decoration-gold/40 underline-offset-4">
                              {instructorName}
                            </span>
                          </button>
                          <span className="text-sm font-semibold text-zinc-200/90">
                            Publisher Stats
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-zinc-200/70">
                          {instructorTitle}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-100/90">
                          <span className="inline-flex items-center gap-2 font-semibold text-white">
                            <span className="text-gold" aria-hidden>
                              🎓
                            </span>
                            {instructorLearners.toLocaleString()}{" "}
                            <span className="font-medium text-zinc-200/70">Learners</span>
                          </span>
                          <span className="inline-flex items-center gap-2 font-semibold text-white">
                            <span className="text-gold" aria-hidden>
                              📚
                            </span>
                            {instructorCourseCount}{" "}
                            <span className="font-medium text-zinc-200/70">Courses</span>
                          </span>
                          <span className="inline-flex items-center gap-2 font-semibold text-white">
                            <span className="text-gold" aria-hidden>
                              👍
                            </span>
                            {Math.max(0, instructorLearners).toLocaleString()}{" "}
                            <span className="font-medium text-zinc-200/70">
                              Learners Benefited From Their Courses
                            </span>
                          </span>
                        </div>

                        {instructorBio ? (
                          <p className="mt-5 text-sm leading-relaxed text-zinc-100/85">
                            {showInstructorMore
                              ? instructorBio
                              : `${instructorBio.slice(0, 170)}${instructorBio.length > 170 ? "…" : ""}`}
                            {instructorBio.length > 170 ? (
                              <button
                                type="button"
                                onClick={() => setShowInstructorMore((v) => !v)}
                                className="ml-2 font-semibold text-gold hover:underline"
                              >
                                {showInstructorMore ? "Read Less" : "Read More"}
                              </button>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              </Reveal>

              {/* Reviews */}
              <Reveal delayMs={420}>
              <section>
                <SectionTitle className="text-white">Students Reviews &amp; Feedback</SectionTitle>
                <Card className="mt-6 overflow-hidden border-zinc-200 bg-white shadow-sm">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    {reviewMedia.length ? (
                      (() => {
                        const isVideoItem = (m: CourseReviewMediaItem) =>
                          m.kind === "video" || m.kind === "youtube";
                        const videos = reviewMedia.filter(isVideoItem);
                        const featured = videos[0] ?? null;
                        const topRight = videos.slice(1, 7);
                        const galleryItems = (() => {
                          const topIds = new Set<string>();
                          if (featured) topIds.add(featured.id);
                          for (const m of topRight) topIds.add(m.id);
                          return reviewMedia.filter((m) => !topIds.has(m.id));
                        })();
                        const missingTopRight = Math.max(0, 6 - topRight.length);

                        const tileThumb = (m: CourseReviewMediaItem): string | undefined => {
                          if (m.kind === "image") return m.src;
                          if (m.kind === "video") return m.poster;
                          return getYouTubeThumbnailUrl(m.src) ?? undefined;
                        };

                        const Tile = ({
                          m,
                          className,
                          aspectClass,
                        }: {
                          m: CourseReviewMediaItem;
                          className?: string;
                          aspectClass: string;
                        }) => {
                          const isVideo = m.kind === "video" || m.kind === "youtube";
                          const thumbSrc = tileThumb(m);
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReviewMedia(m);
                                setReviewMediaOpen(true);
                              }}
                              className={cn(
                                "group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 text-left shadow-sm transition",
                                "hover:border-gold/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold/40",
                                className
                              )}
                            >
                              <div className={cn("relative w-full bg-zinc-100", aspectClass)}>
                                {thumbSrc ? (
                                  <Image
                                    src={thumbSrc}
                                    alt={m.caption ?? "Review media"}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
                                    className="object-cover"
                                    unoptimized={thumbSrc.startsWith("http")}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-zinc-500">
                                    {isVideo ? (
                                      <Video className="h-8 w-8" />
                                    ) : (
                                      <ImageIcon className="h-8 w-8" />
                                    )}
                                  </div>
                                )}
                                {isVideo ? (
                                  <div className="absolute inset-0 grid place-items-center">
                                    <span className="grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white ring-1 ring-white/20">
                                      <PlayCircle className="h-7 w-7" />
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            </button>
                          );
                        };

                        return (
                          <div className="space-y-6">
                            {featured ? (
                              <div className="grid gap-4 md:grid-cols-12">
                                <div className="md:col-span-4">
                                  <Tile m={featured} aspectClass="aspect-[9/16]" />
                                </div>
                                <div className="grid gap-4 md:col-span-8 md:grid-cols-2">
                                  {topRight.map((m) => (
                                    <Tile key={m.id} m={m} aspectClass="aspect-video" />
                                  ))}
                                  {Array.from({ length: missingTopRight }).map((_, i) => (
                                    <div
                                      key={`vid-slot-${i}`}
                                      className="aspect-video w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {galleryItems.length
                                ? galleryItems
                                    .slice(0, 12)
                                    .map((m) => (
                                      <Tile key={m.id} m={m} aspectClass="aspect-square" />
                                    ))
                                : Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                      key={`gal-slot-${i}`}
                                      className="aspect-square w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50"
                                    />
                                  ))}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-zinc-900">
                          No review media has been added yet.
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">
                          Student images and videos will appear here once they are added from the
                          admin course form.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <Dialog
                open={reviewMediaOpen}
                onOpenChange={(open) => {
                  setReviewMediaOpen(open);
                  if (!open) setActiveReviewMedia(null);
                }}
              >
                <DialogContent
                  className="max-w-5xl border-zinc-800 bg-black p-0 text-white"
                  showClose
                >
                  {activeReviewMedia ? (
                    <div className="relative w-full">
                      <div className="relative aspect-video w-full bg-black md:aspect-auto md:min-h-[520px]">
                        {activeReviewMedia.kind === "image" ? (
                          <Image
                            src={activeReviewMedia.src}
                            alt={activeReviewMedia.caption ?? "Review media"}
                            fill
                            sizes="100vw"
                            className="object-contain"
                            unoptimized={activeReviewMedia.src.startsWith("http")}
                          />
                        ) : (
                          <MediaVideoPlayer
                            source={activeReviewMedia.src}
                            poster={
                              activeReviewMedia.kind === "video"
                                ? activeReviewMedia.poster
                                : undefined
                            }
                            title={activeReviewMedia.caption ?? "Student review video"}
                            access="public"
                            autoPlay
                            className="h-full w-full"
                          />
                        )}
                      </div>
                      {activeReviewMedia.caption ? (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-sm text-white/90">{activeReviewMedia.caption}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
              </Reveal>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:sticky lg:top-24 lg:order-2 lg:block lg:self-start">
              <Card className="overflow-hidden border-zinc-200 bg-white shadow-lg">
                <div className="h-1 w-full bg-gradient-to-r from-gold/70 via-gold to-gold/70" />
                <CardContent className="p-0">
                  <div className="p-4 sm:p-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
                      {levelLabel} level
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-xl font-bold tracking-tight text-zinc-900">
                      {title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                      <Users className="h-4 w-4 text-gold" />
                      <span className="font-semibold text-zinc-900">
                        {enrolledCount.toLocaleString()}
                      </span>
                      <span className="text-zinc-500">learners already enrolled</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span className="font-semibold text-zinc-900">{rating}</span>
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span>{displayCourse.reviewCount ?? "—"} reviews</span>
                      <span className="text-zinc-300">•</span>
                      <span>
                        {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span>
                        {totalQuizzes} {totalQuizzes === 1 ? "quiz" : "quizzes"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200" />

                  <div className="divide-y divide-zinc-100">
                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                        <Timer className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">
                          {durationHours}h total
                        </p>
                        <p className="text-xs text-zinc-500">Flexible, self-paced</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-50 text-lime-700 ring-1 ring-lime-100">
                        <PlayCircle className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">
                          {hasPreviewVideo ? "Contains video" : "Course media"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {hasPreviewVideo ? "Preview + full lessons" : "Cover and course assets"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                        <BadgeCheck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{certLabel}</p>
                        <p className="text-xs text-zinc-500">Designed for career growth</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-600">Price</span>
                      <div className="text-right">
                        {hasSale ? (
                          <div className="text-sm text-zinc-400 line-through">
                            {formatCurrency(priceRegular, currency)}
                          </div>
                        ) : null}
                        <div
                          className={cn("text-2xl font-bold text-zinc-900", hasSale && "text-gold")}
                        >
                          {formatCurrency(displayPrice, currency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void onEnroll()}
                    disabled={enrolling || !enrollmentEnabled}
                    className={cn(
                      "w-full whitespace-nowrap px-5 py-4 text-sm md:text-base font-extrabold font-serif tracking-wide transition",
                      "bg-gold text-gold-foreground hover:bg-gold/90",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {!enrollmentEnabled
                      ? "Enrollment closed"
                      : enrolling
                        ? isFree
                          ? "Enrolling…"
                          : "Adding…"
                        : "25% OFF - GET Full Access Now !"}
                  </button>
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* Related (full width) */}
          {relatedCourses.length > 0 && (
          <Reveal delayMs={540} className="mt-10 sm:mt-14">
            <section>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionTitle className="text-white">Related Courses</SectionTitle>
                  <p className="mt-2 text-sm text-zinc-200/80">
                    Explore more programs to support your CPHQ journey.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:shrink-0"
                  size="lg"
                >
                  <Link href="/courses">View all courses</Link>
                </Button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedCourses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          </Reveal>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-zinc-950">
          <div className="container max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8">
            <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-white">Yalla CPHQ</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200/80">
                  Empowering healthcare professionals to lead with quality and safety.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Programs</h4>
                <ul className="mt-3 space-y-2">
                  {FOOTER_PROGRAMS.map((label) => (
                    <li key={label}>
                      <Link
                        href="/courses"
                        className="text-sm text-zinc-200/80 transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white">Company</h4>
                <ul className="mt-3 space-y-2">
                  {FOOTER_COMPANY.map((label) => (
                    <li key={label}>
                      <Link
                        href="#"
                        className="text-sm text-zinc-200/80 transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white">Connect</h4>
                <div className="mt-3 flex gap-3">
                  <a
                    href="#"
                    className="text-zinc-300/80 transition hover:text-gold"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-zinc-300/80 transition hover:text-gold"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-zinc-300/80 transition hover:text-gold"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <p className="text-sm text-zinc-200/70">© 2024 Yalla CPHQ. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-zinc-200/70">
                <Link href="/privacy" className="transition hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" className="transition hover:text-white">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
