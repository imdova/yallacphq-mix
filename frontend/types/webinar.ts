export type WebinarStatus = "draft" | "published";

export type WebinarLearnPoint = {
  id: string;
  title: string;
  description: string;
};

export type WebinarStat = {
  id: string;
  value: string;
  label: string;
};

export type StoredWebinar = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  status: WebinarStatus;
  startsAt: string;
  timezoneLabel: string;
  speakerName: string;
  speakerTitle: string;
  coverImageUrl: string;
  videoUrl: string;
  registrationEnabled: boolean;
  seatsLeft: number | null;
  isFeatured: boolean;
  learnPoints: WebinarLearnPoint[];
  trustedBy: string[];
  stats: WebinarStat[];
  createdAt: string;
  lastUpdated: string;
};

export type CreateWebinarInput = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  status: WebinarStatus;
  startsAt: string;
  timezoneLabel: string;
  speakerName: string;
  speakerTitle: string;
  coverImageUrl: string;
  videoUrl: string;
  registrationEnabled: boolean;
  seatsLeft: number | null;
  isFeatured: boolean;
  learnPoints: WebinarLearnPoint[];
  trustedBy: string[];
  stats: WebinarStat[];
};

export type UpdateWebinarInput = Partial<CreateWebinarInput>;
