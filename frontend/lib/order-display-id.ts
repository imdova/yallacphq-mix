/**
 * User-facing order ID: never show raw Mongo ObjectId.
 * Uses publicId when present, otherwise derives #COURSE-XXXX from courseTitle + short id suffix.
 */
export function getOrderDisplayId(order: {
  publicId?: string;
  courseTitle?: string;
  id: string;
}): string {
  if (order.publicId?.trim()) return order.publicId.trim();
  const prefix = (order.courseTitle ?? "")
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 5) || "ORDER";
  const suffix = (order.id ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  return `#${prefix}-${suffix}`;
}
