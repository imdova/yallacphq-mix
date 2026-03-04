import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import { CoursesFooter } from "@/components/features/courses/CoursesFooter";

export default function MainOffersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CoursesHeader />
      <main className="flex-1 bg-zinc-50">{children}</main>
      <CoursesFooter />
    </div>
  );
}
