export type ReviewMediaKind = "image" | "video" | "youtube";

export type ReviewMediaItem = {
  id: string;
  /** Optional: show only for specific course id. */
  courseId?: string;
  kind: ReviewMediaKind;
  /** For image/video: URL path (usually in /public). For youtube: url or id. */
  src: string;
  caption?: string;
  /** Optional thumbnail for video items. */
  poster?: string;
};

/**
 * Put WhatsApp screenshots / videos into `frontend/public/reviews/`
 * and register them here.
 *
 * Example:
 * { id: "wa-1", courseId: "69aa...", kind: "image", src: "/reviews/wa-1.png", caption: "WhatsApp feedback" }
 * { id: "vid-1", kind: "video", src: "/reviews/review.mp4", poster: "/reviews/review.jpg" }
 * { id: "yt-1", kind: "youtube", src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
 */
export const REVIEW_MEDIA: ReviewMediaItem[] = [];

// Demo items (replace with your real WhatsApp media).
// Put files into `frontend/public/reviews/` and update `src`/`poster` below.
export const DEFAULT_REVIEW_MEDIA: ReviewMediaItem[] = [
  // Videos (YouTube) - these populate the top layout tiles
  { id: "rev-yt-1", kind: "youtube", src: "9JJYT8ajOKg", caption: "Student video feedback" },
  { id: "rev-yt-2", kind: "youtube", src: "9JJYT8ajOKg", caption: "Course experience clip" },
  { id: "rev-yt-3", kind: "youtube", src: "9JJYT8ajOKg", caption: "Quick review" },
  { id: "rev-yt-4", kind: "youtube", src: "9JJYT8ajOKg", caption: "Success story" },
  { id: "rev-yt-5", kind: "youtube", src: "9JJYT8ajOKg", caption: "More feedback" },
  { id: "rev-yt-6", kind: "youtube", src: "9JJYT8ajOKg", caption: "Student feedback" },
  { id: "rev-yt-7", kind: "youtube", src: "9JJYT8ajOKg", caption: "Another review" },
];

export function getReviewMediaForCourse(courseId?: string | null): ReviewMediaItem[] {
  const id = (courseId ?? "").trim();
  const base = REVIEW_MEDIA.length ? REVIEW_MEDIA : DEFAULT_REVIEW_MEDIA;
  if (!id) return base.filter((m) => !m.courseId);
  const scoped = base.filter((m) => (m.courseId ?? "").trim() === id);
  const global = base.filter((m) => !m.courseId);
  return [...scoped, ...global];
}

export function youtubeEmbedUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const id = youtubeIdFrom(raw);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIdx = parts.findIndex((p) => p === "embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) {
      return `https://www.youtube-nocookie.com/embed/${parts[embedIdx + 1]}`;
    }
  } catch {
    // ignore
  }
  return null;
}

export function youtubeIdFrom(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
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

export function youtubeThumbUrl(input: string): string | null {
  const id = youtubeIdFrom(input);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

