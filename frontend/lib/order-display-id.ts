export function getOrderDisplayId(order: {
  id: string;
  publicId?: string;
  courseTitle?: string;
}): string {
  const publicId = order.publicId?.trim();
  if (publicId) {
    return publicId.startsWith("#") ? publicId : `#${publicId}`;
  }

  const prefix =
    order.courseTitle
      ?.replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 5) || "ORDER";
  const suffix =
    order.id
      ?.replace(/[^A-Za-z0-9]/g, "")
      .slice(-4)
      .toUpperCase() || "0000";

  return `#${prefix}-${suffix}`;
}
