"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  GraduationCap,
  RefreshCcw,
  ShoppingBag,
  Ticket,
  Users,
  Sparkles,
  Activity,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { fetchCourses } from "@/lib/dal/courses";
import { fetchAdminOrders } from "@/lib/dal/orders";
import { fetchPromoCodes } from "@/lib/dal/promo-codes";
import { fetchUsers } from "@/lib/dal/user";
import type { Order } from "@/types/order";

function formatUsd(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function orderStatusBadge(status: Order["status"]) {
  if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "refunded") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "failed") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const min = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3600_000);
  const day = Math.floor(diff / 86400_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (h < 24) return `${h}h ago`;
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatusIcon({ status }: { status: Order["status"] }) {
  if (status === "paid") return <Check className="h-3.5 w-3.5" />;
  if (status === "refunded") return <RefreshCcw className="h-3.5 w-3.5" />;
  if (status === "failed") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

export function AdminOverviewView() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usersCount, setUsersCount] = React.useState({ total: 0, enrolled: 0, admins: 0 });
  const [coursesCount, setCoursesCount] = React.useState({ total: 0, published: 0, draft: 0 });
  const [ordersCount, setOrdersCount] = React.useState({ total: 0, paid: 0, revenue: 0 });
  const [promoCount, setPromoCount] = React.useState({ total: 0, active: 0, uses: 0 });
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [users, courses, orders, promos] = await Promise.all([
          fetchUsers(),
          fetchCourses(),
          fetchAdminOrders(),
          fetchPromoCodes(),
        ]);
        if (cancelled) return;

        const admins = users.filter((u) => u.role === "admin").length;
        const totalStudents = users.filter((u) => u.role !== "admin").length;
        const enrolled = users.filter((u) => !!u.enrolled).length;
        setUsersCount({ total: totalStudents, enrolled, admins });

        const published = courses.filter((c) => (c.status ?? "published") === "published").length;
        const draft = courses.filter((c) => c.status === "draft").length;
        setCoursesCount({ total: courses.length, published, draft });

        const paidOrders = orders.filter((o) => o.status === "paid");
        const revenue = paidOrders.reduce((sum, o) => sum + (o.amount - (o.discountAmount ?? 0)), 0);
        setOrdersCount({ total: orders.length, paid: paidOrders.length, revenue });

        const activePromos = promos.filter((p) => p.active).length;
        const uses = promos.reduce((sum, p) => sum + (p.usageCount ?? 0), 0);
        setPromoCount({ total: promos.length, active: activePromos, uses });

        const latest = [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);
        setRecentOrders(latest);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load dashboard</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {loading ? "Loading…" : `${usersCount.enrolled} enrolled`}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {loading ? "—" : usersCount.total}
            </div>
            <div className="text-sm text-zinc-600">Students</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {loading ? "Loading…" : `${coursesCount.published} published`}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {loading ? "—" : coursesCount.total}
            </div>
            <div className="text-sm text-zinc-600">Courses</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <ShoppingBag className="h-5 w-5" aria-hidden />
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {loading ? "Loading…" : `${ordersCount.paid} paid`}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {loading ? "—" : formatUsd(ordersCount.revenue)}
            </div>
            <div className="text-sm text-zinc-600">Revenue</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Ticket className="h-5 w-5" aria-hidden />
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {loading ? "Loading…" : `${promoCount.active} active`}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {loading ? "—" : promoCount.total}
            </div>
            <div className="text-sm text-zinc-600">Promo codes</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Activity className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900">Recent orders</CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-zinc-500">
                    Latest checkout activity
                  </CardDescription>
                </div>
              </div>
              {!loading && recentOrders.length > 0 && (
                <span className="rounded-full bg-zinc-200/80 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {recentOrders.length} orders
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
                <p className="mt-3 text-sm text-zinc-500">Loading recent orders…</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-600">No orders yet</p>
                <p className="mt-1 text-xs text-zinc-500">Orders will appear here when customers checkout.</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {recentOrders.map((o) => {
                  const net = o.amount - (o.discountAmount ?? 0);
                  return (
                    <li key={o.id}>
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-zinc-50/80"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                          {getInitials(o.studentName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {o.studentName}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {o.courseTitle}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-zinc-400">
                            {o.studentEmail} · <span className="font-mono">{o.id}</span>
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-zinc-900">{formatUsd(net)}</p>
                          <p className="mt-0.5 text-xs text-zinc-400">{formatRelativeTime(o.createdAt)}</p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold capitalize ${orderStatusBadge(
                            o.status
                          )}`}
                        >
                          <StatusIcon status={o.status} />
                          {o.status}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {!loading && recentOrders.length > 0 && (
              <div className="border-t border-zinc-100 px-4 py-3">
                <Button asChild variant="ghost" size="sm" className="w-full justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                  <Link href="/admin/orders" className="inline-flex items-center gap-2">
                    View all orders
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-gold" />
                Quick actions
              </CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button asChild className="w-full justify-between rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/admin/students">
                  Manage students
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="/admin/courses">
                  Manage courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="/admin/promo-codes">
                  Manage promo codes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="/admin/offers">
                  Update offers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">At a glance</CardTitle>
              <CardDescription>Things worth checking today</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <span className="text-sm font-medium text-zinc-900">Draft courses</span>
                <span className="text-xs font-semibold text-zinc-700">
                  {loading ? "—" : coursesCount.draft}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <span className="text-sm font-medium text-zinc-900">Active promo codes</span>
                <span className="text-xs font-semibold text-zinc-700">
                  {loading ? "—" : promoCount.active}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <span className="text-sm font-medium text-zinc-900">Admins</span>
                <span className="text-xs font-semibold text-zinc-700">
                  {loading ? "—" : usersCount.admins}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

