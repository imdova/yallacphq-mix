"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { cn } from "@/lib/utils";

type FormProps<T extends FieldValues> = Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "children"
> & {
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  formRef?: React.RefObject<HTMLFormElement>;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  formProps?: UseFormProps<T>;
};

function FormInner<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  formRef,
  children,
  className,
  formProps,
  ...rest
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formProps,
  });

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        className={cn("space-y-6", className)}
        onSubmit={methods.handleSubmit(onSubmit)}
        {...rest}
      >
        {children(methods)}
      </form>
    </FormProvider>
  );
}

export function Form<T extends FieldValues>(props: FormProps<T>) {
  return <FormInner {...props} />;
}

export type { UseFormReturn };
