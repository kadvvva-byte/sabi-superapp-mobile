import { useMemo, useState } from "react";

import {
  calculateCheckoutPreview,
  getProductById,
} from "../application/supermarket.service";
import type {
  SupermarketCartItem,
  SupermarketCheckoutPreview,
  SupermarketDeliveryMethod,
  SupermarketPaymentMethod,
  SupermarketProduct,
  SupermarketStore,
} from "../domain/supermarket.types";

export type SupermarketCartProductLine = {
  product: SupermarketProduct;
  quantity: number;
  lineTotal: number;
};

export function useSupermarketCart(selectedStore?: SupermarketStore) {
  const [items, setItems] = useState<SupermarketCartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("Текущая локация");
  const [paymentMethod, setPaymentMethod] = useState<SupermarketPaymentMethod>("sabi_wallet");
  const [deliveryMethod, setDeliveryMethod] = useState<SupermarketDeliveryMethod>("delivery");
  const [checkoutNotice, setCheckoutNotice] = useState("");

  const lines = useMemo<SupermarketCartProductLine[]>(() => {
    return items
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          product,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter((line): line is SupermarketCartProductLine => Boolean(line));
  }, [items]);

  const productTotals = useMemo(() => lines.reduce((sum, line) => sum + line.lineTotal, 0), [lines]);

  const checkout = useMemo<SupermarketCheckoutPreview>(() => {
    return calculateCheckoutPreview({
      productTotals,
      deliveryFee: deliveryMethod === "delivery" ? selectedStore?.deliveryFee ?? 0 : 0,
      serviceFeePercent: selectedStore?.serviceFeePercent ?? 0,
    });
  }, [deliveryMethod, productTotals, selectedStore]);

  const addProduct = (product: SupermarketProduct) => {
    if (product.compliance.restricted || product.stock <= 0) return;

    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { productId: product.id, quantity: 1 }];
    });
  };

  const decreaseProduct = (productId: string) => {
    setItems((current) => current
      .map((item) => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0));
  };

  const getQuantity = (productId: string) => items.find((item) => item.productId === productId)?.quantity ?? 0;

  const prepareCheckoutPreview = (message: string) => {
    setCheckoutNotice(message);
  };

  return {
    items,
    lines,
    productTotals,
    checkout,
    deliveryAddress,
    setDeliveryAddress,
    paymentMethod,
    setPaymentMethod,
    deliveryMethod,
    setDeliveryMethod,
    checkoutNotice,
    prepareCheckoutPreview,
    addProduct,
    decreaseProduct,
    getQuantity,
  };
}
