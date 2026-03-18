"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getStudentFieldOptions,
  type StudentFieldOptions,
  updateStudentFieldOptions,
} from "@/lib/dal/settings";
import { getErrorMessage } from "@/lib/api/error";
import { FileQuestion, Globe, Loader2, Plus, Search, Tag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsFieldKey = keyof StudentFieldOptions;

const FIELD_CONFIG: Record<
  SettingsFieldKey,
  {
    label: string;
    leftTitle: string;
    description: string;
    placeholder: string;
    createLabel: string;
    Icon: React.ElementType;
  }
> = {
  countries: {
    label: "Countries",
    leftTitle: "Countries",
    description: "These options appear in the student form when adding or editing a student.",
    placeholder: "e.g. Egypt",
    createLabel: "Create New Country",
    Icon: Globe,
  },
  specialities: {
    label: "Specialities",
    leftTitle: "Specialities",
    description: "These options appear in the student form when adding or editing a student.",
    placeholder: "e.g. Quality Management",
    createLabel: "Create New Speciality",
    Icon: User,
  },
  categories: {
    label: "Course categories",
    leftTitle: "Course categories",
    description: "These options appear when adding or editing a course (category/tag).",
    placeholder: "e.g. Exam Prep",
    createLabel: "Create New Category",
    Icon: Tag,
  },
  quizCategories: {
    label: "Quiz categories",
    leftTitle: "Quiz categories",
    description: "These options help organize quizzes and question bank content across the LMS.",
    placeholder: "e.g. Healthcare Quality",
    createLabel: "Create New Quiz Category",
    Icon: FileQuestion,
  },
};

function FieldOptionsPanel({
  title,
  description,
  placeholder,
  createLabel,
  Icon,
  items,
  saving,
  onPersist,
}: {
  title: string;
  description: string;
  placeholder: string;
  createLabel: string;
  Icon: React.ElementType;
  items: string[];
  saving: boolean;
  onPersist: (next: string[]) => Promise<boolean>;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(
    items.length > 0 ? 0 : null
  );
  const [draftValue, setDraftValue] = React.useState(items[0] ?? "");

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => !q || value.toLowerCase().includes(q));
  }, [items, searchQuery]);

  React.useEffect(() => {
    if (selectedIndex == null) return;
    if (items.length === 0) {
      setSelectedIndex(null);
      setDraftValue("");
      return;
    }
    if (selectedIndex >= items.length) {
      const nextIdx = items.length - 1;
      setSelectedIndex(nextIdx);
      setDraftValue(items[nextIdx] ?? "");
      return;
    }
    const current = items[selectedIndex] ?? "";
    setDraftValue(current);
  }, [items, selectedIndex]);

  const beginCreate = () => {
    setSelectedIndex(null);
    setDraftValue("");
    setSearchQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectItem = (index: number) => {
    setSelectedIndex(index);
    setDraftValue(items[index] ?? "");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeAt = async (index: number) => {
    const next = items.filter((_, i) => i !== index);
    const ok = await onPersist(next);
    if (!ok) return;
    setSelectedIndex((prev) => {
      if (prev == null) return prev;
      if (prev === index) return next.length ? Math.min(index, next.length - 1) : null;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const canSave = React.useMemo(() => {
    const v = draftValue.trim();
    if (!v) return false;
    if (selectedIndex == null) return !items.includes(v);
    const current = items[selectedIndex];
    if (!current) return false;
    if (v === current) return false;
    return !items.includes(v);
  }, [draftValue, items, selectedIndex]);

  const saveDraft = async () => {
    const v = draftValue.trim();
    if (!v) return;

    if (selectedIndex == null) {
      if (items.includes(v)) return;
      const next = [...items, v];
      const ok = await onPersist(next);
      if (ok) {
        setSelectedIndex(next.length - 1);
        setDraftValue(v);
      }
      return;
    }

    const current = items[selectedIndex];
    if (!current) return;
    if (v === current) return;
    if (items.includes(v)) return;
    const next = items.map((item, i) => (i === selectedIndex ? v : item));
    const ok = await onPersist(next);
    if (ok) setDraftValue(v);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {title}
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            {saving ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving
              </span>
            ) : null}
          </div>

          <Button
            type="button"
            className="mt-4 h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={beginCreate}
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>

          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-10 rounded-xl border-zinc-200 bg-white pl-9 pr-4"
                disabled={saving}
              />
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-zinc-900">No items yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Use “{createLabel}” to add your first one.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map(({ value, index }) => {
                  const isActive = selectedIndex === index;
                  return (
                    <li key={`${value}-${index}`}>
                      <div
                        className={cn(
                          "group flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors",
                          isActive
                            ? "border-gold/30 bg-gold/10"
                            : "border-zinc-200 bg-white hover:bg-zinc-50"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => selectItem(index)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          disabled={saving}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              isActive ? "bg-gold/15 text-gold" : "bg-zinc-100 text-zinc-500"
                            )}
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate text-sm font-semibold text-zinc-900">
                            {value}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void removeAt(index)}
                          disabled={saving}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                          aria-label={`Remove ${value}`}
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {selectedIndex == null ? "Create item" : "Edit item"}
            </p>
            <p className="text-sm text-zinc-600">{description}</p>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Value name
            </label>
            <Input
              ref={inputRef}
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                void saveDraft();
              }}
              placeholder={placeholder}
              className="h-11 rounded-xl border-zinc-200 bg-white"
              disabled={saving}
            />
            {selectedIndex != null && items[selectedIndex] ? (
              <p className="text-xs text-zinc-500">
                Selected:{" "}
                <span className="font-semibold text-zinc-700">{items[selectedIndex]}</span>
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                Add a new value and it will appear in related forms.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {selectedIndex != null ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-zinc-200 text-zinc-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => void removeAt(selectedIndex)}
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-zinc-200 text-zinc-700"
                onClick={() => {
                  setDraftValue("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                disabled={saving || !draftValue.trim()}
              >
                Clear
              </Button>
            )}

            <Button
              type="button"
              className="h-11 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={() => void saveDraft()}
              disabled={saving || !canSave}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {selectedIndex == null ? "Add value" : "Save value"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [options, setOptions] = React.useState<StudentFieldOptions>({
    countries: [],
    specialities: [],
    categories: [],
    quizCategories: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeField, setActiveField] = React.useState<SettingsFieldKey>("countries");

  React.useEffect(() => {
    let cancelled = false;
    getStudentFieldOptions()
      .then((data) => {
        if (!cancelled) setOptions(data);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load settings"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistField = React.useCallback(
    async (key: SettingsFieldKey, next: string[]) => {
      setSaving(true);
      setError(null);
      try {
        const data = await updateStudentFieldOptions({ [key]: next });
        setOptions(data);
        return true;
      } catch (e) {
        setError(getErrorMessage(e, "Failed to save settings"));
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
        <p className="mt-3 text-sm text-zinc-600">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">LMS Setting</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage options shown in forms across the admin panel.
        </p>
      </div>
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-800">{error}</CardContent>
        </Card>
      ) : null}
      <Tabs
        value={activeField}
        onValueChange={(v) => setActiveField(v as SettingsFieldKey)}
        className="space-y-5"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-zinc-200 bg-transparent p-0">
          {(Object.keys(FIELD_CONFIG) as SettingsFieldKey[]).map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className={cn(
                "rounded-none border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-zinc-500",
                "data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-zinc-900 data-[state=active]:shadow-none"
              )}
            >
              {FIELD_CONFIG[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <FieldOptionsPanel
        key={activeField}
        title={FIELD_CONFIG[activeField].leftTitle}
        description={FIELD_CONFIG[activeField].description}
        placeholder={FIELD_CONFIG[activeField].placeholder}
        createLabel={FIELD_CONFIG[activeField].createLabel}
        Icon={FIELD_CONFIG[activeField].Icon}
        items={options[activeField] ?? []}
        saving={saving}
        onPersist={(next) => persistField(activeField, next)}
      />
    </div>
  );
}
