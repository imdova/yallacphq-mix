import { DashboardLayoutSwitcher } from "@/components/features/layout/DashboardLayoutSwitcher";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutSwitcher>{children}</DashboardLayoutSwitcher>;
}
