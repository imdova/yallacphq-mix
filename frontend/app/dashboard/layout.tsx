import { DashboardLayoutSwitcher } from "@/components/features/layout/DashboardLayoutSwitcher";
import { RequireAuth } from "@/components/features/auth/RequireAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardLayoutSwitcher>{children}</DashboardLayoutSwitcher>
    </RequireAuth>
  );
}
