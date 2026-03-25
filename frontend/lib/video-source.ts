export type ParsedVideoSource =
  | { kind: "empty"; raw: "" }
  | { kind: "youtube"; raw: string; videoId: string }
  | { kind: "direct"; raw: string; url: string }
  | { kind: "vdocipher"; raw: string; videoId: string };

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const VDOCIPHER_PREFIX_REGEX = /^vdocipher:/i;
const VDOCIPHER_RAW_ID_REGEX =
  /^(?:[a-f0-9]{24,64}|\d{8,}|[A-Za-z0-9_-]{20,})$/i;

export function getYouTubeVideoId(input?: string): string | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;

  if (YOUTUBE_ID_REGEX.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID_REGEX.test(v)) return v;
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_REGEX.test(id) ? id : null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIdx = parts.findIndex((part) => part === "embed");
    if (embedIdx >= 0 && parts[embedIdx + 1] && YOUTUBE_ID_REGEX.test(parts[embedIdx + 1])) {
      return parts[embedIdx + 1];
    }
  } catch {
    // Ignore invalid URLs.
  }

  return null;
}

export function getVdoCipherVideoId(input?: string): string | null {
  const raw = input?.trim() ?? "";
  if (!raw) return null;

  if (VDOCIPHER_PREFIX_REGEX.test(raw)) {
    const videoId = raw.replace(VDOCIPHER_PREFIX_REGEX, "").trim();
    return videoId || null;
  }

  if (getYouTubeVideoId(raw)) return null;

  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return null;
  } catch {
    return VDOCIPHER_RAW_ID_REGEX.test(raw) ? raw : null;
  }

  return null;
}

export function parseVideoSource(input?: string): ParsedVideoSource {
  const raw = input?.trim() ?? "";
  if (!raw) return { kind: "empty", raw: "" };

  const vdoCipherId = getVdoCipherVideoId(raw);
  if (vdoCipherId) {
    return {
      kind: "vdocipher",
      raw,
      videoId: vdoCipherId,
    };
  }

  const youtubeId = getYouTubeVideoId(raw);
  if (youtubeId) {
    return {
      kind: "youtube",
      raw,
      videoId: youtubeId,
    };
  }

  return {
    kind: "direct",
    raw,
    url: raw,
  };
}

export function getYouTubeThumbnailUrl(input?: string): string | null {
  const videoId = getYouTubeVideoId(input);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}
