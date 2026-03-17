/**
 * User-facing order ID: # + first 5 chars of course (no spaces, upper) + random/deterministic suffix.
 */

function coursePrefix(courseTitle: string): string {
  const normalized = (courseTitle || '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 5);
  return normalized || 'COURSE';
}

/** For new orders: random 4-char suffix. */
export function generatePublicId(courseTitle: string): string {
  const prefix = coursePrefix(courseTitle);
  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || '0000';
  return `#${prefix}-${random}`;
}

/** For existing orders without publicId: deterministic suffix from order id so it's stable. */
export function getPublicIdForOrder(courseTitle: string, orderId: string, existingPublicId?: string): string {
  if (existingPublicId) return existingPublicId;
  const prefix = coursePrefix(courseTitle);
  const suffix = (orderId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0000';
  return `#${prefix}-${suffix}`;
}
