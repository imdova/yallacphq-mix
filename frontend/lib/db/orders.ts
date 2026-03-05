import type { CreateOrderInput, Order, UpdateOrderInput } from "@/types/order";
import { delay } from "./delay";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

let store: Order[] = [
  {
    id: "1001",
    studentName: "Omar Hassan",
    studentEmail: "omar@example.com",
    studentPhone: "+20 101 234 5678",
    courseTitle: "Quality Management",
    currency: "USD",
    amount: 2499,
    discountAmount: 0,
    provider: "paymob",
    paymentMethod: "card",
    status: "paid",
    transactionId: "PMB-TRX-9S1K2",
    createdAt: "2026-02-26T09:20:00Z",
    updatedAt: "2026-02-26T09:20:00Z",
    paidAt: "2026-02-26T09:21:00Z",
  },
  {
    id: "1002",
    studentName: "Lina Al-Rashid",
    studentEmail: "lina@example.com",
    studentPhone: "",
    courseTitle: "CPHQ Exam Prep",
    currency: "USD",
    amount: 2999,
    discountAmount: 300,
    promoCode: "WELCOME10",
    provider: "paymob",
    paymentMethod: "wallet",
    status: "pending",
    transactionId: "PMB-TRX-1P2Q3",
    createdAt: "2026-02-27T13:05:00Z",
    updatedAt: "2026-02-27T13:05:00Z",
  },
  {
    id: "1003",
    studentName: "Sarah Chen",
    studentEmail: "sarah@example.com",
    studentPhone: "+20 100 123 4567",
    courseTitle: "Patient Safety",
    currency: "USD",
    amount: 1799,
    discountAmount: 0,
    provider: "stripe",
    paymentMethod: "card",
    status: "failed",
    transactionId: "STR-TRX-7T4V1",
    createdAt: "2026-02-20T18:40:00Z",
    updatedAt: "2026-02-20T18:41:00Z",
  },
  {
    id: "1004",
    studentName: "Ahmed Nasser",
    studentEmail: "ahmed@example.com",
    studentPhone: "+20 102 111 2233",
    courseTitle: "Compliance",
    currency: "USD",
    amount: 1299,
    discountAmount: 0,
    provider: "manual",
    paymentMethod: "cash",
    status: "paid",
    transactionId: "MAN-REC-004",
    createdAt: "2026-02-12T11:15:00Z",
    updatedAt: "2026-02-12T11:15:00Z",
    paidAt: "2026-02-12T11:15:00Z",
  },
  {
    id: "1005",
    studentName: "Mona El-Sayed",
    studentEmail: "mona@example.com",
    studentPhone: "+20 109 555 0001",
    courseTitle: "Data Analysis",
    currency: "USD",
    amount: 1999,
    discountAmount: 0,
    provider: "paymob",
    paymentMethod: "card",
    status: "refunded",
    transactionId: "PMB-TRX-R3F2N",
    createdAt: "2026-02-10T15:30:00Z",
    updatedAt: "2026-02-18T10:00:00Z",
    paidAt: "2026-02-10T15:31:00Z",
    refundedAt: "2026-02-18T10:00:00Z",
  },
];

function nextId(): string {
  const max = store.reduce((acc, o) => Math.max(acc, Number(o.id) || 0), 1000);
  return String(max + 1);
}

export async function fetchOrders(): Promise<Order[]> {
  await delay(250);
  return store.map(clone).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  await delay(120);
  const order = store.find((o) => o.id === id);
  return order ? clone(order) : null;
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  await delay(220);
  const now = new Date().toISOString();
  const order: Order = {
    id: nextId(),
    studentName: data.studentName,
    studentEmail: data.studentEmail,
    studentPhone: data.studentPhone,
    courseTitle: data.courseTitle,
    currency: data.currency ?? "USD",
    amount: data.amount,
    discountAmount: data.discountAmount ?? 0,
    promoCode: data.promoCode,
    provider: data.provider ?? "manual",
    paymentMethod: data.paymentMethod,
    status: data.status ?? "pending",
    transactionId: data.transactionId,
    courseIds: data.courseIds,
    bankTransferProofUrl: data.bankTransferProofUrl,
    createdAt: now,
    updatedAt: now,
    paidAt: data.paidAt,
    refundedAt: data.refundedAt,
  };
  store = [order, ...store];
  return clone(order);
}

export async function updateOrder(id: string, data: UpdateOrderInput): Promise<Order | null> {
  await delay(220);
  const idx = store.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const prev = store[idx];
  const updated: Order = {
    ...prev,
    ...data,
    currency: data.currency ?? prev.currency,
    provider: data.provider ?? prev.provider,
    status: data.status ?? prev.status,
    updatedAt: new Date().toISOString(),
  };
  store = store.map((o) => (o.id === id ? updated : o));
  return clone(updated);
}

export async function removeOrder(id: string): Promise<boolean> {
  await delay(200);
  const before = store.length;
  store = store.filter((o) => o.id !== id);
  return store.length !== before;
}

