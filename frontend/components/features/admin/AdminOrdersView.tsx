"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/features/admin/ConfirmDialog";
import { OrderDetailsModal } from "@/components/features/admin/OrderDetailsModal";
import { getAdminOrders, removeAdminOrder, updateOrderStatus } from "@/lib/dal/orders";
import type { Order, OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error";
import {
  BadgeCheck,
  BadgeX,
  Clock,
  Copy,
  Download,
  Eye,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";

type StatusFilter = "all" | OrderStatus;
type ProviderFilter = "all" | Order["provider"];

function formatCurrency(amount: number, currency: string) {
  const cur = currency?.trim() || "USD";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

function statusBadge(status: OrderStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "failed":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "refunded":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (/[\",\\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join(
    "\n"
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminOrdersView() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [provider, setProvider] = React.useState<ProviderFilter>("all");
  const [range, setRange] = React.useState<"7d" | "30d" | "all">("all");

  const [detailsOrder, setDetailsOrder] = React.useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const [refundOrder, setRefundOrder] = React.useState<Order | null>(null);
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundLoading, setRefundLoading] = React.useState(false);

  const [deleteOrder, setDeleteOrder] = React.useState<Order | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const cutoff =
      range === "7d"
        ? now - 7 * 24 * 60 * 60 * 1000
        : range === "30d"
          ? now - 30 * 24 * 60 * 60 * 1000
          : 0;
    return orders.filter((o) => {
      if (cutoff && new Date(o.createdAt).getTime() < cutoff) return false;
      if (status !== "all" && o.status !== status) return false;
      if (provider !== "all" && o.provider !== provider) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.studentEmail.toLowerCase().includes(q) ||
        o.courseTitle.toLowerCase().includes(q) ||
        (o.transactionId ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, status, provider, range]);

  const stats = React.useMemo(() => {
    const total = filtered.length;
    const paid = filtered.filter((o) => o.status === "paid").length;
    const pending = filtered.filter((o) => o.status === "pending").length;
    const failed = filtered.filter((o) => o.status === "failed").length;
    const refunded = filtered.filter((o) => o.status === "refunded").length;
    const revenue = filtered
      .filter((o) => o.status === "paid")
      .reduce((acc, o) => acc + Math.max(0, o.amount - (o.discountAmount ?? 0)), 0);
    const aov = paid > 0 ? revenue / paid : 0;
    return { total, paid, pending, failed, refunded, revenue, aov };
  }, [filtered]);

  const handleRefund = async () => {
    if (!refundOrder) return;
    setRefundLoading(true);
    try {
      const updated = await updateOrderStatus(refundOrder.id, "refunded");
      if (updated) setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setRefundOpen(false);
      setRefundOrder(null);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleteLoading(true);
    try {
      const ok = await removeAdminOrder(deleteOrder.id);
      if (ok) setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
      setDeleteOpen(false);
      setDeleteOrder(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: ColumnDef<Order>[] = React.useMemo(
    () => [
      {
        id: "order",
        header: "Order",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsOrder(o);
                    setDetailsOpen(true);
                  }}
                  className="font-semibold text-zinc-900 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 rounded"
                >
                  #{o.id}
                </button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 rounded-lg border-zinc-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copyText(o.id);
                  }}
                  aria-label="Copy order id"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        id: "student",
        header: "Student",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200/80">
                {getInitials(o.studentName)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-zinc-900">{o.studentName}</div>
                <div className="truncate text-sm text-zinc-500">{o.studentEmail}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "courseTitle",
        header: "Course",
        cell: ({ row }) => <span className="text-sm font-medium text-zinc-800">{row.original.courseTitle}</span>,
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const o = row.original;
          const net = Math.max(0, o.amount - (o.discountAmount ?? 0));
          return (
            <div className="text-right">
              <div className="text-sm font-semibold text-zinc-900">
                {formatCurrency(net, o.currency)}
              </div>
              {(o.discountAmount ?? 0) > 0 ? (
                <div className="text-xs text-zinc-500">
                  Discount {formatCurrency(o.discountAmount ?? 0, o.currency)}
                  {o.promoCode ? ` · ${o.promoCode}` : ""}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">—</div>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          const icon =
            s === "paid" ? (
              <BadgeCheck className="h-4 w-4" />
            ) : s === "pending" ? (
              <Clock className="h-4 w-4" />
            ) : s === "failed" ? (
              <BadgeX className="h-4 w-4" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            );
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                statusBadge(s)
              )}
            >
              {icon}
              {s}
            </span>
          );
        },
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="text-sm text-zinc-700">
              <div className="font-medium text-zinc-800">{o.provider}</div>
              <div className="text-xs text-zinc-500">{o.paymentMethod ?? "—"}</div>
            </div>
          );
        },
      },
      {
        id: "transaction",
        header: "Transaction",
        cell: ({ row }) => {
          const o = row.original;
          const tid = o.transactionId?.trim();
          return (
            <div className="min-w-0 max-w-[180px]">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-zinc-800" title={tid || undefined}>
                  {tid || "—"}
                </span>
                {tid ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 shrink-0 rounded border-zinc-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyText(tid);
                    }}
                    aria-label="Copy transaction ID"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                ) : null}
              </div>
              {o.paidAt ? (
                <div className="text-xs text-zinc-500 mt-0.5" title={o.paidAt}>
                  Paid {formatDate(o.paidAt)}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-600" title={row.original.createdAt}>
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const o = row.original;
          const canRefund = o.status === "paid";
          return (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-zinc-200"
                onClick={() => {
                  setDetailsOrder(o);
                  setDetailsOpen(true);
                }}
                aria-label="View order details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={!canRefund}
                className={cn(
                  "h-9 w-9 rounded-xl border-zinc-200",
                  canRefund ? "text-amber-700 hover:text-amber-800 hover:border-amber-200" : "opacity-50"
                )}
                onClick={() => {
                  setRefundOrder(o);
                  setRefundOpen(true);
                }}
                aria-label="Refund order"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
                onClick={() => {
                  setDeleteOrder(o);
                  setDeleteOpen(true);
                }}
                aria-label="Delete order"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load orders</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Revenue (paid)
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{formatCurrency(stats.revenue, "USD")}</div>
            <div className="mt-1 text-xs text-zinc-500">AOV {formatCurrency(stats.aov, "USD")}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Paid</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.paid}</div>
            <div className="mt-1 text-xs text-zinc-500">{stats.pending} pending · {stats.failed} failed</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Refunded</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.refunded}</div>
            <div className="mt-1 text-xs text-zinc-500">Refunds processed</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Orders</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="mt-1 text-xs text-zinc-500">Within selected filters</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px_auto] sm:items-end">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Order ID, email, course, transaction…"
                  className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Status</div>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Provider</div>
              <Select value={provider} onValueChange={(v) => setProvider(v as ProviderFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paymob">Paymob</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Date range</div>
              <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl border-zinc-200 sm:w-auto"
                onClick={() => {
                  const rows = filtered.map((o) => ({
                    id: o.id,
                    studentName: o.studentName,
                    studentEmail: o.studentEmail,
                    courseTitle: o.courseTitle,
                    amount: o.amount,
                    discountAmount: o.discountAmount ?? 0,
                    currency: o.currency,
                    status: o.status,
                    provider: o.provider,
                    paymentMethod: o.paymentMethod ?? "",
                    transactionId: o.transactionId ?? "",
                    paidAt: o.paidAt ?? "",
                    refundedAt: o.refundedAt ?? "",
                    createdAt: o.createdAt,
                  }));
                  downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, rows);
                }}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                className="h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
                onClick={() => void reload()}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/80 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-600">Loading orders…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200/80 text-zinc-500">
                <Download className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-zinc-800">No orders found</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Try changing search, status, provider, or date range.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl border-zinc-200"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setProvider("all");
                  setRange("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="block xl:hidden space-y-3">
                {filtered.map((o) => {
                  const net = Math.max(0, o.amount - (o.discountAmount ?? 0));
                  const tid = o.transactionId?.trim();
                  const canRefund = o.status === "paid";

                  return (
                    <Card
                      key={o.id}
                      className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsOrder(o);
                                  setDetailsOpen(true);
                                }}
                                className="truncate text-left font-semibold text-zinc-900 underline-offset-2 hover:underline"
                              >
                                #{o.id}
                              </button>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                                    statusBadge(o.status)
                                  )}
                                >
                                  {o.status === "paid" ? (
                                    <BadgeCheck className="h-4 w-4" />
                                  ) : o.status === "pending" ? (
                                    <Clock className="h-4 w-4" />
                                  ) : o.status === "failed" ? (
                                    <BadgeX className="h-4 w-4" />
                                  ) : (
                                    <RefreshCcw className="h-4 w-4" />
                                  )}
                                  {o.status}
                                </span>
                                <span className="text-xs text-zinc-500">{formatDate(o.createdAt)}</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0 rounded-lg border-zinc-200"
                              onClick={() => void copyText(o.id)}
                              aria-label="Copy order id"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200/80">
                              {getInitials(o.studentName)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-zinc-900">{o.studentName}</div>
                              <div className="truncate text-sm text-zinc-500">{o.studentEmail}</div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                            <div className="text-sm font-medium text-zinc-900">{o.courseTitle}</div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-zinc-900">
                                  {formatCurrency(net, o.currency)}
                                </div>
                                {(o.discountAmount ?? 0) > 0 ? (
                                  <div className="text-xs text-zinc-500">
                                    Discount {formatCurrency(o.discountAmount ?? 0, o.currency)}
                                    {o.promoCode ? ` · ${o.promoCode}` : ""}
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-right text-sm text-zinc-600">
                                <div className="font-medium text-zinc-800">{o.provider}</div>
                                <div className="text-xs text-zinc-500">{o.paymentMethod ?? "—"}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                            <span className="font-medium text-zinc-800">Transaction:</span>
                            <span className="truncate max-w-[180px]">{tid || "—"}</span>
                            {tid ? (
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 rounded border-zinc-200"
                                onClick={() => void copyText(tid)}
                                aria-label="Copy transaction ID"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap justify-end gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg border-zinc-200"
                              onClick={() => {
                                setDetailsOrder(o);
                                setDetailsOpen(true);
                              }}
                              aria-label="View order details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!canRefund}
                              className={cn(
                                "h-8 rounded-lg border-zinc-200",
                                canRefund ? "text-amber-700 hover:text-amber-800 hover:border-amber-200" : "opacity-50"
                              )}
                              onClick={() => {
                                setRefundOrder(o);
                                setRefundOpen(true);
                              }}
                              aria-label="Refund order"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg border-zinc-200 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setDeleteOrder(o);
                                setDeleteOpen(true);
                              }}
                              aria-label="Delete order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="hidden xl:block overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[980px] px-4 sm:px-0">
                  <DataTable
                    columns={columns}
                    data={filtered}
                    pageSize={10}
                    enableRowSelection={false}
                    emptyMessage="No orders found."
                    className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) setDetailsOrder(null);
        }}
        order={detailsOrder}
      />

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={(open) => {
          setRefundOpen(open);
          if (!open) setRefundOrder(null);
        }}
        title="Refund this order?"
        description={
          refundOrder
            ? `This will mark order #${refundOrder.id} as refunded. (Demo behavior)`
            : "This will mark the order as refunded."
        }
        confirmText="Refund"
        confirmVariant="destructive"
        loading={refundLoading}
        onConfirm={handleRefund}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteOrder(null);
        }}
        title="Delete order?"
        description={
          deleteOrder
            ? `This will permanently remove order #${deleteOrder.id}. (Demo behavior)`
            : "This will permanently remove the order."
        }
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}

