"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createPromoCodeSchema } from "@/lib/validations/promo";
import { getPromoCodeById, updatePromoCode } from "@/lib/dal/promo-codes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormInput } from "@/components/shared/forms";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

type FormValues = z.infer<typeof createPromoCodeSchema>;

export default function AdminPromoCodeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createPromoCodeSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 0,
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
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const promo = await getPromoCodeById(id);
        if (cancelled) return;
        if (!promo) {
          setNotFound(true);
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, methods]);

  const submit = methods.handleSubmit(async (data) => {
    if (!id) return;
    const updated = await updatePromoCode(id, {
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      active: data.active,
      maxUsageEnabled: data.maxUsageEnabled,
      maxUsage: data.maxUsageEnabled ? data.maxUsage ?? 0 : null,
      perCustomerLimitEnabled: data.perCustomerLimitEnabled,
      perCustomerLimit: data.perCustomerLimitEnabled ? data.perCustomerLimit ?? 0 : null,
      restrictToProductEnabled: data.restrictToProductEnabled,
      productId: data.restrictToProductEnabled ? data.productId ?? null : null,
    });
    if (updated) {
      router.push("/admin/promo-codes");
      router.refresh();
    }
  });

  const discountType = methods.watch("discountType");
  const maxUsageEnabled = methods.watch("maxUsageEnabled");
  const perCustomerLimitEnabled = methods.watch("perCustomerLimitEnabled");
  const restrictToProductEnabled = methods.watch("restrictToProductEnabled");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">Promo code not found.</p>
        <Button asChild variant="outline" className="rounded-xl border-zinc-200">
          <Link href="/admin/promo-codes">Back to promo codes</Link>
        </Button>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">Edit promo code</h1>
              <p className="text-sm text-zinc-600">Update the discount code.</p>
            </div>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
            onClick={submit}
          >
            Save changes
          </Button>
        </div>

        <form onSubmit={submit} className="max-w-2xl space-y-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Promo code</CardTitle>
              <CardDescription>Define the code and discount.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              <FormField name="code" label="Promo code" required>
                {({ id, error, ...rest }) => (
                  <div className="space-y-1.5">
                    <FormInput
                      id={id}
                      error={error}
                      placeholder="E.G. DISCOUNT10, SUMMER2021"
                      className="rounded-xl border-zinc-200"
                      {...rest}
                    />
                    <p className="text-xs text-zinc-500">
                      Enter the promo code that customers will use
                    </p>
                  </div>
                )}
              </FormField>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-900">
                  Choose whether the discount is a percentage or fixed amount
                </p>
                <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={discountType === "percentage"}
                      onChange={() => methods.setValue("discountType", "percentage")}
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
                      onChange={() => methods.setValue("discountType", "fixed")}
                      className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                    />
                    <span className="text-sm font-medium text-zinc-700">Fixed amount</span>
                  </label>
                </div>
              </div>

              <FormField name="discountValue" label="Discount value">
                {({ id, error, ...rest }) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FormInput
                        id={id}
                        error={error}
                        type="number"
                        min={0}
                        step={discountType === "percentage" ? 1 : 0.01}
                        className="rounded-xl border-zinc-200 max-w-[120px]"
                        {...rest}
                      />
                      <span className="text-sm font-medium text-zinc-600">
                        {discountType === "percentage" ? "%" : "$"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Enter the discount amount or percentage
                    </p>
                  </div>
                )}
              </FormField>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Active</p>
                  <p className="text-xs text-zinc-500">
                    You can deactivate the promo code to prevent its use
                  </p>
                </div>
                <FormField name="active">
                  {({ id }) => (
                    <Switch
                      id={id}
                      checked={methods.watch("active") ?? true}
                      onCheckedChange={(checked) => methods.setValue("active", !!checked)}
                      className="data-[state=checked]:bg-zinc-900"
                    />
                  )}
                </FormField>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Max usage count</p>
                  <p className="text-xs text-zinc-500">
                    Maximum number of times this promo code can be used
                  </p>
                </div>
                <FormField name="maxUsageEnabled">
                  {({ id }) => (
                    <Switch
                      id={id}
                      checked={maxUsageEnabled ?? false}
                      onCheckedChange={(checked) => methods.setValue("maxUsageEnabled", !!checked)}
                      className="data-[state=checked]:bg-zinc-900"
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
                      className="rounded-xl border-zinc-200 max-w-[120px]"
                      {...rest}
                    />
                  )}
                </FormField>
              )}

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Enable per-customer usage limit</p>
                  <p className="text-xs text-zinc-500">
                    Limit how many times each customer can use this promo code
                  </p>
                </div>
                <FormField name="perCustomerLimitEnabled">
                  {({ id }) => (
                    <Switch
                      id={id}
                      checked={perCustomerLimitEnabled ?? false}
                      onCheckedChange={(checked) =>
                        methods.setValue("perCustomerLimitEnabled", !!checked)
                      }
                      className="data-[state=checked]:bg-zinc-900"
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
                      className="rounded-xl border-zinc-200 max-w-[120px]"
                      {...rest}
                    />
                  )}
                </FormField>
              )}

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Restrict to specific product</p>
                  <p className="text-xs text-zinc-500">
                    Only allow this promo code to be used for a specific product
                  </p>
                </div>
                <FormField name="restrictToProductEnabled">
                  {({ id }) => (
                    <Switch
                      id={id}
                      checked={restrictToProductEnabled ?? false}
                      onCheckedChange={(checked) =>
                        methods.setValue("restrictToProductEnabled", !!checked)
                      }
                      className="data-[state=checked]:bg-zinc-900"
                    />
                  )}
                </FormField>
              </div>
              {restrictToProductEnabled && (
                <FormField name="productId" label="Product ID (optional)">
                  {({ id, error, ...rest }) => (
                    <FormInput
                      id={id}
                      error={error}
                      placeholder="e.g. course-id or product-id"
                      className="rounded-xl border-zinc-200"
                      {...rest}
                    />
                  )}
                </FormField>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </FormProvider>
  );
}
