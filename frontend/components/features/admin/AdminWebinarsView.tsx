"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, Loader2, Pencil, Plus, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/api/error";
import { createWebinar, deleteWebinar, getAdminWebinars, updateWebinar } from "@/lib/dal/webinars";
import type { CreateWebinarInput, StoredWebinar, WebinarLearnPoint, WebinarStat } from "@/types/webinar";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  status: "draft" | "published";
  startsAtLocal: string;
  timezoneLabel: string;
  speakerName: string;
  speakerTitle: string;
  coverImageUrl: string;
  videoUrl: string;
  registrationEnabled: boolean;
  seatsLeft: string;
  isFeatured: boolean;
  learnPointsText: string;
  trustedByText: string;
  statsText: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  description: "",
  status: "draft",
  startsAtLocal: "",
  timezoneLabel: "GMT+3",
  speakerName: "",
  speakerTitle: "",
  coverImageUrl: "",
  videoUrl: "",
  registrationEnabled: true,
  seatsLeft: "",
  isFeatured: false,
  learnPointsText: "",
  trustedByText: "",
  statsText: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toLocalDateTimeInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromLocalDateTimeInput(value: string) {
  return new Date(value).toISOString();
}

function buildLearnPointsText(items: WebinarLearnPoint[]) {
  return items.map((item) => `${item.title} | ${item.description}`).join("\n");
}

function parseLearnPoints(text: string): WebinarLearnPoint[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, ...rest] = line.split("|");
      return {
        id: `learn_${index + 1}`,
        title: title?.trim() ?? "",
        description: rest.join("|").trim(),
      };
    })
    .filter((item) => item.title && item.description);
}

function buildTrustedByText(items: string[]) {
  return items.join("\n");
}

function parseTrustedBy(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildStatsText(items: WebinarStat[]) {
  return items.map((item) => `${item.value} | ${item.label}`).join("\n");
}

function parseStats(text: string): WebinarStat[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [value, ...rest] = line.split("|");
      return {
        id: `stat_${index + 1}`,
        value: value?.trim() ?? "",
        label: rest.join("|").trim(),
      };
    })
    .filter((item) => item.value && item.label);
}

function webinarToForm(webinar: StoredWebinar): FormState {
  return {
    title: webinar.title,
    slug: webinar.slug,
    excerpt: webinar.excerpt,
    description: webinar.description,
    status: webinar.status,
    startsAtLocal: toLocalDateTimeInput(webinar.startsAt),
    timezoneLabel: webinar.timezoneLabel,
    speakerName: webinar.speakerName,
    speakerTitle: webinar.speakerTitle,
    coverImageUrl: webinar.coverImageUrl,
    videoUrl: webinar.videoUrl,
    registrationEnabled: webinar.registrationEnabled,
    seatsLeft: webinar.seatsLeft === null ? "" : String(webinar.seatsLeft),
    isFeatured: webinar.isFeatured,
    learnPointsText: buildLearnPointsText(webinar.learnPoints),
    trustedByText: buildTrustedByText(webinar.trustedBy),
    statsText: buildStatsText(webinar.stats),
  };
}

function formToPayload(form: FormState): CreateWebinarInput {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt.trim(),
    description: form.description.trim(),
    status: form.status,
    startsAt: fromLocalDateTimeInput(form.startsAtLocal),
    timezoneLabel: form.timezoneLabel.trim() || "GMT+3",
    speakerName: form.speakerName.trim(),
    speakerTitle: form.speakerTitle.trim(),
    coverImageUrl: form.coverImageUrl.trim(),
    videoUrl: form.videoUrl.trim(),
    registrationEnabled: form.registrationEnabled,
    seatsLeft: form.seatsLeft.trim() ? Number(form.seatsLeft.trim()) : null,
    isFeatured: form.isFeatured,
    learnPoints: parseLearnPoints(form.learnPointsText),
    trustedBy: parseTrustedBy(form.trustedByText),
    stats: parseStats(form.statsText),
  };
}

function TextArea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[
        "min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function AdminWebinarsView() {
  const [items, setItems] = React.useState<StoredWebinar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState("");
  const [saveError, setSaveError] = React.useState("");
  const [saveMessage, setSaveMessage] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const loadItems = React.useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const webinars = await getAdminWebinars();
      setItems(webinars);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Failed to load webinars."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const startCreate = React.useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError("");
    setSaveMessage("");
    setSlugTouched(false);
  }, []);

  const startEdit = React.useCallback((webinar: StoredWebinar) => {
    setEditingId(webinar.id);
    setForm(webinarToForm(webinar));
    setSaveError("");
    setSaveMessage("");
    setSlugTouched(true);
  }, []);

  const onFieldChange = React.useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((current) => {
        if (key === "title" && !slugTouched) {
          return {
            ...current,
            title: value as string,
            slug: slugify(value as string),
          };
        }
        return { ...current, [key]: value };
      });
    },
    [slugTouched],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const payload = formToPayload(form);
      const saved = editingId
        ? await updateWebinar(editingId, payload)
        : await createWebinar(payload);

      if (!saved) {
        setSaveError("Webinar not found.");
        return;
      }

      await loadItems();
      setEditingId(saved.id);
      setForm(webinarToForm(saved));
      setSlugTouched(true);
      setSaveMessage(editingId ? "Webinar updated." : "Webinar created.");
    } catch (err) {
      setSaveError(getErrorMessage(err, "Failed to save webinar."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const webinar = items.find((item) => item.id === id);
    if (!webinar) return;
    const ok = window.confirm(`Delete webinar "${webinar.title}"?`);
    if (!ok) return;

    setDeletingId(id);
    setSaveError("");
    setSaveMessage("");
    try {
      await deleteWebinar(id);
      if (editingId === id) {
        startCreate();
      }
      await loadItems();
    } catch (err) {
      setSaveError(getErrorMessage(err, "Failed to delete webinar."));
    } finally {
      setDeletingId(null);
    }
  };

  const publishedCount = items.filter((item) => item.status === "published").length;
  const featuredCount = items.filter((item) => item.isFeatured).length;
  const previewHref = form.slug.trim() ? `/webinars/${form.slug.trim()}` : "/webinars";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total webinars</CardDescription>
            <CardTitle className="text-2xl">{items.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Featured on home</CardDescription>
            <CardTitle className="text-2xl">{featuredCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Webinar Library</CardTitle>
              <CardDescription>Manage upcoming and published webinar pages.</CardDescription>
            </div>
            <Button type="button" size="sm" onClick={startCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading webinars...
              </div>
            ) : loadError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loadError}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
                No webinars yet. Create your first one from the editor.
              </div>
            ) : (
              items.map((item) => {
                const active = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={[
                      "rounded-xl border p-4 transition-colors",
                      active ? "border-gold bg-gold/5" : "border-zinc-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-zinc-900">{item.title}</p>
                          <span
                            className={[
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              item.status === "published"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-100 text-zinc-700",
                            ].join(" ")}
                          >
                            {item.status}
                          </span>
                          {item.isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              featured
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">/{item.slug}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{formatDateLabel(item.startsAt)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{item.excerpt || "No excerpt yet."}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button type="button" variant="outline" size="icon-sm" onClick={() => startEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={deletingId === item.id}
                          onClick={() => void handleDelete(item.id)}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{editingId ? "Edit Webinar" : "Create Webinar"}</CardTitle>
              <CardDescription>Publish webinar pages and control what appears on the public site.</CardDescription>
            </div>
            <Button asChild type="button" variant="outline" className="gap-2">
              <Link href={previewHref} target="_blank">
                Preview
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="webinar-title">Title</Label>
                  <Input
                    id="webinar-title"
                    value={form.title}
                    onChange={(event) => onFieldChange("title", event.target.value)}
                    placeholder="Master CPHQ in 60 Minutes"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-slug">Slug</Label>
                  <Input
                    id="webinar-slug"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      onFieldChange("slug", slugify(event.target.value));
                    }}
                    placeholder="master-cphq-in-60-minutes"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => onFieldChange("status", value as FormState["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="webinar-excerpt">Short excerpt</Label>
                  <TextArea
                    id="webinar-excerpt"
                    value={form.excerpt}
                    onChange={(event) => onFieldChange("excerpt", event.target.value)}
                    placeholder="Short card summary for the webinar list and promo sections."
                    className="min-h-[88px]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="webinar-description">Description</Label>
                  <TextArea
                    id="webinar-description"
                    value={form.description}
                    onChange={(event) => onFieldChange("description", event.target.value)}
                    placeholder="Full webinar description shown on the public detail page."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-starts-at">Start date and time</Label>
                  <Input
                    id="webinar-starts-at"
                    type="datetime-local"
                    value={form.startsAtLocal}
                    onChange={(event) => onFieldChange("startsAtLocal", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-timezone">Timezone label</Label>
                  <Input
                    id="webinar-timezone"
                    value={form.timezoneLabel}
                    onChange={(event) => onFieldChange("timezoneLabel", event.target.value)}
                    placeholder="GMT+3"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-speaker-name">Speaker name</Label>
                  <Input
                    id="webinar-speaker-name"
                    value={form.speakerName}
                    onChange={(event) => onFieldChange("speakerName", event.target.value)}
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-speaker-title">Speaker title</Label>
                  <Input
                    id="webinar-speaker-title"
                    value={form.speakerTitle}
                    onChange={(event) => onFieldChange("speakerTitle", event.target.value)}
                    placeholder="CPHQ Expert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-video-url">Video URL</Label>
                  <Input
                    id="webinar-video-url"
                    value={form.videoUrl}
                    onChange={(event) => onFieldChange("videoUrl", event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-cover-url">Cover image URL</Label>
                  <Input
                    id="webinar-cover-url"
                    value={form.coverImageUrl}
                    onChange={(event) => onFieldChange("coverImageUrl", event.target.value)}
                    placeholder="https://images.example.com/webinar-cover.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-seats-left">Seats left</Label>
                  <Input
                    id="webinar-seats-left"
                    type="number"
                    min="0"
                    value={form.seatsLeft}
                    onChange={(event) => onFieldChange("seatsLeft", event.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-900">Registration enabled</p>
                    <p className="text-sm text-zinc-500">Show the registration form on the public webinar page.</p>
                  </div>
                  <Switch
                    checked={form.registrationEnabled}
                    onCheckedChange={(checked) => onFieldChange("registrationEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
                  <div>
                    <p className="font-medium text-zinc-900">Featured webinar</p>
                    <p className="text-sm text-zinc-500">Used by the home webinar promo section.</p>
                  </div>
                  <Switch checked={form.isFeatured} onCheckedChange={(checked) => onFieldChange("isFeatured", checked)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webinar-learn-points">What attendees will learn</Label>
                  <TextArea
                    id="webinar-learn-points"
                    value={form.learnPointsText}
                    onChange={(event) => onFieldChange("learnPointsText", event.target.value)}
                    placeholder={"One per line: Title | Description"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webinar-trusted-by">Trusted by</Label>
                  <TextArea
                    id="webinar-trusted-by"
                    value={form.trustedByText}
                    onChange={(event) => onFieldChange("trustedByText", event.target.value)}
                    placeholder={"One organization per line"}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="webinar-stats">Stats strip</Label>
                  <TextArea
                    id="webinar-stats"
                    value={form.statsText}
                    onChange={(event) => onFieldChange("statsText", event.target.value)}
                    placeholder={"One per line: Value | Label"}
                    className="min-h-[88px]"
                  />
                </div>
              </div>

              {saveError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              {saveMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {saveMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  {editingId ? "Update webinar" : "Create webinar"}
                </Button>
                <Button type="button" variant="outline" onClick={startCreate}>
                  Reset form
                </Button>
                {editingId ? (
                  <p className="text-sm text-zinc-500">Editing existing webinar.</p>
                ) : (
                  <p className="text-sm text-zinc-500">Create a new webinar draft and publish it when ready.</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
