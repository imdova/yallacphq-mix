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
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/types/user";
import type { Course } from "@/types/course";
import { GraduationCap } from "lucide-react";

export function EnrollStudentModal({
  open,
  onOpenChange,
  user,
  courses,
  loading,
  onEnroll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  courses: Course[];
  loading: boolean;
  onEnroll: (userId: string, courseIds: string[]) => void | Promise<void>;
}) {
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) setSelectedCourseIds([]);
  }, [open]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const selectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (!user || selectedCourseIds.length === 0) return;
    await onEnroll(user.id, selectedCourseIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="max-h-[90vh] flex flex-col max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gold" />
            Enroll student
          </DialogTitle>
          <DialogDescription>
            {user
              ? `Select one or more courses to enroll ${user.name} in. They will see all selected courses in their dashboard.`
              : "Select one or more courses to enroll this student in."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700">Courses</label>
            {courses.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-zinc-600 h-8"
                onClick={selectAll}
              >
                {selectedCourseIds.length === courses.length ? "Clear all" : "Select all"}
              </Button>
            )}
          </div>
          {courses.length === 0 ? (
            <p className="text-xs text-zinc-500">Create courses first from the Courses page.</p>
          ) : (
            <div className="border border-zinc-200 rounded-xl overflow-hidden overflow-y-auto max-h-[280px] bg-zinc-50/50">
              <ul className="p-1 space-y-0.5">
                {courses.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white transition-colors">
                      <Checkbox
                        checked={selectedCourseIds.includes(c.id)}
                        onCheckedChange={() => toggleCourse(c.id)}
                        aria-label={`Enroll in ${c.title}`}
                      />
                      <span className="text-sm font-medium text-zinc-900 truncate">{c.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedCourseIds.length > 0 && (
            <p className="text-xs text-zinc-500">
              {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? "s" : ""} selected.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedCourseIds.length === 0 || loading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {loading ? "Enrolling…" : `Enroll in ${selectedCourseIds.length} course${selectedCourseIds.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
