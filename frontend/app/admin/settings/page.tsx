"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStudentFieldOptions, updateStudentFieldOptions } from "@/lib/dal/settings";
import { getErrorMessage } from "@/lib/api/error";
import { Plus, Trash2 } from "lucide-react";

function ListManager({
  title,
  description,
  items,
  onAdd,
  onRemove,
  loading,
  addPlaceholder,
}: {
  title: string;
  description?: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  loading: boolean;
  addPlaceholder: string;
}) {
  const [newValue, setNewValue] = React.useState("");
  const handleAdd = () => {
    const v = newValue.trim();
    if (!v || items.includes(v)) return;
    onAdd(v);
    setNewValue("");
  };
  return (
    <Card className="rounded-2xl border-zinc-200">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          {description ?? "These options appear in the student form when adding or editing a student."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-800"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={loading}
                className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-50"
                aria-label={`Remove ${item}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            placeholder={addPlaceholder}
            className="h-9 max-w-xs rounded-xl border-zinc-200"
            disabled={loading}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={loading || !newValue.trim()}
            className="h-9 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const [options, setOptions] = React.useState<{
    countries: string[];
    specialities: string[];
    categories: string[];
  }>({
    countries: [],
    specialities: [],
    categories: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const updateCountries = React.useCallback(
    (next: string[]) => {
      setSaving(true);
      updateStudentFieldOptions({ ...options, countries: next })
        .then((data) => setOptions(data))
        .finally(() => setSaving(false));
    },
    [options]
  );
  const updateSpecialities = React.useCallback(
    (next: string[]) => {
      setSaving(true);
      updateStudentFieldOptions({ ...options, specialities: next })
        .then((data) => setOptions(data))
        .finally(() => setSaving(false));
    },
    [options]
  );
  const updateCategories = React.useCallback(
    (next: string[]) => {
      setSaving(true);
      updateStudentFieldOptions({ ...options, categories: next })
        .then((data) => setOptions(data))
        .finally(() => setSaving(false));
    },
    [options]
  );

  const handleAddCountry = (value: string) => {
    const next = [...options.countries, value.trim()].filter(Boolean);
    updateCountries(next);
  };
  const handleRemoveCountry = (index: number) => {
    const next = options.countries.filter((_, i) => i !== index);
    updateCountries(next);
  };
  const handleAddSpeciality = (value: string) => {
    const next = [...options.specialities, value.trim()].filter(Boolean);
    updateSpecialities(next);
  };
  const handleRemoveSpeciality = (index: number) => {
    const next = options.specialities.filter((_, i) => i !== index);
    updateSpecialities(next);
  };

  const handleAddCategory = (value: string) => {
    const next = [...(options.categories || []), value.trim()].filter(Boolean);
    updateCategories(next);
  };
  const handleRemoveCategory = (index: number) => {
    const next = (options.categories || []).filter((_, i) => i !== index);
    updateCategories(next);
  };

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
        <h1 className="text-lg font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage options shown in forms across the admin panel.
        </p>
      </div>
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-800">{error}</CardContent>
        </Card>
      ) : null}
      <ListManager
        title="Countries"
        items={options.countries}
        onAdd={handleAddCountry}
        onRemove={handleRemoveCountry}
        loading={saving}
        addPlaceholder="e.g. Egypt"
      />
      <ListManager
        title="Specialities"
        items={options.specialities}
        onAdd={handleAddSpeciality}
        onRemove={handleRemoveSpeciality}
        loading={saving}
        addPlaceholder="e.g. Quality Management"
      />
      <ListManager
        title="Course categories"
        description="These options appear when adding or editing a course (category/tag)."
        items={options.categories ?? []}
        onAdd={handleAddCategory}
        onRemove={handleRemoveCategory}
        loading={saving}
        addPlaceholder="e.g. Exam Prep"
      />
    </div>
  );
}
