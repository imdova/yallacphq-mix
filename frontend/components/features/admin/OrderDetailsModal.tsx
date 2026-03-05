"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";
import { Copy, ReceiptText } from "lucide-react";

function formatCurrency(amount: number, currency: string) {
  const cur = currency?.trim() || "USD";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount);
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
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

export function OrderDetailsModal({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}) {
  const net = order ? Math.max(0, order.amount - (order.discountAmount ?? 0)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-gold" />
            Order details
          </DialogTitle>
          <DialogDescription>
            {order ? (
              <span className="inline-flex items-center gap-2">
                <span>
                  Order <span className="font-semibold text-zinc-800">#{order.id}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-zinc-200"
                  onClick={() => void copyText(order.id)}
                  aria-label="Copy order ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </span>
            ) : (
              "Order information"
            )}
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Student
                </div>
                <div className="mt-1 font-semibold text-zinc-900">{order.studentName}</div>
                <div className="mt-0.5 text-sm text-zinc-600">{order.studentEmail}</div>
                {order.studentPhone?.trim() ? (
                  <div className="mt-0.5 text-sm text-zinc-600">{order.studentPhone.trim()}</div>
                ) : null}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Course
                </div>
                <div className="mt-1 font-semibold text-zinc-900">{order.courseTitle}</div>
                <div className="mt-0.5 text-sm text-zinc-600">
                  Provider: {order.provider} · Method: {order.paymentMethod ?? "—"}
                </div>
                {order.provider === "manual" && order.bankTransferProofUrl ? (
                  <a
                    href={order.bankTransferProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
                  >
                    View bank transfer receipt
                    <span aria-hidden>↗</span>
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Amount
                </div>
                <div className="mt-1 text-lg font-bold text-zinc-900">
                  {formatCurrency(net, order.currency)}
                </div>
                {(order.discountAmount ?? 0) > 0 ? (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    Discount {formatCurrency(order.discountAmount ?? 0, order.currency)}
                    {order.promoCode ? ` · ${order.promoCode}` : ""}
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs text-zinc-500">No discount</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </div>
                <div className="mt-1 font-semibold text-zinc-900">{order.status}</div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  Paid: {formatDateTime(order.paidAt)} · Refunded: {formatDateTime(order.refundedAt)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Timeline
                </div>
                <div className="mt-1 text-sm text-zinc-700">
                  Created: {formatDateTime(order.createdAt)}
                </div>
                <div className="mt-0.5 text-sm text-zinc-700">
                  Updated: {formatDateTime(order.updatedAt)}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  Transaction: {order.transactionId ?? "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
            Select an order to see details.
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

