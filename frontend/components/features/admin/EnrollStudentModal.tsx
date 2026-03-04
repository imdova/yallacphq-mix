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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onEnroll: (userId: string, courseId: string, courseTitle: string) => void | Promise<void>;
}) {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) setSelectedCourseId("");
  }, [open]);

  const selectedCourse = React.useMemo(
    () => courses.find((c) => c.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const handleSubmit = async () => {
    if (!user || !selectedCourseId || !selectedCourse) return;
    await onEnroll(user.id, selectedCourseId, selectedCourse.title);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gold" />
            Enroll student
          </DialogTitle>
          <DialogDescription>
            {user
              ? `Select a course to enroll ${user.name} in. They will be marked as enrolled and assigned to that course.`
              : "Select a course to enroll this student in."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label htmlFor="enroll-course" className="text-sm font-medium text-zinc-700">
            Course
          </label>
          <Select
            value={selectedCourseId}
            onValueChange={setSelectedCourseId}
            disabled={courses.length === 0}
          >
            <SelectTrigger id="enroll-course" className="h-10 rounded-xl border-zinc-200">
              <SelectValue placeholder={courses.length === 0 ? "No courses available" : "Select a course"} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {courses.length === 0 && (
            <p className="text-xs text-zinc-500">Create courses first from the Courses page.</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCourseId || loading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {loading ? "Enrolling…" : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
