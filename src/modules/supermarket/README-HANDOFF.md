# Sabi Supermarket + Sabi Map Foundation

This package creates the real first foundation for the Supermarket module and the reusable Sabi Map Layer.

## Product direction

Supermarket is not a generic product list. It is a local commerce and grocery delivery platform inside Sabi:

1. The customer opens Supermarket.
2. If location is available, the first screen shows nearby Sabi-connected stores on a map/list.
3. Only approved Sabi stores appear; the base map can later be Yandex, but store data belongs to Sabi.
4. The customer chooses the nearest store or the store that has the needed products.
5. The store catalog opens with `Products` as the default first department.
6. The cart contains products, delivery address/location, payment method and order preview.
7. The final action stays pending until backend, Wallet and Merchant Account are connected.

## Store departments

Departments are separate:

- Products
- Household goods
- Household chemicals
- Home goods / hoz-tovary
- Alcohol
- Tobacco

Alcohol and tobacco are compliance-gated and must remain locked until legal, country, age, KYC and merchant license checks are implemented.

## Mandatory integrations later

- Wallet: payment and merchant payouts
- Business Account: legal profile and verification
- Business Merchant Account: payment acceptance, settlement and commission
- Messenger: buyer-store communication
- QR: store/product/payment QR
- Admin: approval, risk, compliance, commission and violations

## Reusable map strategy

`src/modules/sabi-map` is a reusable Sabi Map Layer. It currently renders a premium Sabi-style map preview. Later the base map layer can be replaced by Yandex Maps while keeping the Sabi UI, markers, filters and business logic.

Future modules should reuse this layer:

- Supermarket
- Taxi
- Delivery
- Marketplace pickup points
- Hotels
- WiFi
- Stream locations

## Files in this step

- `app/supermarket.tsx`
- `src/modules/sabi-map/domain/sabiMap.types.ts`
- `src/modules/sabi-map/data/sabiMap.local.ts`
- `src/modules/sabi-map/application/sabiMap.service.ts`
- `src/modules/sabi-map/presentation/sabiMap.i18n.ts`
- `src/modules/sabi-map/components/SabiMapView.tsx`
- `src/modules/sabi-map/components/SabiMapMarker.tsx`
- `src/modules/sabi-map/components/SabiMapStoreCard.tsx`
- `src/modules/supermarket/domain/supermarket.types.ts`
- `src/modules/supermarket/data/supermarket.local.ts`
- `src/modules/supermarket/application/supermarket.service.ts`
- `src/modules/supermarket/state/useSupermarketCart.ts`
- `src/modules/supermarket/presentation/supermarket.i18n.ts`
- `src/modules/supermarket/screens/SupermarketScreen.tsx`
- `src/modules/supermarket/README-HANDOFF.md`
