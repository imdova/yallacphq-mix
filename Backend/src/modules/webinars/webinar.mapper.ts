import type { ApiWebinar } from '../../contracts';
import type { WebinarDocument } from './schemas/webinar.schema';

export function toApiWebinar(webinar: WebinarDocument): ApiWebinar {
  return {
    id: webinar.id,
    title: webinar.title,
    slug: webinar.slug,
    excerpt: webinar.excerpt ?? '',
    description: webinar.description ?? '',
    status: webinar.status,
    startsAt: webinar.startsAt.toISOString(),
    timezoneLabel: webinar.timezoneLabel ?? 'GMT+3',
    speakerName: webinar.speakerName,
    speakerTitle: webinar.speakerTitle ?? '',
    coverImageUrl: webinar.coverImageUrl ?? '',
    videoUrl: webinar.videoUrl ?? '',
    registrationEnabled: webinar.registrationEnabled ?? true,
    seatsLeft:
      webinar.seatsLeft === null || webinar.seatsLeft === undefined
        ? null
        : webinar.seatsLeft,
    isFeatured: webinar.isFeatured ?? false,
    learnPoints: (webinar.learnPoints ?? []).map((point) => ({
      id: point.id,
      title: point.title,
      description: point.description,
    })),
    trustedBy: webinar.trustedBy ?? [],
    stats: (webinar.stats ?? []).map((stat) => ({
      id: stat.id,
      value: stat.value,
      label: stat.label,
    })),
    createdAt:
      (webinar as unknown as { createdAt?: Date }).createdAt?.toISOString?.() ??
      new Date(0).toISOString(),
    lastUpdated:
      (webinar as unknown as { updatedAt?: Date }).updatedAt?.toISOString?.() ??
      (webinar as unknown as { createdAt?: Date }).createdAt?.toISOString?.() ??
      new Date(0).toISOString(),
  };
}
