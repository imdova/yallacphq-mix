"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends Omit<React.ComponentProps<typeof Input>, "id"> {
  id: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ id, error, className, ...props }, ref) => (
    <Input
      ref={ref}
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
      {...props}
    />
  )
);
FormInput.displayName = "FormInput";
