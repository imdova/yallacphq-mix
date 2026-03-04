import { Suspense } from "react";
import { CourseDetailsView } from "@/components/features/course-details/CourseDetailsView";

export const metadata = {
  title: "CPHQ Preparation Program 2024 | Yalla CPHQ",
  description:
    "The most comprehensive guide to mastering Healthcare Quality Management. Pass your CPHQ exam on the first attempt.",
};

function CourseDetailsFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-zinc-50">
      <p className="text-zinc-500">Loading…</p>
    </div>
  );
}

export default function CourseDetailsPage() {
  return (
    <Suspense fallback={<CourseDetailsFallback />}>
      <CourseDetailsView />
    </Suspense>
  );
}
