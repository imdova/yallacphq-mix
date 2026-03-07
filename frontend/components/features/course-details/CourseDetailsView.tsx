"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  Facebook,
  Youtube,
  Linkedin,
  Lightbulb,
  Sparkles,
  BadgeCheck,
  PlayCircle,
  Timer,
  BookOpen,
  ThumbsUp,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import { enrollCourse, getPublicCourse, getPublicCourses } from "@/lib/dal/courses";
import { TAG_STYLES } from "@/constants/courses";
import { ROUTES } from "@/constants";
import type { Course } from "@/types/course";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { getErrorMessage } from "@/lib/api/error";

const COURSE_INCLUDES = [
  "Lifetime Access",
  "Certificate of Completion",
  "Printable Workbooks",
  "Mobile & Tablet Friendly",
  "8 Full-length Mock Exams",
  "Private Community Access",
];

const LEARN_ITEMS = [
  "Master patient safety and data management protocols.",
  "Understand the latest regulatory requirements and compliance.",
  "Develop effective performance measurement systems.",
  "Apply data analytics to healthcare quality improvement.",
  "Lead improvement and strategic planning.",
  "Full mock exam evaluation with detailed answers.",
];

const WHO_SHOULD_ATTEND = [
  { label: "Quality Managers", icon: "📋" },
  { label: "Risk Managers", icon: "🛡️" },
  { label: "Physicians", icon: "👨‍⚕️" },
  { label: "Nurses", icon: "👩‍⚕️" },
];

const WHY_JOIN = [
  {
    title: "Official Curriculum",
    text: "Aligned with the latest NABSG standards, covering every topic tested in the CPHQ examination.",
  },
  {
    title: "Expert Mentorship",
    text: "Direct access to a CPHQ certified lecturer with real-world insights and sample case studies.",
  },
  {
    title: "High Success Rate",
    text: "Our 90% pass rate reflects a methodology optimized for retention and exam readiness.",
  },
  {
    title: "Lifetime Updates",
    text: "Annual updates plus all future curriculum and exam tool improvements included.",
  },
];

const CURRICULUM_MODULES = [
  {
    id: "1",
    title: "Module 1: Quality Leadership & Integration",
    lessons: 15,
    duration: "6h 30m",
    expanded: false,
  },
  {
    id: "2",
    title: "Module 2: Data Analytics",
    lessons: 45,
    duration: "16h 30m",
    expanded: true,
    subLessons: [
      { title: "Introduction to Statistical Process Control (SPC)", duration: "3:23" },
      { title: "Mastering Stat Charts & Control Charts", duration: "4:20" },
    ],
  },
  {
    id: "3",
    title: "Module 3: Performance Improvement & Patient Safety",
    lessons: 25,
    duration: "10h 15m",
    expanded: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Rowan M.",
    quote:
      "The mock exams were identical to the real CPHQ exam. The way data analytics is explained made it simple. Passed from the first try!",
    cta: "Preview My First Try",
  },
  {
    name: "Mona Fathima S.",
    quote:
      "I was struggling with Patient Safety before I joined Yalla CPHQ. The private community's support is amazing. Highly recommended!",
    cta: "Preview My Results",
  },
];

const FOOTER_PROGRAMS = [
  "CPHQ Preparation",
  "Patient Safety Report",
  "Healthcare Analysis",
  "Risk Management",
];
const FOOTER_COMPANY = ["About Us", "Instructors", "Success Stories", "Contact"];

function formatPrice(value: number): string {
  if (value === 0) return "Free";
  return `$${value.toFixed(2)}`;
}

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
  const normalized = input
    .replace(/\r\n/g, "\n")
    .replace(/[•·]/g, "\n")
    .replace(/\t/g, " ")
    .trim();

  if (!normalized) return [];

  const parts = normalized
    .split("\n")
    .flatMap((line) => line.split(/;|\s*\|\s*/g))
    .map((s) => s.replace(/^\s*[-*]\s+/, "").trim())
    .flatMap((s) => s.split(/,(?!\d)/g).map((x) => x.trim()))
    .filter(Boolean);

  return Array.from(new Set(parts));
}

function getYouTubeId(input?: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;
  // Already an id
  if (/^[a-zA-Z0-9_-]{8,20}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v) return v;
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIdx = parts.findIndex((p) => p === "embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
  } catch {
    // ignore
  }
  return null;
}

interface YouTubePlayer {
  destroy?: () => void;
}

function YouTubePreviewPlayer({ videoId }: { videoId: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<YouTubePlayer | null>(null);

  React.useEffect(() => {
    if (!containerRef.current || !videoId) return;

    const loadYouTubeAPI = (): Promise<void> =>
      new Promise((resolve) => {
        if (
          typeof window !== "undefined" &&
          (window as unknown as { YT?: { Player?: unknown } }).YT?.Player
        ) {
          resolve();
          return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);
        (window as unknown as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady =
          () => resolve();
      });

    let mounted = true;
    loadYouTubeAPI().then(() => {
      if (!mounted || !containerRef.current) return;
      const win = window as unknown as {
        YT: {
          Player: new (
            el: string | HTMLElement,
            opts: {
              videoId: string;
              width?: string;
              height?: string;
              playerVars?: Record<string, number>;
              events?: { onReady?: (e: { target: { unMute?: () => void; playVideo?: () => void } }) => void };
            }
          ) => YouTubePlayer;
        };
      };
      playerRef.current = new win.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady(e: { target: { unMute?: () => void; playVideo?: () => void } }) {
            e.target.unMute?.();
            e.target.playVideo?.();
          },
        },
      });
    });
    return () => {
      mounted = false;
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border-4 border-gold bg-zinc-800/80 shadow-2xl shadow-gold/20 ring-2 ring-gold/30 ring-offset-2 ring-offset-zinc-900 sm:rounded-2xl">
      <div className="aspect-video min-h-0 w-full">
        <div ref={containerRef} className="h-full w-full" />
      </div>
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
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({
    "1": false,
    "2": true,
    "3": false,
  });
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollError, setEnrollError] = React.useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = React.useState(false);
  const { addToCart, isInCart } = useCart();
  const inCart = courseId ? isInCart(courseId) : false;

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        if (courseId) {
          const c = await getPublicCourse(courseId);
          if (!cancelled) setCourse(c ?? null);
        } else {
          setCourse(null);
        }
        const list = await getPublicCourses();
        if (!cancelled) {
          setAllPublicCourses(list);
          const related = list.filter((c) => c.id !== courseId).slice(0, RELATED_COUNT);
          setRelatedCourses(related);
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

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayCourse = course ?? ({} as Partial<Course>);
  const title = displayCourse.title ?? "CPHQ Preparation Program";
  const tag = displayCourse.tag ?? "Exam Prep";
  const tagStyle = TAG_STYLES[tag] ?? "bg-gold text-gold-foreground";
  const rating = displayCourse.rating ?? 4.9;
  const reviewCount = displayCourse.reviewCount ?? 0;
  const enrolledCount = displayCourse.enrolledCount ?? 2400;
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
  const courseIncludes = includesList.length ? includesList : COURSE_INCLUDES;
  const whoRaw = displayCourse.whoCanAttend?.trim() || "";
  const whoIsParagraph = whoRaw.length > 120 && /[.!?]/.test(whoRaw);
  const whoAttendList = whoIsParagraph ? [] : splitBullets(whoRaw);
  const heroBgUrl =
    (displayCourse.imageUrl?.startsWith("http") || displayCourse.imageUrl?.startsWith("data:"))
      ? displayCourse.imageUrl
      : null;
  const videoId = getYouTubeId(displayCourse.videoPreviewUrl) ?? "9JJYT8ajOKg";
  const totalModules = CURRICULUM_MODULES.length;
  const fallbackLessons = CURRICULUM_MODULES.reduce((acc, m) => acc + (m.lessons ?? 0), 0);
  const totalLessons = displayCourse.lessons ?? fallbackLessons;
  const levelLabel = displayCourse.level ?? "Intermediate";
  const certLabel = displayCourse.certificationType ?? "Certificate Included";
  const learnPreviewCount = 4;
  const learnItemsVisible = showAllLearn ? LEARN_ITEMS : LEARN_ITEMS.slice(0, learnPreviewCount);

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

  const instructorBio =
    displayCourse.whyYalla?.trim() ||
    `With extensive experience in healthcare quality and management, ${instructorName} focuses on practical, exam-ready learning designed for real-world outcomes.`;

  const instructorAvatarUrl =
    displayCourse.instructorImageUrl?.startsWith("http") || displayCourse.instructorImageUrl?.startsWith("data:")
      ? displayCourse.instructorImageUrl
      : undefined;

  const ratingHistogram = React.useMemo(() => {
    // If we don't have real per-star counts, generate a plausible distribution based on rating.
    if (!reviewCount) {
      return [
        { stars: 5, pct: 72 },
        { stars: 4, pct: 18 },
        { stars: 3, pct: 6 },
        { stars: 2, pct: 3 },
        { stars: 1, pct: 1 },
      ];
    }
    const r = Math.min(5, Math.max(0, rating));
    const w5 = Math.max(0.1, r - 3);
    const w4 = Math.max(0.1, 4.8 - Math.abs(r - 4.3));
    const w3 = Math.max(0.05, 3.8 - Math.abs(r - 3.4));
    const w2 = Math.max(0.03, 2.5 - Math.abs(r - 2.2));
    const w1 = Math.max(0.02, 1.6 - Math.abs(r - 1.3));
    const sum = w5 + w4 + w3 + w2 + w1;
    const raw = [w5, w4, w3, w2, w1].map((w) => Math.round((w / sum) * 100));
    // fix rounding drift
    const drift = 100 - raw.reduce((a, b) => a + b, 0);
    raw[0] += drift;
    return [
      { stars: 5, pct: raw[0] },
      { stars: 4, pct: raw[1] },
      { stars: 3, pct: raw[2] },
      { stars: 2, pct: raw[3] },
      { stars: 1, pct: raw[4] },
    ];
  }, [rating, reviewCount]);

  const onEnroll = async () => {
    if (!courseId) return;
    setEnrollError(null);
    setEnrollSuccess(false);

    if (status !== "authenticated" || !user) {
      const next = `/course-details?course=${encodeURIComponent(courseId)}`;
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
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
    addToCart(courseId)
      .then(() => router.push(ROUTES.CHECKOUT))
      .catch((e) => setEnrollError(getErrorMessage(e, "Failed to add to cart")))
      .finally(() => setEnrolling(false));
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
        <div className="container px-4 py-10 md:px-6">
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
        <div className="container px-4 py-10 md:px-6">
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
    <div className="min-h-screen overflow-x-hidden bg-zinc-50">
      <CoursesHeader />

      {enrollError ? (
        <div className="container px-4 pt-4 md:px-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {enrollError}
          </div>
        </div>
      ) : null}
      {enrollSuccess ? (
        <div className="container px-4 pt-4 md:px-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Enrolled successfully. Redirecting…
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-8 sm:px-6 sm:py-12 md:py-16"
        style={
          heroBgUrl
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.92), rgba(9,9,11,0.88)), url(${heroBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.16),transparent)]" />
        <div className="container relative grid gap-6 sm:gap-8 lg:grid-cols-[1fr_minmax(320px,400px)] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                  tagStyle
                )}
              >
                {tag}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
                <Clock className="mr-1.5 inline h-3.5 w-3.5" />
                {durationHours}h total
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white break-words sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl lg:leading-[1.1]">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:mt-4 sm:text-lg">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 sm:mt-8 sm:gap-6">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                  <Star className="h-5 w-5 fill-gold" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{rating}</p>
                  <p className="text-xs text-white/60">Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 text-gold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{enrolledCount.toLocaleString()}+</p>
                  <p className="text-xs text-white/60">Enrolled</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-xl border-white/25 bg-white/5 px-4 py-3 text-white hover:bg-white/10"
              >
                <a href="#curriculum" className="inline-flex items-center gap-2">
                  View Curriculum
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative flex w-full min-w-0 flex-col items-stretch gap-4 sm:items-center lg:items-end">
            <div className="w-full min-w-0 max-w-full sm:max-w-md lg:max-w-[400px]">
              <YouTubePreviewPlayer videoId={videoId} />
            </div>
          </div>
        </div>
      </section>

      {/* Main: two columns */}
      <div className="container px-4 py-8 sm:py-12 md:px-6 md:py-16">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="order-2 min-w-0 space-y-10 sm:space-y-16 lg:order-1">
            {/* What You'll Learn */}
            <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm sm:p-6 md:p-8">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
                What You&apos;ll Learn In This Course
              </h2>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:mt-6 sm:grid-cols-2">
                {learnItemsVisible.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700/10 text-sky-700">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-sm text-zinc-700">
                      <span className="block truncate sm:whitespace-normal sm:line-clamp-1 md:line-clamp-2">
                        {item}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {LEARN_ITEMS.length > learnPreviewCount ? (
                <button
                  type="button"
                  onClick={() => setShowAllLearn((v) => !v)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
                  aria-expanded={showAllLearn}
                  aria-controls="learn-outcomes"
                >
                  {showAllLearn ? "Hide learning outcomes" : "View All Learning Outcomes"}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showAllLearn && "rotate-180")} />
                </button>
              ) : null}
              <span id="learn-outcomes" className="sr-only" />
            </section>

            {/* Who Should Attend */}
            <section>
              <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl md:text-2xl">
                    Who can attend this course?
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
                    {whoIsParagraph && whoRaw
                      ? whoRaw
                      : "Earning your CPHQ certification is more than just passing an exam—it’s about showing your commitment to excellence in healthcare. This credential not only boosts your professional credibility but also equips you with the skills to make a real impact in the healthcare world."}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {(whoAttendList.length ? whoAttendList : WHO_SHOULD_ATTEND.map((x) => x.label)).map((label) => (
                      <div key={label} className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                        <span className="text-base font-medium text-zinc-900">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Curriculum */}
            <section id="curriculum" className="scroll-mt-24">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <SectionTitle>Curriculum</SectionTitle>
                <span className="text-sm text-zinc-500">
                  {totalModules} Modules · {totalLessons} Lessons · {durationHours}h
                </span>
              </div>
              <div className="mt-4 space-y-2 sm:mt-6">
                {CURRICULUM_MODULES.map((mod) => (
                  <Card
                    key={mod.id}
                    className="overflow-hidden border-zinc-200 transition hover:border-zinc-300"
                  >
                    <button
                      type="button"
                      className="flex w-full flex-col gap-2 p-3 text-left sm:flex-row sm:items-center sm:justify-between sm:p-4"
                      onClick={() => toggleModule(mod.id)}
                    >
                      <span className="font-medium text-zinc-900 min-w-0 break-words">{mod.title}</span>
                      <span className="flex shrink-0 items-center gap-2 text-sm text-zinc-500">
                        {mod.lessons} lessons · {mod.duration}
                        {expandedModules[mod.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                    {"subLessons" in mod && expandedModules[mod.id] && (
                      <div className="border-t border-zinc-100 bg-zinc-50/80 px-3 py-2 sm:px-4 sm:py-3">
                        {mod.subLessons!.map((s) => (
                          <div key={s.title} className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:justify-between sm:gap-2">
                            <span className="min-w-0 text-zinc-700">{s.title}</span>
                            <span className="shrink-0 tabular-nums text-zinc-500">{s.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section>
              <SectionTitle>About the instructor</SectionTitle>
              <Card className="mt-6 overflow-hidden border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex shrink-0 items-center justify-center">
                      <div
                        className={cn(
                          "h-20 w-20 rounded-full ring-4 ring-white shadow-sm",
                          "bg-gradient-to-br from-zinc-100 to-zinc-200"
                        )}
                        style={
                          instructorAvatarUrl
                            ? { backgroundImage: `url(${instructorAvatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                            : undefined
                        }
                        aria-hidden
                      >
                        {!instructorAvatarUrl ? (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-600">
                            {instructorName
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((s) => s[0]!.toUpperCase())
                              .join("")}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-700">
                        About your course publisher
                      </p>
                      <button
                        type="button"
                        className="mt-1 inline-flex max-w-full items-baseline gap-2 text-left"
                        onClick={() => setShowInstructorMore(true)}
                      >
                        <span className="truncate text-lg font-bold text-zinc-900 underline underline-offset-4">
                          {instructorName}
                        </span>
                        <span className="text-sm font-semibold text-zinc-500">Stats</span>
                      </button>

                      <p className="mt-1 text-sm text-zinc-500">{instructorTitle}</p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700">
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gold" />
                          <span className="font-semibold">{instructorLearners.toLocaleString()}</span>
                          <span className="text-zinc-500">learners</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gold" />
                          <span className="font-semibold">{instructorCourseCount}</span>
                          <span className="text-zinc-500">courses</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-gold" />
                          <span className="font-semibold">{Math.max(0, instructorLearners).toLocaleString()}</span>
                          <span className="text-zinc-500">learners benefited</span>
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                        {showInstructorMore ? instructorBio : `${instructorBio.slice(0, 150)}${instructorBio.length > 150 ? "…" : ""}`}
                        {instructorBio.length > 150 ? (
                          <button
                            type="button"
                            onClick={() => setShowInstructorMore((v) => !v)}
                            className="ml-2 font-semibold text-zinc-700 hover:underline"
                          >
                            {showInstructorMore ? "Read less" : "Read more"}
                          </button>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Reviews */}
            <section>
              <SectionTitle>Students Reviews &amp; Feedback</SectionTitle>
              <Card className="mt-6 overflow-hidden border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-10">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Overall rating</p>
                          <div className="mt-2 flex items-baseline gap-3">
                            <span className="text-4xl font-bold tracking-tight text-zinc-900">
                              {Math.round(rating * 10) / 10}
                            </span>
                            <div className="flex flex-col gap-1">
                              <div className="flex gap-0.5 text-gold" aria-label={`${rating} out of 5`}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star key={i} className={cn("h-4 w-4", i <= Math.round(rating) && "fill-current")} />
                                ))}
                              </div>
                              <p className="text-sm text-zinc-600">
                                {reviewCount ? `${reviewCount.toLocaleString()} reviews` : "No reviews yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 space-y-2.5">
                        {ratingHistogram.map(({ stars, pct }) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="w-10 text-sm font-semibold text-zinc-700">{stars}★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200">
                              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                            </div>
                            <span className="w-10 text-right text-sm text-zinc-600">{pct}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-zinc-600">
                        <MessageSquare className="h-4 w-4 text-zinc-500" />
                        <span>Real feedback helps students choose confidently.</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">Highlighted reviews</p>
                          <p className="mt-1 text-sm text-zinc-600">
                            A snapshot of what learners say about this course.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {TESTIMONIALS.slice(0, 2).map((t) => (
                          <Card key={t.name} className="overflow-hidden border-zinc-200">
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-zinc-900">{t.name}</p>
                                  <div className="mt-1 flex gap-0.5 text-gold" aria-hidden>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                  Verified learner
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                &ldquo;{t.quote}&rdquo;
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <p className="text-sm font-semibold text-zinc-900">Want to see more?</p>
                        <p className="mt-1 text-sm text-zinc-600">
                          Reviews will expand as more learners complete and rate the course.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button asChild variant="outline" className="rounded-xl border-zinc-200">
                            <Link href="#curriculum">View curriculum</Link>
                          </Button>
                          <Button asChild className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                            <Link href="/dashboard/support">Contact support</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Related */}
            {relatedCourses.length > 0 && (
              <section>
                <SectionTitle>Related Courses</SectionTitle>
                <p className="mt-2 text-sm text-zinc-600">
                  Explore more programs to support your CPHQ journey.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {relatedCourses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-xl border-zinc-300"
                  size="lg"
                >
                  <Link href="/courses">View all courses</Link>
                </Button>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
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
                    <span className="font-semibold text-zinc-900">{enrolledCount.toLocaleString()}</span>
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
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200" />

                <div className="divide-y divide-zinc-100">
                  <div className="flex items-center gap-3 p-4 sm:p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                      <Timer className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{durationHours}h total</p>
                      <p className="text-xs text-zinc-500">Flexible, self-paced</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 sm:p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-50 text-lime-700 ring-1 ring-lime-100">
                      <PlayCircle className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">Contains video</p>
                      <p className="text-xs text-zinc-500">Preview + full lessons</p>
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
                      <div className={cn("text-2xl font-bold text-zinc-900", hasSale && "text-gold")}>
                        {formatCurrency(displayPrice, currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void onEnroll()}
                  disabled={enrolling}
                  className={cn(
                    "w-full px-5 py-4 text-base font-semibold uppercase tracking-wide transition",
                    "bg-gold text-gold-foreground hover:bg-gold/90",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {enrolling
                    ? isFree
                      ? "Enrolling…"
                      : "Adding…"
                    : isFree
                      ? "Start Learning"
                      : inCart
                        ? "Proceed to checkout"
                        : "Start Learning"}
                </button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="container px-4 py-8 sm:py-10 md:px-6 md:py-12">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <span className="font-bold text-zinc-900">Yalla CPHQ</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Empowering healthcare professionals to lead with quality and safety.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Programs</h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_PROGRAMS.map((label) => (
                  <li key={label}>
                    <Link
                      href="/courses"
                      className="text-sm text-zinc-600 transition hover:text-zinc-900"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Company</h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_COMPANY.map((label) => (
                  <li key={label}>
                    <Link href="#" className="text-sm text-zinc-600 transition hover:text-zinc-900">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Connect</h4>
              <div className="mt-3 flex gap-3">
                <a
                  href="#"
                  className="text-zinc-500 transition hover:text-zinc-900"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-zinc-500 transition hover:text-zinc-900"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-zinc-500 transition hover:text-zinc-900"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 sm:flex-row">
            <p className="text-sm text-zinc-500">© 2024 Yalla CPHQ. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="/privacy" className="transition hover:text-zinc-900">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-zinc-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
