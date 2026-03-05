"use client";

import * as React from "react";
import { getCart, addToCart as addToCartApi, removeFromCart as removeFromCartApi, clearCart as clearCartApi } from "@/lib/dal/cart";
import { useAuth } from "@/contexts/auth-context";

type CartContextValue = {
  courseIds: string[];
  loading: boolean;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [courseIds, setCourseIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refreshCart = React.useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getCart();
      setCourseIds(ids);
    } catch {
      setCourseIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "authenticated") {
      void refreshCart();
    } else {
      setCourseIds([]);
      setLoading(false);
    }
  }, [status, refreshCart]);

  const addToCart = React.useCallback(async (courseId: string) => {
    try {
      const ids = await addToCartApi(courseId);
      setCourseIds(ids);
    } catch {
      // Keep current state; caller can show toast
    }
  }, []);

  const removeFromCart = React.useCallback(async (courseId: string) => {
    try {
      const ids = await removeFromCartApi(courseId);
      setCourseIds(ids);
    } catch {
      // Keep current state
    }
  }, []);

  const clearCart = React.useCallback(async () => {
    try {
      await clearCartApi();
      setCourseIds([]);
    } catch {
      setCourseIds([]);
    }
  }, []);

  const isInCart = React.useCallback(
    (courseId: string) => courseIds.includes(courseId),
    [courseIds]
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      courseIds,
      loading,
      addToCart,
      removeFromCart,
      refreshCart,
      clearCart,
      isInCart,
    }),
    [courseIds, loading, addToCart, removeFromCart, refreshCart, clearCart, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    return {
      courseIds: [] as string[],
      loading: false,
      addToCart: async () => {},
      removeFromCart: async () => {},
      refreshCart: async () => {},
      clearCart: async () => {},
      isInCart: () => false,
    };
  }
  return ctx;
}
