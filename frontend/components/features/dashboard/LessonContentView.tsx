"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CourseCurriculumLecture } from "@/types/course";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  PlayCircle,
  Send,
} from "lucide-react";

type LessonLink = {
  title: string;
  href: string;
};

function getYouTubeId(input?: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{8,20}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v) return v;
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIdx = parts.findIndex((part) => part === "embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
  } catch {
    // ignore invalid urls
  }
  return null;
}

export function LessonContentView({
  courseTitle,
  courseDescription,
  sectionTitle,
  sectionDescription,
  lesson,
  lessonNumber,
  totalLessons,
  previousLesson,
  nextLesson,
}: {
  courseTitle?: string;
  courseDescription?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  lesson: CourseCurriculumLecture | null;
  lessonNumber: number;
  totalLessons: number;
  previousLesson?: LessonLink | null;
  nextLesson?: LessonLink | null;
}) {
  const [aiQuery, setAiQuery] = React.useState("");
  const videoUrl = lesson?.videoUrl?.trim() ?? "";
  const videoId = getYouTubeId(videoUrl);
  const overviewText =
    sectionDescription?.trim() || courseDescription?.trim() || "Lesson details will appear here once the admin adds them.";
  const resourceName = lesson?.materialFileName?.trim() || (lesson ? `${lesson.title} materials` : "Lesson materials");

  if (!lesson) {
    return (
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
            <PlayCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900">No lessons added yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              This course does not have any lecture content in its curriculum yet.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-zinc-200">
            <Link href="/dashboard/courses">
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">
            {lesson.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {courseTitle ? `${courseTitle} · ` : ""}
            {sectionTitle || "Course lesson"}
            {totalLessons > 0 ? ` · Lesson ${lessonNumber} of ${totalLessons}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {previousLesson ? (
            <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-200">
              <Link href={previousLesson.href}>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
          ) : null}
          {nextLesson ? (
            <Button asChild size="sm" className="gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href={nextLesson.href}>
                Next lesson
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-200">
              <Link href="/dashboard/courses">
                <ArrowLeft className="h-4 w-4" />
                Back to courses
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
        <div className="relative aspect-[64/27] w-full bg-black">
          {videoId ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : videoUrl ? (
            <video className="absolute inset-0 h-full w-full" src={videoUrl} controls playsInline>
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/80">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <PlayCircle className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold">No video added yet</p>
                <p className="mt-1 text-sm text-white/60">
                  This lesson exists in the course curriculum, but its video URL is still empty.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">Lesson video</span>{" "}
            <span className="text-zinc-400">·</span>{" "}
            <span>{videoUrl ? "Ready to watch" : "Awaiting upload"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl border-zinc-200">
              <Link href="/dashboard/courses">Back</Link>
            </Button>
            {nextLesson ? (
              <Button asChild size="sm" className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href={nextLesson.href}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full justify-start bg-white border border-zinc-200 sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="ai">AI Tutor</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lesson overview</CardTitle>
              <CardDescription>Module context from the curriculum section</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 text-sm text-zinc-700">
                <div>
                  <p className="font-semibold text-zinc-900">Section</p>
                  <p className="mt-1">{sectionTitle || "Untitled section"}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Details</p>
                  <p className="mt-1 leading-6">{overviewText}</p>
                </div>
                {lesson.freeLecture ? (
                  <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Free lesson
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          {lesson.materialUrl ? (
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">{resourceName}</p>
                  <p className="text-xs text-zinc-500">Material added by admin for this lesson</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-xl border-zinc-200">
                  <a href={lesson.materialUrl} target="_blank" rel="noreferrer">
                    Open resource
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6 text-sm text-zinc-600">
                No lesson resources have been attached yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ask AI Tutor</CardTitle>
              <CardDescription>Ask anything about {lesson.title}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={`Ask about ${lesson.title}...`}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="flex-1 rounded-xl border-zinc-200 bg-white"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Summarize this lesson
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Give me a practice question
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Explain the main concept
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Common mistakes
                  </Button>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  AI tutor UI is ready for the current lesson context. Hook it to your preferred chat endpoint when
                  you want live answers.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
