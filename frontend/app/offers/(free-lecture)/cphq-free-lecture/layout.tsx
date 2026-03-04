import { FreeLectureHeader } from "@/components/features/offers/FreeLectureHeader";
import { FreeLectureFooter } from "@/components/features/offers/FreeLectureFooter";

export default function FreeLectureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <FreeLectureHeader />
      <main className="flex-1">{children}</main>
      <FreeLectureFooter />
    </div>
  );
}
