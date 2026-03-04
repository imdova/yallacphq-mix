"use client";

import * as React from "react";
import { useFormContext, type UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  name: string;
  label?: string;
  required?: boolean;
  children: (props: { id: string; error?: string; fieldValue?: unknown } & UseFormRegisterReturn) => React.ReactNode;
  className?: string;
};

export function FormField({ name, label, required, children, className }: FormFieldProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const id = `field-${name}`;
  const fieldValue = watch(name);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      ) : null}
      {children({
        id,
        error,
        fieldValue,
        ...register(name),
      })}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
