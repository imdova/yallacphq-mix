"use client";

import { MediaVideoPlayer } from "@/components/shared/MediaVideoPlayer";

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
  return (
    <div
      className={[
        "relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-black",
        className,
      ].join(" ")}
    >
      <MediaVideoPlayer source={url} title={title} access="public" autoPlay className="h-full w-full" />
    </div>
  );
}

