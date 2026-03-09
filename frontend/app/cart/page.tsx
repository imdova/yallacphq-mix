"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";
import { CoursesFooter } from "@/components/features/courses/CoursesFooter";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { getPublicCourse } from "@/lib/dal/courses";
import type { Course } from "@/types/course";
import { ROUTES } from "@/constants";
import { ShoppingCart, Trash2 } from "lucide-react";

function formatPrice(value: number): string {
  if (value === 0) return "Free";
  return `$${value.toFixed(2)}`;
}

export default function CartPage() {
  const router = useRouter();
  const { status } = useAuth();
  const { courseIds, removeFromCart, loading } = useCart();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);

  React.useEffect(() => {
    if (status !== "authenticated") {
      router.replace(`/auth/login?next=${encodeURIComponent("/cart")}`);
      return;
    }
  }, [status, router]);

  React.useEffect(() => {
    if (courseIds.length === 0) {
      setCourses([]);
      setLoadingCourses(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingCourses(true);
      const list: Course[] = [];
      for (const id of courseIds) {
        const c = await getPublicCourse(id);
        if (!cancelled && c) list.push(c);
      }
      if (!cancelled) setCourses(list);
      setLoadingCourses(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseIds]);

  const total = courses.reduce((sum, c) => {
    const sale = c.priceSale != null && c.priceSale > 0 && (c.priceRegular ?? 0) > (c.priceSale ?? 0);
    const price = sale ? (c.priceSale ?? 0) : (c.priceRegular ?? 0);
    return sum + price;
  }, 0);

  if (status === "loading" || status === "idle") {
    return (
      <div className="min-h-screen bg-zinc-100">
        <CoursesHeader />
        <main className="container px-4 py-12 md:px-6">
          <p className="text-zinc-500">Loading…</p>
        </main>
        <CoursesFooter />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <CoursesHeader />
      <main className="container px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Your Cart</h1>
        <p className="mt-1 text-zinc-600">
          {courseIds.length === 0
            ? "Your cart is empty."
            : `${courseIds.length} course${courseIds.length === 1 ? "" : "s"} in your cart.`}
        </p>

        {loading || loadingCourses ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-zinc-200">
                <div className="aspect-video animate-pulse bg-zinc-200" />
                <CardContent className="p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 && courseIds.length > 0 ? (
          <p className="mt-6 text-zinc-500">Loading course details…</p>
        ) : courses.length === 0 ? (
          <Card className="mt-8 rounded-2xl border-zinc-200 bg-white p-8 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 font-medium text-zinc-900">Your cart is empty</p>
            <p className="mt-1 text-sm text-zinc-500">Add courses from the catalog to get started.</p>
            <Button asChild className="mt-6 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href="/courses">Browse courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-4">
              {courses.map((course) => {
                const hasSale =
                  course.priceSale != null &&
                  course.priceSale > 0 &&
                  (course.priceRegular ?? 0) > (course.priceSale ?? 0);
                const displayPrice = hasSale ? course.priceSale! : (course.priceRegular ?? 0);
                return (
                  <li key={course.id}>
                    <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white">
                      <div className="flex flex-col sm:flex-row">
                        <Link
                          href={`${ROUTES.COURSE_DETAILS}?course=${encodeURIComponent(course.id)}`}
                          className="relative block aspect-video w-full shrink-0 bg-zinc-200 sm:w-48"
                        >
                          {course.imageUrl ? (
                            <Image
                              src={course.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </Link>
                        <div className="flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              href={`${ROUTES.COURSE_DETAILS}?course=${encodeURIComponent(course.id)}`}
                              className="font-semibold text-zinc-900 hover:text-gold"
                            >
                              {course.title}
                            </Link>
                            <p className="mt-0.5 text-sm text-zinc-500">{course.instructorName}</p>
                            <p className="mt-2 font-semibold text-zinc-900">
                              {formatPrice(displayPrice)}
                              {hasSale && (
                                <span className="ml-2 text-xs font-normal text-zinc-400 line-through">
                                  {formatPrice(course.priceRegular ?? 0)}
                                </span>
                              )}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-3 shrink-0 text-zinc-500 hover:text-rose-600 sm:mt-0"
                            onClick={() => void removeFromCart(course.id)}
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="rounded-2xl border-zinc-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-zinc-900">Summary</h2>
                <p className="mt-2 text-2xl font-bold text-gold">
                  Total: {formatPrice(total)}
                </p>
                <Button
                  asChild
                  className="mt-4 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <Link href={ROUTES.CHECKOUT}>Proceed to checkout</Link>
                </Button>
                <Link
                  href="/courses"
                  className="mt-3 block text-center text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Continue shopping
                </Link>
              </Card>
            </div>
          </div>
        )}
      </main>
      <CoursesFooter />
    </div>
  );
}
