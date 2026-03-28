"use client";

import * as React from "react";
import { AlertCircle, Loader2, PlayCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";
import { parseVideoSource } from "@/lib/video-source";
import { cn } from "@/lib/utils";

type MediaVideoPlayerProps = {
  source?: string;
  title: string;
  access?: "public" | "course_lesson";
  courseId?: string;
  /** When set with `access="course_lesson"`, server may allow VdoCipher OTP for marked free previews. */
  lessonId?: string;
  autoPlay?: boolean;
  poster?: string;
  className?: string;
  fallback?: React.ReactNode;
  /**
   * Light UX friction for protected playback (not real DRM). Does not stop DevTools or the Network tab.
   * @default true when access is "course_lesson"
   */
  deterCasualCopy?: boolean;
};

type VdoCipherOtpResponse = {
  otp: string;
  playbackInfo: string;
  embedUrl: string;
};

export function MediaVideoPlayer({
  source,
  title,
  access = "public",
  courseId,
  lessonId,
  autoPlay = false,
  poster,
  className,
  fallback,
  deterCasualCopy: deterCasualCopyProp,
}: MediaVideoPlayerProps) {
  const deterCasualCopy = deterCasualCopyProp ?? access === "course_lesson";
  const parsed = React.useMemo(() => parseVideoSource(source), [source]);
  const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadVdoCipherOtp(videoId: string) {
      setLoading(true);
      setError(null);
      setEmbedUrl(null);

      try {
        const res = await fetch("/api/videos/vdocipher/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId,
            access,
            courseId,
            ...(lessonId ? { lessonId } : {}),
          }),
        });

        const data = (await res.json().catch(() => ({}))) as Partial<VdoCipherOtpResponse> & {
          message?: string;
        };

        if (!res.ok) {
          throw new Error(
            typeof data?.message === "string"
              ? data.message
              : "Failed to load the secure video",
          );
        }

        if (!cancelled) {
          setEmbedUrl(typeof data.embedUrl === "string" ? data.embedUrl : null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load the secure video"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (parsed.kind === "vdocipher") {
      void loadVdoCipherOtp(parsed.videoId);
      return () => {
        cancelled = true;
      };
    }

    setLoading(false);
    setError(null);
    setEmbedUrl(null);
    return () => {
      cancelled = true;
    };
  }, [access, courseId, lessonId, parsed]);

  if (parsed.kind === "empty") {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 text-center text-white/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <PlayCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-semibold">No video added yet</p>
              <p className="mt-1 text-sm text-white/60">
                Add a VdoCipher video ID, YouTube link, or direct video URL.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const shellProps = deterCasualCopy
    ? {
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
        className: cn("relative h-full w-full select-none", className),
      }
    : { className: cn("relative h-full w-full", className) };

  if (parsed.kind === "youtube") {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      ...(autoPlay ? { autoplay: "1" } : {}),
    });

    return (
      <div {...shellProps}>
        <iframe
          className="pointer-events-auto absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${parsed.videoId}?${params.toString()}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (parsed.kind === "direct") {
    return (
      <div {...shellProps}>
        <video
          className="h-full w-full object-contain"
          src={parsed.url}
          poster={poster}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          autoPlay={autoPlay}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div {...shellProps}>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/80">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading secure video...
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white/85">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">Couldn&apos;t load this video</p>
              <p className="mt-1 text-sm text-white/65">{error}</p>
            </div>
          </div>
        </div>
      ) : embedUrl ? (
        <iframe
          className="pointer-events-auto absolute inset-0 h-full w-full"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
    </div>
  );
}
