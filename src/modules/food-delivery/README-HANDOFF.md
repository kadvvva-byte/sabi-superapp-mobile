# HOTEL-1 follow-up: FOOD-DELIVERY-1 Premium Foundation

This changed-files-only package adds the first premium mobile foundation for Sabi Food Delivery. It replaces the old placeholder `/food-delivery` route with a real local UI module while keeping backend/provider actions honest.

## Included

- `/app/food-delivery.tsx` route entry
- `src/modules/food-delivery/domain` contracts
- `src/modules/food-delivery/data` local seed data
- `src/modules/food-delivery/application` selectors and gates
- `src/modules/food-delivery/presentation` module i18n
- `src/modules/food-delivery/screens/FoodDeliveryScreen.tsx` premium UI
- `assets/images/food-delivery/*.png` local visual assets

## Product rules

Food Delivery must not show fake order success, fake payment success, fake courier tracking, or fake provider connection. Current UI allows local cart/request preview only.

## Sabi ecosystem routes

- Customer/restaurant communication: Messenger
- Restaurant promotion: Stream / Business Stream
- Restaurant onboarding: Business Account + KYB/KYC/Admin approval
- Payment acceptance: Business Merchant + Wallet / COIN
- Location/delivery zones: Sabi Map / Yandex layer
- Future order QR: QR module

## Next steps

1. FOOD-DELIVERY-2: restaurant detail and menu categories
2. FOOD-DELIVERY-3: address/location + Sabi Map layer
3. FOOD-DELIVERY-4: cart request + Business Merchant payment gate
4. FOOD-DELIVERY-5: restaurant owner onboarding handoff
5. FOOD-DELIVERY-6: Messenger and Business Stream route refinement
