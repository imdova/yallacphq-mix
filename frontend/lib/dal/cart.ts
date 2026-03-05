import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import { cartResponseSchema } from "@/lib/api/contracts/cart";

const CART_PREFIX = "/api/cart";

export async function getCart(): Promise<string[]> {
  const res = await apiGet(`${CART_PREFIX}`, { schema: cartResponseSchema });
  return res.courseIds;
}

export async function addToCart(courseId: string): Promise<string[]> {
  const res = await apiPost(
    `${CART_PREFIX}/items`,
    { courseId },
    { schema: cartResponseSchema }
  );
  return res.courseIds;
}

export async function removeFromCart(courseId: string): Promise<string[]> {
  const res = await apiDelete(
    `${CART_PREFIX}/items/${encodeURIComponent(courseId)}`,
    { schema: cartResponseSchema }
  );
  return res.courseIds;
}

export async function clearCart(): Promise<void> {
  await apiDelete(`${CART_PREFIX}`, { schema: cartResponseSchema });
}
