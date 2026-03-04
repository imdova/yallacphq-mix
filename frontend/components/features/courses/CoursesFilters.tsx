"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;
const durations = ["0-2 Hours", "3-6 Hours", "6+ Hours"] as const;
const certTypes = ["CPHQ Prep", "CME Credits", "Micro-Credential"] as const;

export interface FilterState {
  level: string[];
  duration: string[];
  certification: string[];
}

const defaultFilters: FilterState = {
  level: [],
  duration: [],
  certification: [],
};

export function CoursesFilters({
  value,
  onChange,
  className,
  hasActiveFilters,
}: {
  value?: Partial<FilterState>;
  onChange?: (state: FilterState) => void;
  className?: string;
  hasActiveFilters?: boolean;
}) {
  const [internal, setInternal] = React.useState<FilterState>(defaultFilters);
  const state = value !== undefined ? { ...defaultFilters, ...value } : internal;
  const setState = (next: FilterState) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };

  const update = (key: keyof FilterState, item: string, checked: boolean) => {
    const next = {
      ...state,
      [key]: checked
        ? [...state[key], item]
        : state[key].filter((x) => x !== item),
    };
    setState(next);
    onChange?.(next);
  };

  const clearAll = () => setState(defaultFilters);

  return (
    <aside className={cn("space-y-6", className)} aria-label="Filters">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" aria-hidden />
          <h2 className="font-semibold text-zinc-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-gold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Level
        </h3>
        <ul className="space-y-2">
          {levels.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Checkbox
                id={`level-${item}`}
                checked={state.level.includes(item)}
                onCheckedChange={(checked) => update("level", item, checked === true)}
                className="rounded-md data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <Label htmlFor={`level-${item}`} className="cursor-pointer text-sm text-zinc-700">
                {item}
              </Label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Duration
        </h3>
        <ul className="space-y-2">
          {durations.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Checkbox
                id={`duration-${item}`}
                checked={state.duration.includes(item)}
                onCheckedChange={(checked) => update("duration", item, checked === true)}
                className="rounded-md data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <Label htmlFor={`duration-${item}`} className="cursor-pointer text-sm text-zinc-700">
                {item}
              </Label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Certification
        </h3>
        <ul className="space-y-2">
          {certTypes.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <Checkbox
                id={`cert-${item}`}
                checked={state.certification.includes(item)}
                onCheckedChange={(checked) => update("certification", item, checked === true)}
                className="rounded-md data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <Label htmlFor={`cert-${item}`} className="cursor-pointer text-sm text-zinc-700">
                {item}
              </Label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
