"use client";

import { MediaVideoPlayer } from "@/components/shared/MediaVideoPlayer";

export function HeroVideoPlayer({
  videoUrl,
  title = "Webinar video",
}: {
  videoUrl?: string;
  title?: string;
}) {
  return (
    <div className="flex size-full items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border-2 border-gold bg-black shadow-2xl sm:rounded-xl sm:border-4">
        <div className="relative aspect-video w-full bg-black">
          <MediaVideoPlayer
            source={videoUrl}
            title={title}
            access="public"
            fallback={
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/75">
                Video preview will appear here after you add a webinar VdoCipher ID or video URL.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
