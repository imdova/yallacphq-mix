import { Register1Header } from "@/components/features/offers/Register1Header";
import { Register1Footer } from "@/components/features/offers/Register1Footer";

export default function Register1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Register1Header />
      <main className="flex-1">{children}</main>
      <Register1Footer />
    </div>
  );
}
