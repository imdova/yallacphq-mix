"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { OrderDetailsModal } from "@/components/features/admin/OrderDetailsModal";
import { getUserOrders } from "@/lib/dal/orders";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";
import { getErrorMessage } from "@/lib/api/error";
import {
  BadgeCheck,
  BadgeX,
  Clock,
  Copy,
  Eye,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";

type StatusFilter = "all" | Order["status"];
type ProviderFilter = "all" | Order["provider"];
type RangeFilter = "7d" | "30d" | "all";

function formatCurrency(amount: number, currency: string) {
  const cur = currency?.trim() || "USD";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusBadge(status: Order["status"]) {
  if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "failed") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
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

export function StudentOrdersView() {
  const searchParams = useSearchParams();
  const fromCheckout = searchParams.get("from") === "checkout";

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [provider, setProvider] = React.useState<ProviderFilter>("all");
  const [range, setRange] = React.useState<RangeFilter>("30d");

  const [detailsOrder, setDetailsOrder] = React.useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserOrders();
        if (!cancelled) {
          setOrders(data);
          if (fromCheckout && typeof window !== "undefined") {
            window.history.replaceState(null, "", "/dashboard/orders");
          }
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load orders"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fromCheckout]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const rangeMs =
      range === "7d" ? 7 * 86400_000 : range === "30d" ? 30 * 86400_000 : Infinity;

    return orders.filter((o) => {
      if (q) {
        const hay = `${o.id} ${o.studentEmail} ${o.courseTitle} ${o.transactionId ?? ""} ${o.promoCode ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "all" && o.status !== status) return false;
      if (provider !== "all" && o.provider !== provider) return false;
      if (range !== "all") {
        const age = now - new Date(o.createdAt).getTime();
        if (Number.isFinite(age) && age > rangeMs) return false;
      }
      return true;
    });
  }, [orders, query, status, provider, range]);

  const stats = React.useMemo(() => {
    const total = filtered.length;
    const paid = filtered.filter((o) => o.status === "paid").length;
    const pending = filtered.filter((o) => o.status === "pending").length;
    const refunded = filtered.filter((o) => o.status === "refunded").length;
    const spent = filtered
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + Math.max(0, o.amount - (o.discountAmount ?? 0)), 0);
    return { total, paid, pending, refunded, spent };
  }, [filtered]);

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
              <div className="truncate text-sm text-zinc-500">{o.transactionId ?? "—"}</div>
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
              <div className="text-sm font-semibold text-zinc-900">{formatCurrency(net, o.currency)}</div>
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
          return (
            <div className="flex justify-end">
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
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load orders</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-zinc-600">Track payments and receipts.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Paid</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Spent</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {formatCurrency(stats.spent, "USD")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_180px_180px] sm:items-end">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Search</div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
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
              <Select value={range} onValueChange={(v) => setRange(v as RangeFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
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
                <ReceiptText className="h-7 w-7" />
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
                  setRange("30d");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              pageSize={10}
              enableRowSelection={false}
              emptyMessage="No orders found."
              className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
            />
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
    </div>
  );
}

