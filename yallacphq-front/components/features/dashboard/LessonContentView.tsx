"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bookmark,
  ArrowRight,
  Send,
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
} from "lucide-react";

const takeaways = [
  "The 80/20 Rule: Focus on the \"Vital Few\" (20%) of causes that contribute to 80% of the effects/problems.",
  "Visualization: Bars are arranged in descending order from left to right, paired with a cumulative line graph.",
  "Clinical Application: Prioritizing readmission causes or surgical complications in a hospital setting.",
];

const resources = [
  { name: "Pareto_Worksheet.pdf", size: "4.2 MB", label: "Interactive PDF", icon: FileText },
  { name: "Quality_Tools_List.xlsx", size: "1.8 MB", label: "Template", icon: FileSpreadsheet },
  { name: "Study_Notes_M2.txt", size: "12 KB", label: "Text File", icon: FileCode },
];

const YOUTUBE_VIDEO_ID = "9JJYT8ajOKg";

export function LessonContentView() {
  const [aiQuery, setAiQuery] = React.useState("");

  return (
    <div className="min-w-0 space-y-6">
      {/* Title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">
            2.4 Pareto Chart Analysis &amp; Application
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Topic: Healthcare Quality Identification Tools
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-200">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 rounded-xl border-zinc-200"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            Mark complete
          </Button>
          <Button asChild size="sm" className="gap-2 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <Link href="#">
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Video */}
      <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
        <div className="relative aspect-[64/27] w-full bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
            title="Lesson video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-900">Lesson video</span>{" "}
            <span className="text-zinc-400">·</span>{" "}
            <span>~28 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl border-zinc-200">
              <Link href="/dashboard/courses">Back</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href="#">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
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
              <CardTitle className="text-base">Key takeaways</CardTitle>
              <CardDescription>Quick summary for faster recall</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
                {takeaways.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Card key={r.name} className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{r.name}</p>
                    <p className="text-xs text-zinc-500">
                      {r.size} · {r.label}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl border-zinc-200">
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ask AI Tutor</CardTitle>
              <CardDescription>Ask anything about Pareto charts</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Explain the cumulative percentage calculation..."
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
                    What is the 80/20 rule?
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Give me a practice question
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Real hospital example
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full border-zinc-200 text-xs">
                    Common mistakes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
