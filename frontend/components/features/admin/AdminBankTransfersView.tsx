"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminOrders, updateOrderStatus } from "@/lib/dal/orders";
import type { Order } from "@/types/order";
import { getErrorMessage } from "@/lib/api/error";
import { BadgeCheck, Building2, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currency?.trim() || "USD" }).format(amount);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(status: Order["status"]) {
  switch (status) {
    case "paid":
      return "Approved";
    case "failed":
      return "Rejected";
    case "refunded":
      return "Refunded";
    default:
      return "Pending";
  }
}

function statusClassName(status: Order["status"]) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "failed":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "refunded":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

export function AdminBankTransfersView() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actingId, setActingId] = React.useState<string | null>(null);

  const bankTransfers = React.useMemo(
    () =>
      orders
        .filter((o) => o.provider === "manual")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [orders]
  );

  const stats = React.useMemo(() => {
    const total = bankTransfers.length;
    const pending = bankTransfers.filter((o) => o.status === "pending").length;
    const approved = bankTransfers.filter((o) => o.status === "paid").length;
    const rejected = bankTransfers.filter((o) => o.status === "failed").length;
    return { total, pending, approved, rejected };
  }, [bankTransfers]);

  const load = React.useCallback(async () => {
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
    void load();
  }, [load]);

  const handleStatusChange = async (order: Order, status: Order["status"]) => {
    setActingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, status);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      }
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          status === "paid" ? "Failed to approve payment" : "Failed to reject transfer"
        )
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Bank Transfers</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Review all bank transfer orders and approve or reject pending transfers. After approval, students get access to their purchased courses.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total transfers
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pending
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Approved
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rejected
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Transfer requests</h2>
              <p className="text-sm text-zinc-500">All manual payment orders are shown here.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-zinc-200" onClick={() => void load()} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="mt-3 text-sm text-zinc-600">Loading orders…</p>
            </div>
          ) : bankTransfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-14 w-14 text-zinc-300" />
              <p className="mt-4 text-base font-semibold text-zinc-800">No bank transfers yet</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Orders paid via bank transfer will appear here for review.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {bankTransfers.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-zinc-900">#{order.id}</div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-600">
                      {order.studentName} · {order.studentEmail}
                    </div>
                    <div className="mt-1 text-sm text-zinc-700">{order.courseTitle}</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {formatCurrency(order.amount - (order.discountAmount ?? 0), order.currency)}
                      {(order.discountAmount ?? 0) > 0 && (
                        <span className="ml-2 text-zinc-500">
                          (discount {formatCurrency(order.discountAmount ?? 0, order.currency)}
                          {order.promoCode ? ` · ${order.promoCode}` : ""})
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {order.bankTransferProofUrl ? (
                      <a
                        href={order.bankTransferProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        View receipt
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-500">No receipt</span>
                    )}
                    {order.status === "pending" ? (
                      <>
                        <Button
                          variant="outline"
                          className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          disabled={actingId === order.id}
                          onClick={() => void handleStatusChange(order, "failed")}
                        >
                          {actingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={actingId === order.id}
                          onClick={() => void handleStatusChange(order, "paid")}
                        >
                          {actingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <BadgeCheck className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-zinc-500">
                        {order.status === "paid"
                          ? "Approved"
                          : order.status === "failed"
                            ? "Rejected"
                            : "Completed"}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
