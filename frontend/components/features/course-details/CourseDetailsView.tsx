"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Shield,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { CourseCard } from "@/components/features/courses/CourseCard";
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
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({
    "1": false,
    "2": true,
    "3": false,
  });
  const [sampleEmail, setSampleEmail] = React.useState("");
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
  const enrolledCount = displayCourse.enrolledCount ?? 2400;
  const instructorName = displayCourse.instructorName ?? "Dr Ahmed Habib";
  const instructorTitle = displayCourse.instructorTitle ?? "CPHQ, Healthcare Quality Director";
  const durationHours = displayCourse.durationHours ?? 12;
  const priceRegular = displayCourse.priceRegular ?? 399.99;
  const priceSale = displayCourse.priceSale;
  const hasSale = priceSale != null && priceSale > 0 && priceRegular > priceSale;
  const displayPrice = hasSale ? priceSale : priceRegular;
  const isFree = displayPrice === 0;

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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="container flex h-14 min-h-[3.5rem] items-center justify-between gap-2 px-4 sm:gap-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-4">
            <Link
              href="/courses"
              className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Courses
            </Link>
            <span className="hidden shrink-0 text-zinc-300 sm:inline">/</span>
            <span
              className="truncate text-sm font-medium text-zinc-900 min-w-0 max-w-[140px] sm:max-w-[220px] md:max-w-none"
              title={title}
            >
              {title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden text-zinc-600 sm:inline-flex">
              <Link href="/#contact">Contact</Link>
            </Button>
            {status === "authenticated" && inCart ? (
              <Button asChild variant="outline" size="sm" className="rounded-lg border-emerald-300 bg-emerald-50 text-emerald-700">
                <Link href="/cart">
                  <Check className="mr-1.5 h-4 w-4" />
                  In cart
                </Link>
              </Button>
            ) : status === "authenticated" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200"
                onClick={() => courseId && void addToCart(courseId)}
              >
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                Add to cart
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-lg border-zinc-200">
                <Link href={`/auth/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/courses")}`}>
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  Add to cart
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              className="rounded-lg bg-gold px-3 font-semibold text-gold-foreground hover:bg-gold/90 sm:px-4"
              onClick={() => void onEnroll()}
              disabled={enrolling}
            >
              {enrolling ? (isFree ? "Enrolling…" : "Adding…") : isFree ? "Enroll for free" : inCart ? "Proceed to checkout" : "Enroll Now"}
            </Button>
          </div>
        </div>
      </header>

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
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.12),transparent)]" />
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
              The most comprehensive guide to mastering Healthcare Quality Management. Pass your
              CPHQ exam on the first attempt.
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
            </div>
          </div>
          <div className="relative flex w-full min-w-0 flex-col items-stretch gap-4 sm:items-center lg:items-end">
            <div className="w-full min-w-0 max-w-full sm:max-w-md lg:max-w-[400px]">
              <YouTubePreviewPlayer videoId="9JJYT8ajOKg" />
            </div>
            <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:max-w-[400px] lg:justify-end">
              {status === "authenticated" && inCart ? (
                <Button asChild variant="outline" className="w-full rounded-xl border-emerald-300 bg-emerald-50/20 text-white hover:bg-emerald-50/30 sm:w-auto">
                  <Link href="/cart">
                    <Check className="mr-2 h-4 w-4" />
                    In cart
                  </Link>
                </Button>
              ) : status === "authenticated" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                  onClick={() => courseId && void addToCart(courseId)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
                  <Link href={`/auth/login?next=${encodeURIComponent("/course-details?course=" + (courseId ?? ""))}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to cart
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                className="w-full rounded-xl bg-gold px-5 py-5 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90 sm:w-auto sm:px-6 sm:py-6"
                onClick={() => void onEnroll()}
                disabled={enrolling}
              >
                {enrolling ? (isFree ? "Enrolling…" : "Adding…") : isFree ? "Enroll for free" : inCart ? "Proceed to checkout" : "Enroll Now"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                <a href="#curriculum">View Curriculum</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main: two columns */}
      <div className="container px-4 py-8 sm:py-12 md:px-6 md:py-16">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="min-w-0 space-y-10 sm:space-y-16">
            {/* What You'll Learn */}
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 md:p-8">
              <SectionTitle icon={Sparkles}>What You&apos;ll Learn</SectionTitle>
              <ul className="mt-4 grid gap-2 sm:mt-6 sm:grid-cols-2 sm:gap-3">
                {LEARN_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2 rounded-lg bg-zinc-50/80 p-3 sm:gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Who Should Attend */}
            <section>
              <SectionTitle>Who Should Attend</SectionTitle>
              <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
                {WHO_SHOULD_ATTEND.map(({ label, icon }) => (
                  <Card
                    key={label}
                    className="overflow-hidden border-zinc-200 transition hover:border-gold/30 hover:shadow-md"
                  >
                    <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                      <span className="text-2xl" aria-hidden>
                        {icon}
                      </span>
                      <p className="font-semibold text-zinc-900">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Why Join + Sample */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1fr_320px]">
              <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-white sm:rounded-2xl sm:p-6 md:p-8">
                <SectionTitle className="!text-white">Why Join This Course?</SectionTitle>
                <div className="mt-6 space-y-5">
                  {WHY_JOIN.map(({ title, text }) => (
                    <div key={title} className="flex gap-4 rounded-xl bg-white/5 p-4">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                      <div>
                        <h3 className="font-semibold uppercase tracking-wider text-gold">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/80">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <Card className="h-fit overflow-hidden border-zinc-700 bg-zinc-900">
                <CardContent className="p-4 text-white sm:p-6">
                  <h3 className="text-lg font-semibold">Free Sample Lesson</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Get a taste of the course. No commitment.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={sampleEmail}
                      onChange={(e) => setSampleEmail(e.target.value)}
                      className="rounded-lg border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-400 focus-visible:ring-gold"
                    />
                    <Button className="w-full rounded-lg bg-gold text-gold-foreground hover:bg-gold/90">
                      Send Sample
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Curriculum */}
            <section id="curriculum">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <SectionTitle>Curriculum</SectionTitle>
                <span className="text-sm text-zinc-500">12 Modules · 140 Lessons · 47h</span>
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

            {/* Testimonials */}
            <section>
              <SectionTitle>Student Stories</SectionTitle>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {TESTIMONIALS.map((t) => (
                  <Card key={t.name} className="overflow-hidden border-zinc-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gold/30 to-gold/10" />
                        <div>
                          <p className="font-semibold text-zinc-900">{t.name}</p>
                          <div className="flex gap-0.5 text-gold">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full rounded-lg border-zinc-200"
                      >
                        {t.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section>
              <SectionTitle>Instructor</SectionTitle>
              <Card className="mt-6 overflow-hidden border-zinc-200">
                <CardContent className="p-4 sm:p-6 md:flex md:gap-8">
                  <div className="h-24 w-24 shrink-0 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 md:h-28 md:w-28" />
                  <div className="mt-4 min-w-0 md:mt-0">
                    <h3 className="text-lg font-bold text-zinc-900">{instructorName}</h3>
                    <p className="text-sm text-zinc-500">{instructorTitle}</p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                      With over 20 years of experience in healthcare quality and management across
                      leading international hospitals, our instructor has mentored thousands of
                      students globally. The methodology focuses on practical application and
                      critical thinking required for the CPHQ exam.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-6 text-sm text-zinc-500">
                      <span>15+ Years</span>
                      <span>42 Courses</span>
                      <span className="flex items-center gap-1 font-medium text-gold">
                        {rating} Rating
                      </span>
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
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden border-zinc-200 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-zinc-900">Course includes</h3>
                <ul className="mt-4 space-y-2.5">
                  {COURSE_INCLUDES.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-700">
                      <Check className="h-4 w-4 shrink-0 text-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-zinc-50 p-4">
                  {hasSale && (
                    <span className="text-base text-zinc-400 line-through">
                      {formatPrice(priceRegular)}
                    </span>
                  )}
                  <p className={cn("text-2xl font-bold text-zinc-900", hasSale && "text-gold")}>
                    {formatPrice(displayPrice)}
                  </p>
                </div>
                <Button
                  asChild
                  className="mt-6 w-full rounded-xl bg-gold py-6 text-base font-semibold text-gold-foreground shadow-md hover:bg-gold/90"
                >
                  <Link href={ROUTES.CHECKOUT}>Enroll Now</Link>
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Shield className="h-4 w-4" />
                  Money-back guarantee
                </div>
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
