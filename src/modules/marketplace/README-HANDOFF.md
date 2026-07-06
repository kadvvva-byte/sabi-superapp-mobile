# STEP 2A — SilkRoad / Шёлковый путь Premium Foundation

This module keeps the technical route as `marketplace`, while the user-facing title is localized:

- `ru`: `Шёлковый путь`
- `en`: `SilkRoad`
- `uz`: `Ipak yo‘li`
- `zh`: `丝绸之路`


## Rules frozen in this step

1. UI uses milky/off-white base with warm gold top and bottom accents.
2. No hardcoded foreign currency in prices. UI uses COIN preview or seller-defined price until Business Merchant / Wallet currency rules are connected.
3. All visible marketplace text is routed through shared i18n file `src/shared/i18n/silkroad-mobile-translations.ts`; module file `presentation/marketplace.i18n.ts` only re-exports it for marketplace screens and Home widgets.
4. Buyer/seller chat goes through Messenger, not a separate marketplace chat.
5. Product live promotion goes through Stream / Business Stream, not a separate marketplace stream. Marketplace does not create its own chat or stream.
6. Payment/settlement goes through Business Account + Business Merchant + Wallet/Sabi Pay.
7. Sale and purchase are blocked until AML/KYC/KYB and required documents are approved.
8. High-risk categories such as chemicals, metals, petroleum products, gold/jewelry and precious stones are visible as controlled categories but do not show fake checkout/payment success.

## Files

- `app/marketplace.tsx` opens the new SilkRoad screen.
- `domain/marketplace.types.ts` defines categories, products, manufacturers, verification and gate contracts.
- `data/marketplace.local.ts` provides local UI seed data only; it is not fake order/payment execution.
- `application/marketplace.service.ts` keeps filtering and verification state logic separate from UI.
- `state/useMarketplaceCart.ts` is a local cart preview state, not a payment/order engine.
- `src/shared/i18n/silkroad-mobile-translations.ts` owns display names, localized UI text and price formatting. `presentation/marketplace.i18n.ts` is a module-facing re-export.
- `screens/MarketplaceScreen.tsx` renders the premium mobile UI and routes to Messenger / Stream / Business / Merchant / Wallet / Admin / QR.

## Backend handoff

When backend is ready, replace local seeds with provider-backed endpoints while preserving these contracts:

- categories with subcategories and risk levels
- manufacturer/seller verification state
- product document state
- buyer KYC/AML/KYB state
- purchaseAllowed / sellingAllowed / paymentAllowed / payoutAllowed
- checkoutBlockedReason
- Admin compliance state
