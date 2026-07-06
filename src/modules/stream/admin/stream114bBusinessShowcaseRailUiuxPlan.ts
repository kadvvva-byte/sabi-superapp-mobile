export const STREAM_114B_BUSINESS_SHOWCASE_RAIL_UIUX_PLAN = {
  version: "STREAM-114B",
  title: "Business Stream showcase rail UI/UX",
  scope: [
    "Business showcase/product-service rail UI/UX only",
    "Preview cards, category filters, request-price/contact intents",
    "Kernel-only contracts/facades/events boundary",
    "No fake stock, no fake checkout, no Wallet/Merchant, no gifts yet",
  ],
  order: "After 114A Business main screen, continue showcase rail before host tools and profile screens.",
  forbidden: [
    "direct provider connection",
    "direct realtime connection",
    "scattered service connection",
    "fake order",
    "fake checkout",
    "fake payment",
    "fake invoice",
    "fake stock",
    "fake delivery",
    "fake gift sending",
  ],
} as const;
