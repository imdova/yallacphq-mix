"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

interface FormSelectProps {
  name: string;
  label: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function FormSelect({ name, label, required, options, placeholder = "Select...", className }: FormSelectProps) {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();
  const value = watch(name);
  const error = errors[name]?.message as string | undefined;
  const id = `field-${name}`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Select
        value={value ?? ""}
        onValueChange={(v) => {
          setValue(name, v);
          void trigger(name);
        }}
      >
        <SelectTrigger id={id} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
