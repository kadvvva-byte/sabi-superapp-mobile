# Sabi Hotel / Гостиница — STEP HOTEL-1

This module replaces the old generic presentation placeholder at `/hotels` with a premium Hotel foundation.

## Rules

- No fake booking success.
- No fake payment success.
- No fake provider connected state.
- No room-reserved state until backend/provider exists.
- Hotel owner/merchant flow must go through Business Account + Business Merchant + KYB/KYC + Admin approval.
- Customer communication goes through Messenger.
- Promotion/live advertising goes through Stream / Business Stream.
- Location should connect later to Sabi Map / Yandex layer.
- QR should later support hotel, room, and payment flows.

## Files

- `app/hotels.tsx`
- `src/modules/hotels/domain/hotel.types.ts`
- `src/modules/hotels/data/hotel.local.ts`
- `src/modules/hotels/application/hotel.service.ts`
- `src/modules/hotels/presentation/hotel.i18n.ts`
- `src/modules/hotels/screens/HotelScreen.tsx`
- `assets/images/hotels/*.png`

## Next steps

- HOTEL-2: real Sabi Map layer for hotel search.
- HOTEL-3: hotel detail + room gallery deep screen.
- HOTEL-4: Business Merchant / Wallet / COIN payment contract.
- HOTEL-5: hotel owner onboarding through Business Account and Admin approval.
