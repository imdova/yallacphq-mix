import type { CreateOrderInput, Order, UpdateOrderInput } from "@/types/order";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { CreatePaymentSessionBody } from "@/lib/api/contracts/checkout";
import {
  adminDeleteOrderResponseSchema,
  listOrdersResponseSchema,
  orderNullableResponseSchema,
  orderResponseSchema,
} from "@/lib/api/contracts/order";
import {
  confirmPaymentResponseSchema,
  createPaymentSessionResponseSchema,
} from "@/lib/api/contracts/checkout";

export async function fetchMyOrders(): Promise<Order[]> {
  return getUserOrders();
}

export async function fetchAdminOrders(): Promise<Order[]> {
  return getAdminOrders();
}

export async function fetchAdminOrderById(id: string): Promise<Order | null> {
  const res = await apiGet(`/api/admin/orders/${encodeURIComponent(id)}`, {
    schema: orderNullableResponseSchema,
  });
  return (res.order as Order | null) ?? null;
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const res = await apiPost("/api/orders", data, { schema: orderResponseSchema });
  return res.order as Order;
}

export async function updateAdminOrder(id: string, data: UpdateOrderInput): Promise<Order | null> {
  const res = await apiPatch(`/api/admin/orders/${encodeURIComponent(id)}`, data, {
    schema: orderResponseSchema,
  });
  return (res.order as Order) ?? null;
}

export async function removeAdminOrder(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/orders/${encodeURIComponent(id)}`, { schema: adminDeleteOrderResponseSchema });
  return true;
}

// ---- Phase 4 canonical API (preferred) ----

export async function getAdminOrders(): Promise<Order[]> {
  const res = await apiGet("/api/admin/orders", { schema: listOrdersResponseSchema });
  return res.items as Order[];
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  const res = await apiPatch(`/api/admin/orders/${encodeURIComponent(id)}`, { status }, { schema: orderResponseSchema });
  return (res.order as Order) ?? null;
}

export async function getUserOrders(): Promise<Order[]> {
  const res = await apiGet("/api/orders", { schema: listOrdersResponseSchema });
  return res.items as Order[];
}

export async function createPaymentSession(
  data: CreatePaymentSessionBody
) {
  return apiPost("/api/checkout/session", data, { schema: createPaymentSessionResponseSchema });
}

export async function confirmPayment(data: { orderId: string; transactionId?: string }) {
  return apiPost("/api/checkout/confirm", data, { schema: confirmPaymentResponseSchema });
}

