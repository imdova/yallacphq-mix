"use client";

const YOUTUBE_EMBED =
  "https://www.youtube.com/embed/R9-6cBqzczo?rel=0&autoplay=1&mute=0&playsinline=1";

export function HeroVideoPlayer() {
  return (
    <div className="flex size-full items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border-2 border-gold bg-black shadow-2xl sm:rounded-xl sm:border-4">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={YOUTUBE_EMBED}
            title="CPHQ Webinar"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
