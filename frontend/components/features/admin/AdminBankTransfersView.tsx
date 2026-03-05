"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminOrders, updateOrderStatus } from "@/lib/dal/orders";
import type { Order } from "@/types/order";
import { getErrorMessage } from "@/lib/api/error";
import { BadgeCheck, Building2, ExternalLink, Loader2 } from "lucide-react";

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

export function AdminBankTransfersView() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  const pendingBank = React.useMemo(
    () => orders.filter((o) => o.provider === "manual" && o.status === "pending"),
    [orders]
  );

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

  const handleApprove = async (order: Order) => {
    setApprovingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, "paid");
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      }
    } catch (e) {
      setError(getErrorMessage(e, "Failed to approve payment"));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Bank Transfers</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Review and approve pending bank transfer orders. After approval, students get access to their purchased courses.
        </p>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="mt-3 text-sm text-zinc-600">Loading orders…</p>
            </div>
          ) : pendingBank.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-14 w-14 text-zinc-300" />
              <p className="mt-4 text-base font-semibold text-zinc-800">No pending bank transfers</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Orders paid via bank transfer will appear here for approval.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {pendingBank.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-zinc-900">#{order.id}</div>
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
                    <Button
                      className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={approvingId === order.id}
                      onClick={() => void handleApprove(order)}
                    >
                      {approvingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <BadgeCheck className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
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
