"use client";

import * as React from "react";
import Link from "next/link";
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
import { deletePromoCode, getPromoCodes, updatePromoCode } from "@/lib/dal/promo-codes";
import type { PromoCode } from "@/types/promo";
import { cn } from "@/lib/utils";
import { Copy, Pencil, Plus, Search, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";

type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = "all" | PromoCode["discountType"];
type ScopeFilter = "all" | "sitewide" | "restricted";
type LimitFilter = "all" | "limited" | "unlimited";

function formatUsd(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function formatDiscount(p: PromoCode) {
  return p.discountType === "percentage" ? `${p.discountValue}%` : formatUsd(p.discountValue);
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

export function AdminPromoCodesView() {
  const [promos, setPromos] = React.useState<PromoCode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>("all");
  const [limitFilter, setLimitFilter] = React.useState<LimitFilter>("all");
  const [query, setQuery] = React.useState("");

  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<PromoCode | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPromoCodes();
        if (!cancelled) setPromos(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load promo codes"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = React.useMemo(() => {
    const total = promos.length;
    const active = promos.filter((p) => p.active).length;
    const inactive = total - active;
    const totalUses = promos.reduce((acc, p) => acc + (p.usageCount ?? 0), 0);
    const restricted = promos.filter((p) => p.restrictToProductEnabled).length;
    return { total, active, inactive, totalUses, restricted };
  }, [promos]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return promos.filter((p) => {
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !p.active) return false;
        if (statusFilter === "inactive" && p.active) return false;
      }
      if (typeFilter !== "all" && p.discountType !== typeFilter) return false;
      if (scopeFilter !== "all") {
        const restricted = !!p.restrictToProductEnabled;
        if (scopeFilter === "restricted" && !restricted) return false;
        if (scopeFilter === "sitewide" && restricted) return false;
      }
      if (limitFilter !== "all") {
        const limited = !!p.maxUsageEnabled;
        if (limitFilter === "limited" && !limited) return false;
        if (limitFilter === "unlimited" && limited) return false;
      }
      if (!q) return true;
      return (
        p.code.toLowerCase().includes(q) ||
        String(p.discountValue).toLowerCase().includes(q) ||
        (p.productId ?? "").toLowerCase().includes(q)
      );
    });
  }, [promos, statusFilter, typeFilter, scopeFilter, limitFilter, query]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const ok = await deletePromoCode(deleting.id);
      if (ok) setPromos((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleteOpen(false);
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    setTogglingId(promo.id);
    try {
      const updated = await updatePromoCode(promo.id, { active: !promo.active });
      if (!updated) return;
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<PromoCode>[] = React.useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Promo code",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-zinc-900">{row.original.code}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-xl border-zinc-200"
                onClick={() => void copyText(row.original.code)}
                aria-label="Copy promo code"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                  row.original.active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-700"
                )}
              >
                {row.original.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-zinc-500">
              {row.original.restrictToProductEnabled
                ? `Restricted · ${row.original.productId ?? "—"}`
                : "Sitewide"}
            </div>
          </div>
        ),
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => {
          const p = row.original;
          const typeBadge =
            p.discountType === "percentage"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-amber-50 text-amber-700 border-amber-200";
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                    typeBadge
                  )}
                >
                  {p.discountType}
                </span>
                <span className="text-sm font-semibold text-zinc-900">{formatDiscount(p)}</span>
              </div>
              {p.discountType === "fixed" ? (
                <div className="text-xs text-zinc-500">USD amount off</div>
              ) : (
                <div className="text-xs text-zinc-500">Percentage off</div>
              )}
            </div>
          );
        },
      },
      {
        id: "limits",
        header: "Limits",
        cell: ({ row }) => {
          const p = row.original;
          const maxUsage = p.maxUsageEnabled && p.maxUsage != null ? p.maxUsage : null;
          const perCustomer =
            p.perCustomerLimitEnabled && p.perCustomerLimit != null ? p.perCustomerLimit : null;
          return (
            <div className="space-y-1">
              <div className="text-sm text-zinc-700">
                {maxUsage != null ? `Max ${maxUsage}` : "Unlimited"}
              </div>
              <div className="text-xs text-zinc-500">
                {perCustomer != null ? `Per customer ${perCustomer}` : "No per-customer limit"}
              </div>
            </div>
          );
        },
      },
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => {
          const p = row.original;
          const maxUsage = p.maxUsageEnabled && p.maxUsage != null ? p.maxUsage : null;
          const pct = maxUsage && maxUsage > 0 ? Math.min(100, Math.round((p.usageCount / maxUsage) * 100)) : null;
          return (
            <div className="space-y-1">
              <div className="text-sm font-medium text-zinc-800">
                {maxUsage != null ? `${p.usageCount}/${maxUsage}` : `${p.usageCount}`}
              </div>
              {pct != null ? (
                <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
              ) : (
                <div className="text-xs text-zinc-500">No cap</div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200"
              onClick={() => void toggleActive(row.original)}
              disabled={togglingId === row.original.id}
              aria-label={row.original.active ? "Deactivate promo code" : "Activate promo code"}
            >
              {row.original.active ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200"
              aria-label="Edit"
            >
              <Link href={`/admin/promo-codes/new?edit=${row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeleting(row.original);
                setDeleteOpen(true);
              }}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [togglingId]
  );

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load promo codes</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total codes
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {stats.active} active · {stats.inactive} inactive
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total uses
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.totalUses}</div>
            <div className="mt-1 text-xs text-zinc-500">Across all promo codes</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Restricted
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.restricted}</div>
            <div className="mt-1 text-xs text-zinc-500">Locked to a product/course</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Showing
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{filtered.length}</div>
            <div className="mt-1 text-xs text-zinc-500">Within selected filters</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_140px_140px_140px_140px_auto] sm:items-end">
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="text-xs font-semibold text-zinc-600">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Code, value, product id…"
                  className="h-10 rounded-xl border-zinc-200 bg-white pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Status</div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Type</div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Scope</div>
              <Select value={scopeFilter} onValueChange={(v) => setScopeFilter(v as ScopeFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sitewide">Sitewide</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Max usage</div>
              <Select value={limitFilter} onValueChange={(v) => setLimitFilter(v as LimitFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              asChild
              className="h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto lg:min-w-[140px]"
            >
              <Link href="/admin/promo-codes/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add promo code
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/80 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-600">Loading promo codes…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200/80 text-zinc-500">
                <Copy className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-zinc-800">No promo codes found</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Try adjusting filters, or create a new promo code.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl border-zinc-200"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setScopeFilter("all");
                  setLimitFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {/* Narrow viewport: card list */}
              <div className="block xl:hidden space-y-3">
                {filtered.map((p) => {
                  const maxUsage = p.maxUsageEnabled && p.maxUsage != null ? p.maxUsage : null;
                  const pct =
                    maxUsage && maxUsage > 0
                      ? Math.min(100, Math.round((p.usageCount / maxUsage) * 100))
                      : null;
                  return (
                    <Card
                      key={p.id}
                      className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-semibold text-zinc-900">{p.code}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 shrink-0 rounded-xl border-zinc-200"
                                onClick={() => void copyText(p.code)}
                                aria-label="Copy promo code"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                                  p.active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-zinc-200 bg-zinc-100 text-zinc-700"
                                )}
                              >
                                {p.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
                                  p.discountType === "percentage"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                              >
                                {p.discountType}
                              </span>
                              <span className="font-semibold text-zinc-900">{formatDiscount(p)}</span>
                              <span className="text-zinc-500">
                                {p.restrictToProductEnabled
                                  ? `Restricted · ${p.productId ?? "—"}`
                                  : "Sitewide"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                              <span>
                                {maxUsage != null ? `Max ${maxUsage}` : "Unlimited"} ·{" "}
                                {p.perCustomerLimit != null
                                  ? `Per customer ${p.perCustomerLimit}`
                                  : "No per-customer limit"}
                              </span>
                            </div>
                            {maxUsage != null ? (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-zinc-700">
                                  Usage: {p.usageCount}/{maxUsage}
                                </div>
                                <div className="h-2 w-full max-w-32 overflow-hidden rounded-full bg-zinc-200">
                                  <div
                                    className="h-full bg-gold"
                                    style={{ width: `${pct ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-zinc-500">Usage: {p.usageCount}</div>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-zinc-200"
                              onClick={() => void toggleActive(p)}
                              disabled={togglingId === p.id}
                              aria-label={p.active ? "Deactivate" : "Activate"}
                            >
                              {p.active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-zinc-200"
                              aria-label="Edit"
                            >
                              <Link href={`/admin/promo-codes/new?edit=${p.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setDeleting(p);
                                setDeleteOpen(true);
                              }}
                              aria-label="Delete"
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

              {/* Wide viewport: table */}
              <div className="hidden xl:block overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[900px] px-4 sm:px-0">
                  <DataTable
                    columns={columns}
                    data={filtered}
                    pageSize={10}
                    enableRowSelection={false}
                    emptyMessage="No promo codes found."
                    className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete promo code?"
        description={
          deleting
            ? `This will permanently remove “${deleting.code}”.`
            : "This will permanently remove the promo code."
        }
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
