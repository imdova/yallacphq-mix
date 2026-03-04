import { AdminLayout } from "@/components/features/admin";
import { RequireAuth } from "@/components/features/auth/RequireAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuth>
  );
}

