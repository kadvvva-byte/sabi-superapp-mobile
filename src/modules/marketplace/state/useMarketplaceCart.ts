import { useMemo, useState } from "react";

import type { SilkRoadCartLine, SilkRoadProduct } from "../domain/marketplace.types";

export function useMarketplaceCart(products: SilkRoadProduct[]) {
  const [lines, setLines] = useState<SilkRoadCartLine[]>([]);

  const addProduct = (product: SilkRoadProduct, variant?: string) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id && line.variant === variant);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id && line.variant === variant
            ? { ...line, quantity: line.quantity + product.minQuantity }
            : line,
        );
      }

      return [...current, { productId: product.id, quantity: product.minQuantity, variant }];
    });
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    setLines((current) =>
      current
        .map((line) =>
          line.productId === productId && line.variant === variant
            ? { ...line, quantity: Math.max(0, quantity) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const detailedLines = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((item) => item.id === line.productId);
          if (!product) return null;
          return { ...line, product };
        })
        .filter(Boolean) as Array<SilkRoadCartLine & { product: SilkRoadProduct }>,
    [lines, products],
  );

  const totalByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    detailedLines.forEach((line) => {
      const current = totals.get(line.product.currency) ?? 0;
      totals.set(line.product.currency, current + line.product.priceFrom * line.quantity);
    });
    return Array.from(totals.entries()).map(([currency, amount]) => ({ currency, amount }));
  }, [detailedLines]);

  return {
    lines,
    detailedLines,
    totalByCurrency,
    addProduct,
    updateQuantity,
    isEmpty: lines.length === 0,
  };
}
