"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput, FormSelect } from "@/components/shared/forms";
import { createUserSchema, type CreateUserSchema } from "@/lib/validations/user";
import type { CreateUserInput } from "@/types/user";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "student", label: "Student" },
];

export function UserFormModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserInput) => void | Promise<void>;
}) {
  const handleSubmit = async (data: CreateUserSchema) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>Create a new user. All fields are required.</DialogDescription>
        </DialogHeader>
        <Form<CreateUserSchema>
          schema={createUserSchema}
          defaultValues={{ name: "", email: "", role: "student" }}
          onSubmit={handleSubmit}
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
                options={ROLE_OPTIONS}
                placeholder="Select role"
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={methods.formState.isSubmitting}>
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
