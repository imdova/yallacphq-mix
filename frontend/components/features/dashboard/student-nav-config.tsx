"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  User,
  ReceiptText,
  Users,
  Settings,
} from "lucide-react";

export type StudentNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Student/Dashboard sidebar nav items. Only visible to non-admin users. */
export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/orders", label: "Orders", icon: ReceiptText },
  { href: "/dashboard/quizzes", label: "Practice Quizzes", icon: HelpCircle },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
