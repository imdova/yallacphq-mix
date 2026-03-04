"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/shared/forms";
import { createCourseSchema, type CreateCourseSchema } from "@/lib/validations/course";
import type { Course } from "@/types/course";

export function CourseUpsertModal({
  open,
  mode,
  course,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  course?: Course | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCourseSchema) => void | Promise<void>;
}) {
  const title = mode === "create" ? "Add course" : "Edit course";
  const description = mode === "create" ? "Create a new course in the catalog." : "Update course details.";

  const defaults = React.useMemo(
    () => ({
      title: course?.title ?? "",
      tag: course?.tag ?? "Exam Prep",
      instructorName: course?.instructorName ?? "Dr Ahmed Habib",
      instructorTitle: course?.instructorTitle ?? "CPHQ, Healthcare Quality Director",
      durationHours: course?.durationHours ?? 2,
      priceRegular: course?.priceRegular ?? 0,
      priceSale: course?.priceSale ?? undefined,
    }),
    [course]
  );

  const handleSubmit = async (data: CreateCourseSchema) => {
    const cleaned = {
      ...data,
      priceSale: data.priceSale === 0 ? undefined : data.priceSale,
    };
    await onSubmit(cleaned);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form<CreateCourseSchema> schema={createCourseSchema} defaultValues={defaults} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <FormField name="title" label="Title" required>
                {({ id, error, ...rest }) => <FormInput id={id} error={error} {...rest} />}
              </FormField>
              <FormField name="tag" label="Tag" required>
                {({ id, error, ...rest }) => <FormInput id={id} error={error} {...rest} />}
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField name="durationHours" label="Duration (hours)" required>
                  {({ id, error, ...rest }) => (
                    <FormInput id={id} error={error} type="number" step="0.5" min="0" {...rest} />
                  )}
                </FormField>
                <FormField name="priceRegular" label="Price (USD)">
                  {({ id, error, ...rest }) => (
                    <FormInput id={id} error={error} type="number" step="0.01" min="0" {...rest} />
                  )}
                </FormField>
              </div>
              <FormField name="priceSale" label="Sale price (optional)">
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} type="number" step="0.01" min="0" {...rest} />
                )}
              </FormField>
              <FormField name="instructorName" label="Instructor name" required>
                {({ id, error, ...rest }) => <FormInput id={id} error={error} {...rest} />}
              </FormField>
              <FormField name="instructorTitle" label="Instructor title" required>
                {({ id, error, ...rest }) => <FormInput id={id} error={error} {...rest} />}
              </FormField>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={methods.formState.isSubmitting}
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  {methods.formState.isSubmitting ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}

