import { useMemo, useState } from "react";

import type {
  SupermarketCartLine,
  SupermarketCartSummary,
  SupermarketDeliverySlot,
  SupermarketProduct,
} from "../domain/supermarket.types";

export type SupermarketCartController = {
  lines: SupermarketCartLine[];
  summary: SupermarketCartSummary;
  addProduct: (product: SupermarketProduct) => void;
  removeProduct: (productId: string) => void;
  setQuantity: (product: SupermarketProduct, quantity: number) => void;
  getQuantity: (productId: string) => number;
  clearCart: () => void;
};

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.min(99, Math.floor(quantity)));
}

export function useSupermarketCart(deliverySlot: SupermarketDeliverySlot): SupermarketCartController {
  const [lines, setLines] = useState<SupermarketCartLine[]>([]);

  const setQuantity = (product: SupermarketProduct, quantity: number) => {
    const nextQuantity = clampQuantity(quantity);

    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);

      if (!existing && nextQuantity <= 0) return current;

      if (!existing) {
        return [...current, { product, quantity: nextQuantity }];
      }

      if (nextQuantity <= 0) {
        return current.filter((line) => line.product.id !== product.id);
      }

      return current.map((line) => (
        line.product.id === product.id ? { ...line, quantity: nextQuantity } : line
      ));
    });
  };

  const addProduct = (product: SupermarketProduct) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      return current.map((line) => (
        line.product.id === product.id
          ? { ...line, quantity: clampQuantity(line.quantity + 1) }
          : line
      ));
    });
  };

  const removeProduct = (productId: string) => {
    setLines((current) => current
      .map((line) => (
        line.product.id === productId
          ? { ...line, quantity: clampQuantity(line.quantity - 1) }
          : line
      ))
      .filter((line) => line.quantity > 0));
  };

  const getQuantity = (productId: string) => {
    return lines.find((line) => line.product.id === productId)?.quantity ?? 0;
  };

  const clearCart = () => setLines([]);

  const summary = useMemo<SupermarketCartSummary>(() => {
    const itemsCount = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce((total, line) => total + (line.product.price * line.quantity), 0);
    const deliveryFee = itemsCount > 0 ? deliverySlot.fee : 0;

    return {
      itemsCount,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  }, [deliverySlot.fee, lines]);

  return {
    lines,
    summary,
    addProduct,
    removeProduct,
    setQuantity,
    getQuantity,
    clearCart,
  };
}
