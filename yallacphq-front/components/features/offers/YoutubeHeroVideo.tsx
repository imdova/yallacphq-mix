"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";

function getYouTubeId(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it's already an ID (11 chars typical), accept it.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const match =
    trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);

  return match?.[1] ?? null;
}

type YoutubeHeroVideoProps = {
  url: string;
  title?: string;
  className?: string;
};

export function YoutubeHeroVideo({
  url,
  title = "Video",
  className = "",
}: YoutubeHeroVideoProps) {
  const [muted, setMuted] = React.useState(false);
  const id = React.useMemo(() => getYouTubeId(url), [url]);

  const src = React.useMemo(() => {
    if (!id) return "";
    const params = new URLSearchParams({
      autoplay: "1",
      mute: muted ? "1" : "0",
      controls: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }, [id, muted]);

  if (!id) {
    return (
      <div
        className={[
          "flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900",
          className,
        ].join(" ")}
      >
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-white underline underline-offset-4"
        >
          Open video
        </a>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-black",
        className,
      ].join(" ")}
    >
      <iframe
        key={muted ? "muted" : "unmuted"}
        className="absolute inset-0 h-full w-full"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="absolute left-3 top-3">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900">
          {title}
        </span>
      </div>

      <div className="absolute bottom-3 right-3">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-white"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Unmute" : "Sound on"}
        </button>
      </div>
    </div>
  );
}

