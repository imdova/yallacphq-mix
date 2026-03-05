"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShoppingBag,
  Building2,
  Tag,
  Ticket,
  Video,
  Settings,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Admin sidebar nav items. Only visible to users with role "admin". */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/bank-transfers", label: "Bank Transfers", icon: Building2 },
  { href: "/admin/promo-codes", label: "Promo codes", icon: Ticket },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/webinars", label: "Webinars", icon: Video },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
