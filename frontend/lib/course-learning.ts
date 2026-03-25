import type { Course } from "@/types/course";

export type CourseLaunchTarget = {
  id: string;
  title: string;
  href: string;
};

export type CourseLearningSummary = {
  lessonCount: number;
  quizCount: number;
  firstLesson: CourseLaunchTarget | null;
  firstQuiz: CourseLaunchTarget | null;
  defaultLaunch: CourseLaunchTarget | null;
};

export type CourseCurriculumCounts = {
  lessonCount: number;
  quizCount: number;
  hasCurriculumItems: boolean;
};

export function buildLessonHref(courseId: string, lessonId: string): string {
  const params = new URLSearchParams();
  params.set("course", courseId);
  params.set("lesson", lessonId);
  return `/dashboard/courses/lesson?${params.toString()}`;
}

export function buildQuizHref(courseId: string, quizId: string): string {
  const params = new URLSearchParams();
  params.set("course", courseId);
  params.set("quiz", quizId);
  return `/dashboard/courses/lesson?${params.toString()}`;
}

export function getCourseCurriculumCounts(
  course: Pick<Course, "curriculumSections" | "lessons">,
): CourseCurriculumCounts {
  let lessonCount = 0;
  let quizCount = 0;
  let hasCurriculumItems = false;

  for (const section of course.curriculumSections ?? []) {
    for (const item of section.items ?? []) {
      hasCurriculumItems = true;

      if (item.type === "lecture") {
        lessonCount += 1;
        continue;
      }

      if (item.type === "quiz") {
        quizCount += 1;
      }
    }
  }

  return {
    lessonCount: hasCurriculumItems ? lessonCount : (course.lessons ?? 0),
    quizCount,
    hasCurriculumItems,
  };
}

export function getCourseLearningSummary(course: Course): CourseLearningSummary {
  let lessonCount = 0;
  let quizCount = 0;
  let firstLesson: CourseLaunchTarget | null = null;
  let firstQuiz: CourseLaunchTarget | null = null;

  for (const section of course.curriculumSections ?? []) {
    for (const item of section.items ?? []) {
      if (item.type === "lecture") {
        lessonCount += 1;
        if (!firstLesson) {
          firstLesson = {
            id: item.id,
            title: item.title,
            href: buildLessonHref(course.id, item.id),
          };
        }
        continue;
      }

      if (item.quizId) {
        quizCount += 1;
        if (!firstQuiz) {
          firstQuiz = {
            id: item.quizId,
            title: item.title,
            href: buildQuizHref(course.id, item.quizId),
          };
        }
      }
    }
  }

  return {
    lessonCount,
    quizCount,
    firstLesson,
    firstQuiz,
    defaultLaunch: firstLesson ?? firstQuiz,
  };
}
