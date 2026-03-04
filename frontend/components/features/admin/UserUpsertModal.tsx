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
import { Form, FormField, FormInput, FormSelect } from "@/components/shared/forms";
import { createUserSchema, type CreateUserSchema } from "@/lib/validations/user";
import type { User } from "@/types/user";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "student", label: "Student" },
] as const;

export function UserUpsertModal({
  open,
  mode,
  user,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  user?: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserSchema) => void | Promise<void>;
}) {
  const title = mode === "create" ? "Add user" : "Edit user";
  const description =
    mode === "create"
      ? "Create a new user and assign a role."
      : "Update user details and role.";

  const defaults = React.useMemo(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: (user?.role ?? "student") as CreateUserSchema["role"],
      phone: user?.phone ?? "",
      course: user?.course ?? "",
      country: user?.country ?? "",
      speciality: user?.speciality ?? "",
    }),
    [user]
  );

  const handleSubmit = async (data: CreateUserSchema) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="max-h-[90vh] overflow-y-auto w-full max-w-[min(32rem,calc(100vw-2rem))] p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form<CreateUserSchema>
          key={open ? `upsert-${mode}-${user?.id ?? "new"}` : "upsert-closed"}
          schema={createUserSchema}
          defaultValues={defaults}
          onSubmit={handleSubmit}
          formProps={{ mode: "onSubmit" }}
        >
          {(methods) => (
            <>
              <FormField name="name" label="Name" required>
                {({ id, error, ...rest }) => <FormInput id={id} error={error} {...rest} />}
              </FormField>
              <FormField name="email" label="Email" required>
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} type="email" {...rest} />
                )}
              </FormField>
              <FormSelect
                name="role"
                label="Role"
                required
                options={ROLE_OPTIONS as unknown as { value: string; label: string }[]}
                placeholder="Select role"
              />
              <FormField name="phone" label="Phone">
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} type="tel" placeholder="e.g. +20 100 123 4567" {...rest} />
                )}
              </FormField>
              <FormField name="course" label="Course">
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} placeholder="e.g. CPHQ Exam Prep" {...rest} />
                )}
              </FormField>
              <FormField name="country" label="Country">
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} placeholder="e.g. Egypt" {...rest} />
                )}
              </FormField>
              <FormField name="speciality" label="Speciality">
                {({ id, error, ...rest }) => (
                  <FormInput id={id} error={error} placeholder="e.g. Quality Management" {...rest} />
                )}
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

