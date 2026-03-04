import Link from "next/link";
import { Star, Clock, Users, ShoppingCart, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TAG_STYLES } from "@/constants/courses";
import { ROUTES } from "@/constants";
import type { Course } from "@/types/course";
import { cn } from "@/lib/utils";

function formatPrice(value: number): string {
  if (value === 0) return "Free";
  return `$${value.toFixed(2)}`;
}

export function CourseCard({ course }: { course: Course }) {
  const tagStyle = TAG_STYLES[course.tag] ?? "bg-zinc-600 text-white";
  const detailsHref = `${ROUTES.COURSE_DETAILS}?course=${encodeURIComponent(course.id)}`;
  const hasSale = course.priceSale != null && course.priceSale > 0 && (course.priceRegular ?? 0) > (course.priceSale ?? 0);
  const displayPrice = hasSale ? course.priceSale! : (course.priceRegular ?? 0);
  const lessonsCount = course.lessons ?? Math.max(1, Math.round(course.durationHours * 4));

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
      <Link href={detailsHref} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-200">
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-300 to-zinc-400 transition-transform duration-300 group-hover:scale-105"
            aria-hidden
          />
          <span
            className={cn(
              "absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm",
              tagStyle
            )}
          >
            {course.tag}
          </span>
        </div>
      </Link>
      <CardHeader className="space-y-2 pb-2 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-medium text-zinc-700">
              {course.rating}
            </span>
            <span className="text-zinc-400">({course.reviewCount})</span>
          </span>
          {course.enrolledCount != null && course.enrolledCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-zinc-400" aria-hidden />
              <span>{course.enrolledCount.toLocaleString()} enrolled</span>
            </span>
          )}
        </div>
        <Link href={detailsHref} className="block">
          <h3 className="font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-gold line-clamp-2">
            {course.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-200" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{course.instructorName}</p>
            <p className="truncate text-xs text-zinc-500">{course.instructorTitle}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-3 text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              {course.durationHours}h
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" aria-hidden />
              {lessonsCount.toLocaleString()} lessons
            </span>
          </div>
          {(course.priceRegular != null || course.priceSale != null) && (
            <div className="flex items-center gap-2">
              {hasSale && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(course.priceRegular ?? 0)}
                </span>
              )}
              <span
                className={cn("font-semibold text-zinc-900", hasSale && "text-gold")}
              >
                {formatPrice(displayPrice)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-xl bg-gold font-medium text-gold-foreground hover:bg-gold/90"
          >
            <Link href={detailsHref}>View Details</Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 rounded-xl border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
