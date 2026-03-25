"use client";

function toEmbedUrl(videoUrl?: string) {
  if (!videoUrl?.trim()) return "";

  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/\//g, "");
      return id ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1` : videoUrl;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}?rel=0&playsinline=1` : videoUrl;
      }
      if (url.pathname.startsWith("/embed/")) {
        return videoUrl;
      }
    }
    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function HeroVideoPlayer({
  videoUrl,
  title = "Webinar video",
}: {
  videoUrl?: string;
  title?: string;
}) {
  const embedUrl = toEmbedUrl(videoUrl);

  return (
    <div className="flex size-full items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border-2 border-gold bg-black shadow-2xl sm:rounded-xl sm:border-4">
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/75">
              Video preview will appear here after you add a webinar video URL.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
