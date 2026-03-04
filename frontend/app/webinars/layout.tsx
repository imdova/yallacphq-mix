import { WebinarsLayoutClient } from "@/components/features/webinars/WebinarsLayoutClient";

export default function WebinarsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <WebinarsLayoutClient>{children}</WebinarsLayoutClient>
    </div>
  );
}
