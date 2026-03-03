"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createPromoCodeSchema } from "@/lib/validations/promo";
import { fetchCourses } from "@/lib/dal/courses";
import { createPromoCode, getPromoCodeById, updatePromoCode } from "@/lib/dal/promo-codes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormInput } from "@/components/shared/forms";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/types/course";
import { ArrowLeft, Sparkles } from "lucide-react";

type FormValues = z.infer<typeof createPromoCodeSchema>;

function generateCode() {
  const words = ["WELCOME", "SAVE", "FLASH", "SPRING", "VIP", "YALLA"];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = String(Math.floor(10 + Math.random() * 90));
  const s = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${w}${n}${s}`;
}

export default function AdminPromoCodeNewPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminPromoCodeNewInner />
    </React.Suspense>
  );
}

function AdminPromoCodeNewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId?.trim());

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createPromoCodeSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 10,
      active: true,
      maxUsageEnabled: false,
      maxUsage: null,
      perCustomerLimitEnabled: false,
      perCustomerLimit: null,
      restrictToProductEnabled: false,
      productId: null,
    },
    mode: "onSubmit",
  });

  React.useEffect(() => {
    if (!isEdit || !editId) return;
    let cancelled = false;
    (async () => {
      setLoadError(null);
      const promo = await getPromoCodeById(editId);
      if (cancelled) return;
      if (!promo) {
        setLoadError("Promo code not found.");
        return;
      }
      methods.reset({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        active: promo.active,
        maxUsageEnabled: promo.maxUsageEnabled,
        maxUsage: promo.maxUsage,
        perCustomerLimitEnabled: promo.perCustomerLimitEnabled,
        perCustomerLimit: promo.perCustomerLimit,
        restrictToProductEnabled: promo.restrictToProductEnabled,
        productId: promo.productId,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, isEdit, methods]);

  const submit = methods.handleSubmit(async (data) => {
    const payload = {
      code: (data.code ?? "").trim().toUpperCase().replaceAll(" ", ""),
      discountType: data.discountType,
      discountValue: data.discountValue,
      active: data.active,
      maxUsageEnabled: data.maxUsageEnabled,
      maxUsage: data.maxUsageEnabled ? data.maxUsage ?? 0 : null,
      perCustomerLimitEnabled: data.perCustomerLimitEnabled,
      perCustomerLimit: data.perCustomerLimitEnabled ? data.perCustomerLimit ?? 0 : null,
      restrictToProductEnabled: data.restrictToProductEnabled,
      productId: data.restrictToProductEnabled ? data.productId ?? null : null,
    };
    if (isEdit && editId) {
      await updatePromoCode(editId, payload);
    } else {
      await createPromoCode(payload);
    }
    router.push("/admin/promo-codes");
    router.refresh();
  });

  const discountType = methods.watch("discountType");
  const maxUsageEnabled = methods.watch("maxUsageEnabled");
  const perCustomerLimitEnabled = methods.watch("perCustomerLimitEnabled");
  const restrictToProductEnabled = methods.watch("restrictToProductEnabled");
  const active = methods.watch("active") ?? true;
  const productId = methods.watch("productId") ?? null;

  React.useEffect(() => {
    if (!restrictToProductEnabled) return;
    if (courses.length > 0) return;
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      try {
        const data = await fetchCourses();
        if (!cancelled) setCourses(data);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restrictToProductEnabled, courses.length]);

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-xl border-zinc-200">
              <Link href="/admin/promo-codes">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                {isEdit ? "Edit promo code" : "New promo code"}
              </h1>
              <p className="text-sm text-zinc-600">
                {isEdit ? "Update discount code and limits." : "Create a discount code."}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-zinc-200"
              onClick={() => methods.setValue("code", generateCode(), { shouldDirty: true })}
            >
              <Sparkles className="h-4 w-4" />
              Generate code
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={submit}
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting ? "Saving…" : isEdit ? "Update promo code" : "Save promo code"}
            </Button>
          </div>
        </div>

        {loadError ? (
          <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-rose-800">{loadError}</p>
              <Button asChild variant="outline" className="mt-3 rounded-xl border-rose-200">
                <Link href="/admin/promo-codes">Back to promo codes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
        <form onSubmit={submit} className="max-w-5xl space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Promo</CardTitle>
                <CardDescription>Code and discount.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <FormField name="code" label="Promo code" required>
                  {({ id, error, fieldValue, ...rest }) => (
                    <FormInput
                      id={id}
                      error={error}
                      placeholder="e.g. WELCOME10"
                      className="rounded-xl border-zinc-200"
                      value={String(fieldValue ?? "")}
                      {...rest}
                      onChange={(e) => {
                        const next = e.target.value.toUpperCase().replaceAll(" ", "");
                        methods.setValue("code", next, { shouldDirty: true, shouldValidate: true });
                      }}
                    />
                  )}
                </FormField>

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Active</p>
                    <p className="text-xs text-zinc-500">Customers can use the code at checkout.</p>
                  </div>
                  <FormField name="active">
                    {({ id }) => (
                      <Switch
                        id={id}
                        checked={active}
                        onCheckedChange={(checked) => methods.setValue("active", !!checked)}
                        className="data-[state=checked]:bg-gold"
                      />
                    )}
                  </FormField>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-zinc-900">Discount type</p>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={discountType === "percentage"}
                        onChange={() => methods.setValue("discountType", "percentage", { shouldDirty: true })}
                        className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                      />
                      <span className="text-sm font-medium text-zinc-700">Percentage</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="discountType"
                        value="fixed"
                        checked={discountType === "fixed"}
                        onChange={() => methods.setValue("discountType", "fixed", { shouldDirty: true })}
                        className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                      />
                      <span className="text-sm font-medium text-zinc-700">Fixed (USD)</span>
                    </label>
                  </div>
                </div>

                <FormField name="discountValue" label="Discount value">
                  {({ id, error, ...rest }) => (
                    <div className="flex items-center gap-2">
                      <FormInput
                        id={id}
                        error={error}
                        type="number"
                        min={0}
                        step={discountType === "percentage" ? 1 : 0.01}
                        className="max-w-[160px] rounded-xl border-zinc-200"
                        {...rest}
                      />
                      <span className="text-sm font-medium text-zinc-600">
                        {discountType === "percentage" ? "%" : "USD"}
                      </span>
                    </div>
                  )}
                </FormField>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Limits</CardTitle>
                <CardDescription>Optional usage limits and scope.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Max usage count</p>
                    <p className="text-xs text-zinc-500">Limit total uses (optional).</p>
                  </div>
                  <FormField name="maxUsageEnabled">
                    {({ id }) => (
                      <Switch
                        id={id}
                        checked={maxUsageEnabled ?? false}
                        onCheckedChange={(checked) => methods.setValue("maxUsageEnabled", !!checked)}
                        className="data-[state=checked]:bg-gold"
                      />
                    )}
                  </FormField>
                </div>
                {maxUsageEnabled && (
                  <FormField name="maxUsage" label="Maximum uses">
                    {({ id, error, ...rest }) => (
                      <FormInput
                        id={id}
                        error={error}
                        type="number"
                        min={0}
                        className="max-w-[180px] rounded-xl border-zinc-200"
                        {...rest}
                      />
                    )}
                  </FormField>
                )}

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Per-customer limit</p>
                    <p className="text-xs text-zinc-500">Limit uses per customer (optional).</p>
                  </div>
                  <FormField name="perCustomerLimitEnabled">
                    {({ id }) => (
                      <Switch
                        id={id}
                        checked={perCustomerLimitEnabled ?? false}
                        onCheckedChange={(checked) => methods.setValue("perCustomerLimitEnabled", !!checked)}
                        className="data-[state=checked]:bg-gold"
                      />
                    )}
                  </FormField>
                </div>
                {perCustomerLimitEnabled && (
                  <FormField name="perCustomerLimit" label="Uses per customer">
                    {({ id, error, ...rest }) => (
                      <FormInput
                        id={id}
                        error={error}
                        type="number"
                        min={0}
                        className="max-w-[180px] rounded-xl border-zinc-200"
                        {...rest}
                      />
                    )}
                  </FormField>
                )}

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Restrict to a course</p>
                    <p className="text-xs text-zinc-500">Optional: only valid for one course.</p>
                  </div>
                  <FormField name="restrictToProductEnabled">
                    {({ id }) => (
                      <Switch
                        id={id}
                        checked={restrictToProductEnabled ?? false}
                        onCheckedChange={(checked) => methods.setValue("restrictToProductEnabled", !!checked)}
                        className="data-[state=checked]:bg-gold"
                      />
                    )}
                  </FormField>
                </div>

                {restrictToProductEnabled && (
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium text-zinc-900">Course</div>
                    <Select
                      value={productId ?? ""}
                      onValueChange={(v) =>
                        methods.setValue("productId", v || null, { shouldDirty: true, shouldValidate: true })
                      }
                      disabled={coursesLoading}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                        <SelectValue placeholder={coursesLoading ? "Loading courses…" : "Select a course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
        )}
      </div>
    </FormProvider>
  );
}
